import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import get_demo_session
from database import DatabaseError, ResourceNotFoundError
from routes.accounts import router as accounts_router
from routes.analytics import router as analytics_router
from routes.csv_imports import router as csv_imports_router
from routes.trades import router as trades_router


app = FastAPI()


@app.exception_handler(DatabaseError)
async def database_error_handler(request: Request, exc: DatabaseError):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database service unavailable"},
    )


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts_router)
app.include_router(analytics_router)
app.include_router(csv_imports_router)
app.include_router(trades_router)


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.post("/demo-login")
def demo_login():
    return get_demo_session()
