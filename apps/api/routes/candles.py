"""
Candles API Routes - endpoints для получения исторических данных.

Provides:
- GET /candles/{market}/{interval} - получить свечи с кэшированием
- POST /candles/batch - получить несколько рынков одновременно
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from core.data.hyperliquid_client import HyperliquidClient

router = APIRouter(prefix="/api/candles", tags=["candles"])

# Will be set from main.py
data_manager = None


class CandleResponse(BaseModel):
    """Response with candle data."""
    market: str
    interval: str
    candles: List[Dict[str, Any]]
    from_cache: bool
    count: int


class BatchCandleRequest(BaseModel):
    """Request for multiple markets at once."""
    markets: List[str] = Field(..., description="List of markets (e.g. ['BTC-PERP', 'ETH-PERP'])")
    interval: str = Field(..., description="Interval (1m, 5m, 15m, 1h, 4h, 1d)")
    days_back: int = Field(default=30, ge=1, le=365, description="Number of days to fetch")


class BatchCandleResponse(BaseModel):
    """Response with data for multiple markets."""
    data: Dict[str, CandleResponse]
    total_candles: int


@router.get("/{market}/{interval}")
async def get_candles(
    market: str,
    interval: str,
    days_back: int = Query(default=7, ge=1, le=365, description="Days of history"),
    force_refresh: bool = Query(default=False, description="Force fetch from API")
) -> CandleResponse:
    """
    Get historical candle data for a market.
    
    This endpoint:
    1. Checks local cache first
    2. Fetches from Hyperliquid if needed
    3. Stores in cache for future requests
    4. Returns incremental updates
    
    Args:
        market: Market symbol (e.g. 'BTC-PERP', 'ETH-PERP')
        interval: Timeframe (1m, 5m, 15m, 1h, 4h, 1d)
        days_back: Number of days of historical data
        force_refresh: Force fetch from API ignoring cache
    
    Returns:
        CandleResponse with candles array
    """
    try:
        # Extract coin from market (BTC-PERP -> BTC)
        coin = market.replace('-PERP', '')
        
        # Calculate timestamps
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=days_back)).timestamp() * 1000)
        
        # Use DataManager which handles caching automatically
        try:
            df = data_manager.get_candles(
                market=market,
                interval=interval,
                days_back=days_back,
                force_refresh=force_refresh
            )
            
            # Get cache status from DataManager
            from_cache = data_manager.last_from_cache
            
            if df is None or len(df) == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"No data found for {market} {interval}"
                )
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch candles: {str(e)}"
            )
        
        # Convert to response format
        candles = df.to_dict('records')
        
        return CandleResponse(
            market=market,
            interval=interval,
            candles=candles,
            from_cache=False,
            count=len(candles)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch candles: {str(e)}"
        )


@router.post("/batch")
async def get_candles_batch(request: BatchCandleRequest) -> BatchCandleResponse:
    """
    Get candles for multiple markets at once.
    
    More efficient than multiple individual requests.
    
    Args:
        request: BatchCandleRequest with markets list
    
    Returns:
        BatchCandleResponse with data for all markets
    """
    results = {}
    total_candles = 0
    
    for market in request.markets:
        try:
            candle_response = await get_candles(
                market=market,
                interval=request.interval,
                days_back=request.days_back,
                force_refresh=False
            )
            results[market] = candle_response
            total_candles += candle_response.count
        except HTTPException as e:
            # Include error in response but don't fail entire request
            results[market] = CandleResponse(
                market=market,
                interval=request.interval,
                candles=[],
                from_cache=False,
                count=0
            )
    
    return BatchCandleResponse(
        data=results,
        total_candles=total_candles
    )


@router.get("/intervals")
async def get_supported_intervals() -> Dict[str, Any]:
    """Get list of supported intervals."""
    return {
        "intervals": HyperliquidClient.VALID_INTERVALS,
        "description": {
            "1m": "1 minute",
            "5m": "5 minutes",
            "15m": "15 minutes",
            "1h": "1 hour",
            "4h": "4 hours",
            "1d": "1 day"
        }
    }

