from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Attendance, Student, User
from schemas import AttendanceBulkCreate, AttendanceResponse, StudentResponse
from auth import get_current_user
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


def _student_resp(s):
    if not s:
        return None
    return StudentResponse(
        id=s.id,
        name=s.name,
        roll_number=s.roll_number,
        department_id=s.department_id,
        department_name=s.department.name if s.department else None,
        company_id=s.company_id,
        created_at=s.created_at,
    )


@router.post("/", response_model=List[AttendanceResponse], status_code=201)
def mark_attendance(
    payload: AttendanceBulkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company_id = current_user.company_id

    # Delete existing records for that date within this company
    db.query(Attendance).filter(
        Attendance.date == payload.date,
        Attendance.company_id == company_id,
    ).delete()
    db.commit()

    records = []
    for rec in payload.records:
        student = (
            db.query(Student)
            .filter(Student.id == rec.student_id, Student.company_id == company_id)
            .first()
        )
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {rec.student_id} not found")
        att = Attendance(
            student_id=rec.student_id,
            date=payload.date,
            status=rec.status,
            company_id=company_id,
        )
        db.add(att)
        records.append(att)

    db.commit()
    for r in records:
        db.refresh(r)

    return [
        AttendanceResponse(
            id=r.id,
            student_id=r.student_id,
            date=r.date,
            status=r.status,
            student=_student_resp(r.student),
        )
        for r in records
    ]


@router.get("/", response_model=List[AttendanceResponse])
def get_attendance_by_date(
    date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance).filter(Attendance.company_id == current_user.company_id)
    if date:
        query = query.filter(Attendance.date == date)
    records = query.order_by(Attendance.date.desc()).all()
    return [
        AttendanceResponse(
            id=r.id,
            student_id=r.student_id,
            date=r.date,
            status=r.status,
            student=_student_resp(r.student),
        )
        for r in records
    ]


@router.get("/history", response_model=List[AttendanceResponse])
def get_attendance_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance)
        .filter(Attendance.company_id == current_user.company_id)
        .order_by(Attendance.date.desc())
        .limit(200)
        .all()
    )
    return [
        AttendanceResponse(
            id=r.id,
            student_id=r.student_id,
            date=r.date,
            status=r.status,
            student=_student_resp(r.student),
        )
        for r in records
    ]
