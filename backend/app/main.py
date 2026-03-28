from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.generate import router as generate_router
from app.api.export import router as export_router
from app.api.projects import router as projects_router
from app.api.auth import router as auth_router
from app.services.project_store import init_db
from app.services.auth_store import init_auth_db

app = FastAPI(title="CINENTO AI Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
init_auth_db()

app.include_router(generate_router)
app.include_router(export_router)
app.include_router(projects_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "CINENTO AI Studio Backend Running"}