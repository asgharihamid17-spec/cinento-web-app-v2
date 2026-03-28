echo Starting CINENTO AI Studio...

start cmd /k "cd backend && python -m uvicorn app.main:app --reload"
start cmd /k "cd frontend && npm run dev"

echo All services started!