from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Student, Attendance, AttendanceStatus
from schemas import DashboardStats, WeeklyData
from datetime import date, timedelta
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    total_students = db.query(Student).count()

    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    present_today = sum(1 for r in today_records if r.status == AttendanceStatus.present)
    absent_today = sum(1 for r in today_records if r.status == AttendanceStatus.absent)

    attendance_percentage = (present_today / total_students * 100) if total_students > 0 else 0

    return DashboardStats(
        total_students=total_students,
        present_today=present_today,
        absent_today=absent_today,
        attendance_percentage=round(attendance_percentage, 1)
    )


@router.get("/weekly", response_model=List[WeeklyData])
def get_weekly_data(db: Session = Depends(get_db)):
    today = date.today()
    result = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        records = db.query(Attendance).filter(Attendance.date == day).all()
        present = sum(1 for r in records if r.status == AttendanceStatus.present)
        absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
        result.append(WeeklyData(
            date=day.strftime("%a %d"),
            present=present,
            absent=absent,
            total=present + absent
        ))

    return result
