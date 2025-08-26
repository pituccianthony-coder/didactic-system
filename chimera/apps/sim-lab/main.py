from fastapi import FastAPI
from pydantic import BaseModel
import time

app = FastAPI()

class PhysicsParams(BaseModel):
    gravity: float
    friction: float

class HexagonParams(BaseModel):
    ball_speed: float
    rotation_speed: float

class MonteCarloParams(BaseModel):
    simulations: int
    investment: float

@app.post("/run/physics")
async def run_physics(params: PhysicsParams):
    """Mocks a physics simulation."""
    time.sleep(2) # Simulate computation time
    return {
        "status": "completed",
        "results": {
            "distance_traveled": 100 * (params.gravity / 9.8),
            "final_velocity": 50 * (1 - params.friction)
        }
    }

@app.post("/run/hexagon")
async def run_hexagon(params: HexagonParams):
    """Mocks a hexagon simulation."""
    time.sleep(3) # Simulate computation time
    return {
        "status": "completed",
        "results": {
            "trajectory_points": 5000,
            "average_bounce_angle": 45.3,
            "csv_export_path": "/sim_data/hexagon_123.csv"
        }
    }

@app.post("/run/montecarlo")
async def run_montecarlo(params: MonteCarloParams):
    """Mocks a Monte Carlo simulation."""
    time.sleep(1.5) # Simulate computation time
    return {
        "status": "completed",
        "results": {
            "runs": params.simulations,
            "mean_return": params.investment * 1.08,
            "confidence_interval_95": [params.investment * 0.95, params.investment * 1.21]
        }
    }

@app.get("/healthz")
def health_check():
    return {"status": "ok"}
