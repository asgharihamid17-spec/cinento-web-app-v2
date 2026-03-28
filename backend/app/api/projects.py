import json
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.project_store import save_project, list_projects, get_project

router = APIRouter(prefix="/projects", tags=["projects"])


class SaveProjectRequest(BaseModel):
    user_id: int
    title: str
    format: str
    genre: str
    language: str
    tone: str
    setting: str
    idea: str
    output: Optional[Dict[str, Any]] = None


@router.post("/save")
def save_project_route(payload: SaveProjectRequest):
    project_id = save_project(
        payload.user_id,
        payload.model_dump(),
        json.dumps(payload.output or {}, ensure_ascii=False),
    )
    return {"success": True, "project_id": project_id}


@router.get("")
def list_projects_route(user_id: int = Query(...)):
    return {"projects": list_projects(user_id)}


@router.get("/{project_id}")
def get_project_route(project_id: int, user_id: int = Query(...)):
    project = get_project(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        project["output"] = json.loads(project["output_json"] or "{}")
    except Exception:
        project["output"] = {}

    return project