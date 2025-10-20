
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="TQT API")

class EVReq(BaseModel):
    p: float
    b: float
    fees_eff: float
    funding: float
    slippage: float
    gas: float
    R_usd: float

class EVResp(BaseModel):
    costs_in_R: float
    ev_net: float

@app.get("/health")
def health(): return {"ok": True}

@app.post("/ev/calc", response_model=EVResp)
def ev_calc(req: EVReq):
    costs_in_r = (req.fees_eff + req.funding + req.slippage + req.gas) / max(req.R_usd, 1e-9)
    ev_net = req.p * req.b - (1.0 - req.p) - costs_in_r
    return {"costs_in_R": costs_in_r, "ev_net": ev_net}

class MCreq(BaseModel):
    returns_R: list[float]
    N: int = 10000
    seed: int = 42

@app.post("/mc/perm")
def mc_perm(req: MCreq):
    rng = np.random.default_rng(req.seed)
    sims = [rng.permutation(req.returns_R).sum() for _ in range(req.N)]
    import numpy as np
    p5,p50,p95 = np.percentile(sims, [5,50,95]).tolist()
    return {"p5": p5, "p50": p50, "p95": p95, "mean": float(np.mean(sims))}
