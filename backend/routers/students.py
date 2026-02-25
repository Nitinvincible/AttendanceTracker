from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Student, User
from schemas import StudentCreate, StudentUpdate, StudentResponse
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/students", tags=["students"])


def _student_response(s: Student) -> StudentResponse:
    return StudentResponse(
        id=s.id,
        name=s.name,
        roll_number=s.roll_number,
        department_id=s.department_id,
        department_name=s.department.name if s.department else None,
        company_id=s.company_id,
        created_at=s.created_at,
    )


@router.get("/", response_model=List[StudentResponse])
def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    students = (
        db.query(Student)
        .filter(Student.company_id == current_user.company_id)
        .order_by(Student.created_at.desc())
        .all()
    )
    return [_student_response(s) for s in students]


@router.post("/", response_model=StudentResponse, status_code=201)
def create_student(
    student: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Student)
        .filter(
            Student.roll_number == student.roll_number,
            Student.company_id == current_user.company_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Roll number already exists")

    db_student = Student(
        name=student.name,
        roll_number=student.roll_number,
        department_id=student.department_id,
        company_id=current_user.company_id,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return _student_response(db_student)


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.company_id == current_user.company_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = (
        db.query(Student)
        .filter(
            Student.roll_number == data.roll_number,
            Student.company_id == current_user.company_id,
            Student.id != student_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Roll number already exists")

    student.name = data.name
    student.roll_number = data.roll_number
    student.department_id = data.department_id
    db.commit()
    db.refresh(student)
    return _student_response(student)


@router.delete("/{student_id}", status_code=204)
def delete_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.company_id == current_user.company_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
