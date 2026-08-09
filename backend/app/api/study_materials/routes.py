from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import File, UploadFile

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.study_material import (
    StudyMaterialCreate,
    StudyMaterialResponse,
)
from app.services.study_material_service import (
    create_material,
    get_material,
    get_materials_for_user,
    remove_material,
)

from app.services.document_service import process_uploaded_document

router = APIRouter(
    prefix="/study-materials",
    tags=["Study Materials"],
)


@router.post(
    "/",
    response_model=StudyMaterialResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    material_data: StudyMaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_material(
        db=db,
        user_id=current_user.id,
        material_data=material_data,
    )


@router.get(
    "/",
    response_model=list[StudyMaterialResponse],
)
def list_materials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_materials_for_user(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{material_id}",
    response_model=StudyMaterialResponse,
)
def get_one(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_material(
        db=db,
        material_id=material_id,
        user_id=current_user.id,
    )

    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study material not found",
        )

    return material


@router.delete(
    "/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    remove_material(
        db=db,
        material_id=material_id,
        user_id=current_user.id,
    )

@router.post(
    "/upload",
    response_model=StudyMaterialResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await process_uploaded_document(
            db=db,
            user_id=current_user.id,
            file=file,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )