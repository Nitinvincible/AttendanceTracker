import secrets
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole, Department
from schemas import EmployeeCreate, EmployeeResponse
from auth import hash_password, get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/api/employees", tags=["employees"])


def generate_password(length: int = 10) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employees = (
        db.query(User)
        .filter(User.company_id == current_user.company_id, User.role == UserRole.employee)
        .order_by(User.created_at.desc())
        .all()
    )
    result = []
    for emp in employees:
        dept_name = emp.department.name if emp.department else None
        result.append(
            EmployeeResponse(
                id=emp.id,
                name=emp.name,
                email=emp.email,
                role=emp.role,
                department_id=emp.department_id,
                department_name=dept_name,
            )
        )
    return result


@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee(
    data: EmployeeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    # Check email uniqueness within company
    existing = (
        db.query(User)
        .filter(User.email == data.email, User.company_id == current_user.company_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered in this company")

    # Validate department belongs to company
    if data.department_id:
        dept = (
            db.query(Department)
            .filter(
                Department.id == data.department_id,
                Department.company_id == current_user.company_id,
            )
            .first()
        )
        if not dept:
            raise HTTPException(status_code=400, detail="Department not found")

    raw_password = generate_password()
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(raw_password),
        role=UserRole.employee,
        company_id=current_user.company_id,
        department_id=data.department_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    dept_name = user.department.name if user.department else None
    return EmployeeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department_id=user.department_id,
        department_name=dept_name,
        generated_password=raw_password,
    )


@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.id == employee_id,
            User.company_id == current_user.company_id,
            User.role == UserRole.employee,
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(user)
    db.commit()
