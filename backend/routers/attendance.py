from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Attendance, Student
from schemas import AttendanceBulkCreate, AttendanceResponse
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("/", response_model=List[AttendanceResponse], status_code=201)
def mark_attendance(payload: AttendanceBulkCreate, db: Session = Depends(get_db)):
    # Delete existing records for that date to allow re-submission
    db.query(Attendance).filter(Attendance.date == payload.date).delete()
    db.commit()

    records = []
    for rec in payload.records:
        student = db.query(Student).filter(Student.id == rec.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {rec.student_id} not found")
        att = Attendance(student_id=rec.student_id, date=payload.date, status=rec.status)
        db.add(att)
        records.append(att)

    db.commit()
    for r in records:
        db.refresh(r)
    return records


@router.get("/", response_model=List[AttendanceResponse])
def get_attendance_by_date(
    date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Attendance)
    if date:
        query = query.filter(Attendance.date == date)
    return query.order_by(Attendance.date.desc()).all()


@router.get("/history", response_model=List[AttendanceResponse])
def get_attendance_history(db: Session = Depends(get_db)):
    return db.query(Attendance).order_by(Attendance.date.desc()).limit(100).all()
