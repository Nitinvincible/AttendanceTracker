import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Company, User
from schemas import SettingsUpdate, CompanyResponse, CustomLabels
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/", response_model=CompanyResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    labels = None
    if company.custom_labels:
        try:
            labels = CustomLabels(**json.loads(company.custom_labels))
        except Exception:
            labels = None

    return CompanyResponse(
        id=company.id,
        name=company.name,
        theme_id=company.theme_id,
        custom_labels=labels,
    )


@router.put("/", response_model=CompanyResponse)
def update_settings(
    data: SettingsUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()

    if data.theme_id is not None:
        company.theme_id = data.theme_id

    if data.custom_labels is not None:
        company.custom_labels = json.dumps(data.custom_labels.model_dump())

    db.commit()
    db.refresh(company)

    labels = None
    if company.custom_labels:
        try:
            labels = CustomLabels(**json.loads(company.custom_labels))
        except Exception:
            labels = None

    return CompanyResponse(
        id=company.id,
        name=company.name,
        theme_id=company.theme_id,
        custom_labels=labels,
    )
