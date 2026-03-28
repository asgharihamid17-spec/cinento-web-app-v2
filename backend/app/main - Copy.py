from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.generate import router as generate_router
from app.api.export import router as export_router

app = FastAPI(title="CINENTO AI Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)
app.include_router(export_router)

@app.get("/")
def home():
    return {"message": "CINENTO AI Studio Backend Running"}