from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.services.pdf_service import create_pitch_deck

router = APIRouter()

class ExportRequest(BaseModel):
    data: dict

@router.post("/export/pdf")
def export_pdf(request: ExportRequest):
    filepath, filename = create_pitch_deck(request.data)
    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=filename
    )