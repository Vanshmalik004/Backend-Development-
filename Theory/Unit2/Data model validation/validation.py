from datetime import date
from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, EmailStr, Field

app = FastAPI()


# ---------------------------------------------------------
# 1. Pydantic model for incoming student data
# ---------------------------------------------------------
class StudentCreate(BaseModel):
    # Modern Pydantic v2 syntax (no need for `...` positional argument)
    name: str = Field(min_length=1, max_length=100)

    # Validates email format (requires `pip install email-validator`)
    email: EmailStr

    # Restricts branch to allowed values
    branch: str = Field(pattern=r"^(CSE|ECE|IT|ME|CE)$")

    # Optional field defaulting to None
    enrollment_date: Optional[date] = None


# ---------------------------------------------------------
# 2. Pydantic model for API response
# ---------------------------------------------------------
class StudentResponse(BaseModel):
    # Required for Pydantic to read attributes from custom class/ORM instances
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    branch: str
    enrollment_date: date


# ---------------------------------------------------------
# 3. Example database model
# ---------------------------------------------------------
class Student:
    _id = 0

    def __init__(
        self,
        name: str,
        email: str,
        branch: str,
        enrollment_date: Optional[date] = None,
    ):
        Student._id += 1

        self.id = Student._id
        self.name = name
        self.email = email
        self.branch = branch

        # Fallback to today's date if None is passed
        self.enrollment_date = enrollment_date or date.today()


# ---------------------------------------------------------
# 4. Create endpoint
# ---------------------------------------------------------
@app.post(
    "/students",
    response_model=StudentResponse,
    status_code=201
)
def create_student(student: StudentCreate):
    student_data = student.model_dump()
    db_student = Student(**student_data)
    return db_student