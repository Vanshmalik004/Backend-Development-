from fastapi import FastAPI

app = FastAPI(title="Student API - FastAPI")

students = [
    {"id": 1, "name": "Aarav", "course": "Backend Development"},
    {"id": 2, "name": "Diya", "course": "Backend Development"}
]

@app.get("/")
def root():
    return {
        "application": "Student API",
        "framework": "FastAPI",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/students")
def list_students():
    return students