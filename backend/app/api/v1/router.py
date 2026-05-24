# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import dataset_api
# Ready for Phase 2 implementation
from app.api.v1 import feature_selection_api

router = APIRouter(prefix="/api/v1")

# Includes before so fixed parts of same depth takes priority before those declared with variable
router.include_router(feature_selection_api.router)
router.include_router(dataset_api.router)
