from fastapi import APIRouter, Depends
from clerk_backend_api import verify_clerk_token

router = APIRouter()

@router.get("/me")
async def get_current_user(payload: dict = Depends(verify_clerk_token)):
    return {
        "id": payload["sub"],
        "email": payload.get("email_addresses", ["N/A"])[0],
        "username": payload.get("username", "N/A")
    }
