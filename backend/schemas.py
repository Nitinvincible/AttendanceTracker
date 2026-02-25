from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"


class UserRole(str, Enum):
    admin = "admin"
    employee = "employee"


# --- Auth Schemas ---

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    company_name: str
    theme_id: str = "corporate"


class LoginRequest(BaseModel):
    email: str
    password: str
    company_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    company_id: int
    company_name: str = ""
    department_id: Optional[int] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Company / Settings Schemas ---

class CustomLabels(BaseModel):
    member_label: str = "Member"
    member_label_plural: str = "Members"
    id_label: str = "ID"
    group_label: str = "Department"
    name_placeholder: str = "Enter full name"
    id_placeholder: str = "Enter ID"
    group_placeholder: str = "Enter department"


class CompanyResponse(BaseModel):
    id: int
    name: str
    theme_id: str
    custom_labels: Optional[CustomLabels] = None

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    theme_id: Optional[str] = None
    custom_labels: Optional[CustomLabels] = None


# --- Department Schemas ---

class DepartmentCreate(BaseModel):
    name: str


class DepartmentResponse(BaseModel):
    id: int
    name: str
    company_id: int

    class Config:
        from_attributes = True


# --- Employee Schemas ---

class EmployeeCreate(BaseModel):
    name: str
    email: str
    department_id: Optional[int] = None


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    generated_password: Optional[str] = None  # only returned on creation

    class Config:
        from_attributes = True


# --- Student Schemas ---

class StudentCreate(BaseModel):
    name: str
    roll_number: str
    department_id: Optional[int] = None


class StudentUpdate(BaseModel):
    name: str
    roll_number: str
    department_id: Optional[int] = None


class StudentResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    company_id: int
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
