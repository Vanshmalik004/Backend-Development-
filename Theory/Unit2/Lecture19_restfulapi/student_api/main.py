from fastapi import FastAPI, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
import math

from database import engine, get_db, Base
from models import Student, Course, Department, Enrollment
from schemas import (
    StudentCreate, StudentUpdate, StudentResponse, StudentListResponse,
    CourseCreate, CourseResponse,
    DepartmentCreate, DepartmentResponse,
    EnrollmentCreate, EnrollmentResponse,
    ErrorResponse, BranchEnum
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Management API",
    description="API for managing students, courses, and enrollments",
    version="1.0.0"
)

# ==================== STUDENTS ====================

@app.get("/students", response_model=StudentListResponse)
def list_students(
    branch: Optional[BranchEnum] = Query(None, description="Filter by branch"),
    department_id: Optional[int] = Query(None, description="Filter by department"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    
    if branch:
        query = query.filter(Student.branch == branch)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if search:
        query = query.filter(
            (Student.name.ilike(f"%{search}%")) | 
            (Student.email.ilike(f"%{search}%"))
        )
    
    total = query.count()
    total_pages = math.ceil(total / limit)
    offset = (page - 1) * limit
    
    students = query.offset(offset).limit(limit).all()
    
    return {
        "data": students,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@app.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.post("/students", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int, 
    student: StudentUpdate, 
    db: Session = Depends(get_db)
):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return None

# ==================== COURSES ====================

@app.get("/courses", response_model=List[CourseResponse])
def list_courses(
    department_id: Optional[int] = Query(None),
    credits: Optional[int] = Query(None, ge=1, le=6),
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    
    if department_id:
        query = query.filter(Course.department_id == department_id)
    if credits:
        query = query.filter(Course.credits == credits)
    
    return query.all()

@app.post("/courses", response_model=CourseResponse, status_code=201)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    existing = db.query(Course).filter(Course.id == course.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Course already exists")
    
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

# ==================== ENROLLMENTS ====================

@app.get("/students/{student_id}/enrollments", response_model=List[EnrollmentResponse])
def list_student_enrollments(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return db.query(Enrollment).filter(Enrollment.student_id == student_id).all()

@app.post(
    "/students/{student_id}/enrollments", 
    response_model=EnrollmentResponse, 
    status_code=201
)
def create_enrollment(
    student_id: int, 
    enrollment: EnrollmentCreate, 
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == enrollment.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled in this course")
    
    db_enrollment = Enrollment(
        student_id=student_id,
        **enrollment.model_dump()
    )
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

@app.delete(
    "/students/{student_id}/enrollments/{course_id}", 
    status_code=204
)
def delete_enrollment(
    student_id: int, 
    course_id: str, 
    db: Session = Depends(get_db)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    db.delete(enrollment)
    db.commit()
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
