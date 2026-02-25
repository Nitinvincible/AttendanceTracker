from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    theme_id = Column(String, nullable=False, default="corporate")
    custom_labels = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="company", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.employee)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="users")
    department = relationship("Department", back_populates="users")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="departments")
    users = relationship("User", back_populates="department")
    students = relationship("Student", back_populates="department", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    department = relationship("Department", back_populates="students")
    company = relationship("Company", back_populates="students")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="attendances")
