from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Department, User
from schemas import DepartmentCreate, DepartmentResponse
from auth import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("/", response_model=List[DepartmentResponse])
def list_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Department)
        .filter(Department.company_id == current_user.company_id)
        .order_by(Department.name)
        .all()
    )


@router.post("/", response_model=DepartmentResponse, status_code=201)
def create_department(
    data: DepartmentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    # Check duplicate name within company
    existing = (
        db.query(Department)
        .filter(
            Department.company_id == current_user.company_id,
            Department.name == data.name,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")

    dept = Department(name=data.name, company_id=current_user.company_id)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: int,
    data: DepartmentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    dept = (
        db.query(Department)
        .filter(Department.id == dept_id, Department.company_id == current_user.company_id)
        .first()
    )
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    # Check duplicate
    existing = (
        db.query(Department)
        .filter(
            Department.company_id == current_user.company_id,
            Department.name == data.name,
            Department.id != dept_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Department name already exists")

    dept.name = data.name
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/{dept_id}", status_code=204)
def delete_department(
    dept_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    dept = (
        db.query(Department)
        .filter(Department.id == dept_id, Department.company_id == current_user.company_id)
        .first()
    )
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
