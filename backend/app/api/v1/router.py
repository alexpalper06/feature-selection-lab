# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import dataset_api
# Ready for Phase 2 implementation
from app.api.v1 import feature_selector_api

router = APIRouter(prefix="/api/v1")

router.include_router(dataset_api.router)
#router.include_router(feature_selector_api.router)