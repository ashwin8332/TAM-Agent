from fastapi import APIRouter, HTTPException, Path
from src.application.account_brief_usecase import AccountBriefUseCase
from src.presentation.schemas import AccountBriefResponse

router = APIRouter(prefix="/api/v1/account", tags=["account"])

@router.get("/{account_id}/brief", response_model=AccountBriefResponse)
async def get_account_brief(
    account_id: str = Path(..., description="The ID of the account to generate a brief for")
):
    """
    Generate a deterministic 3-section account brief for a TAM.
    """
    usecase = AccountBriefUseCase()
    try:
        result = await usecase.execute(account_id=account_id)
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
