from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"


# --- Student Schemas ---

class StudentCreate(BaseModel):
    name: str
    roll_number: str
    department: str


class StudentResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    department: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Attendance Schemas ---

class AttendanceRecord(BaseModel):
    student_id: int
    status: AttendanceStatus


class AttendanceBulkCreate(BaseModel):
    date: date
    records: List[AttendanceRecord]


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    date: date
    status: AttendanceStatus
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---

class DashboardStats(BaseModel):
    total_students: int
    present_today: int
    absent_today: int
    attendance_percentage: float


class WeeklyData(BaseModel):
    date: str
    present: int
    absent: int
    total: int
