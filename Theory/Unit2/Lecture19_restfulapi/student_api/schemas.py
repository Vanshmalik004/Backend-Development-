from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class BranchEnum(str, Enum):
    CSE = "CSE"
    ECE = "ECE"
    IT = "IT"
    ME = "ME"
    CE = "CE"

# Department schemas
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Student schemas
class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    branch: BranchEnum

class StudentCreate(StudentBase):
    department_id: Optional[int] = None
    enrollment_date: Optional[date] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    branch: Optional[BranchEnum] = None
    department_id: Optional[int] = None

class StudentResponse(StudentBase):
    id: int
    enrollment_date: Optional[date]
    department_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class StudentListResponse(BaseModel):
    data: List[StudentResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Course schemas
class CourseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    credits: int = Field(..., ge=1, le=6)

class CourseCreate(CourseBase):
    department_id: Optional[int] = None

class CourseResponse(CourseBase):
    id: str
    department_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Enrollment schemas
class EnrollmentCreate(BaseModel):
    course_id: str
    semester: str
    grade: Optional[str] = None

class EnrollmentResponse(BaseModel):
    student_id: int
    course_id: str
    semester: str
    grade: Optional[str]
    enrolled_at: datetime
    
    class Config:
        from_attributes = True

# Error schema
class ErrorResponse(BaseModel):
    error: dict
