from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import students, attendance, dashboard, auth, departments, settings, employees

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Attendance Tracker API",
    description="Multi-tenant attendance management API with auth",
    version="2.0.0",
)

# CORS — allow Vercel frontend + local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(departments.router)
app.include_router(settings.router)
app.include_router(employees.router)


@app.get("/")
def root():
    return {"message": "Attendance Tracker API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
