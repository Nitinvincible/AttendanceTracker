from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Company, UserRole
from schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Check if company name already exists
    existing_company = db.query(Company).filter(Company.name == data.company_name).first()
    if existing_company:
        raise HTTPException(status_code=400, detail="Company name already registered")

    # Check if email exists globally
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create company
    company = Company(name=data.company_name, theme_id=data.theme_id)
    db.add(company)
    db.flush()

    # Create admin user
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.admin,
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(company)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            company_id=company.id,
            company_name=company.name,
        ),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # Find company
    company = db.query(Company).filter(Company.name == data.company_name).first()
    if not company:
        raise HTTPException(status_code=401, detail="Invalid company name")

    # Find user within that company
    user = (
        db.query(User)
        .filter(User.email == data.email, User.company_id == company.id)
        .first()
    )
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    dept_name = user.department.name if user.department else None
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            company_id=company.id,
            company_name=company.name,
            department_id=user.department_id,
            department_name=dept_name,
        ),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    company = current_user.company
    dept_name = current_user.department.name if current_user.department else None
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        company_id=current_user.company_id,
        company_name=company.name if company else "",
        department_id=current_user.department_id,
        department_name=dept_name,
    )
