"""Payment Review Automation FastAPI Application Entrypoint."""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    features,
    health,
    payments,
    recommendations,
    scoring,
    simulation,
)
from app.config import get_settings
from app.utils.logging import logger

settings = get_settings()

app = FastAPI(
    title="Payment Review Automation API",
    description=(
        "Intelligent decision-support and workflow-routing service for financial payment reviews. "
        "Calculates behavioral risk features, scores anomaly indicators, and provides explainable "
        "recommendations for Power Automate and Dataverse case routing."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS for Power Platform / Azure API Management / Web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Custom Exception Handlers for Clean & Predictable Error Responses ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle 422 schema validation errors cleanly."""
    errors_list = []
    for err in exc.errors():
        field_path = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors_list.append({
            "field": field_path,
            "message": err.get("msg", "Validation error"),
            "type": err.get("type", "invalid_value"),
        })

    logger.warning(f"Validation error on {request.url.path}: {errors_list}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error_code": "VALIDATION_ERROR",
            "message": "Invalid request payload format or field constraint violated",
            "details": {"validation_errors": errors_list},
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle standard HTTP exceptions."""
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_code": f"HTTP_{exc.status_code}",
            "message": str(exc.detail),
            "details": {},
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Safely catch unhandled internal server exceptions without leaking stack trace."""
    logger.error(f"Unhandled server error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred while processing the payment review request.",
            "details": {},
        },
    )


# --- Register Routers ---
app.include_router(health.router)
app.include_router(payments.router)
app.include_router(features.router)
app.include_router(scoring.router)
app.include_router(recommendations.router)
app.include_router(simulation.router)
