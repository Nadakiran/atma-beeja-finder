from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from server.chart import compute_chart

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"

app = FastAPI(title="Atma Beeja")


class ChartIn(BaseModel):
    year: int = Field(ge=1, le=2399)
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)
    second: int = Field(default=0, ge=0, le=59)
    latitude: float = Field(ge=-89.9, le=89.9)
    longitude: float = Field(ge=-180, le=180)
    timezone: str | None = None
    place: str | None = None
    timeUnknown: bool = False
    node: str = "mean"


@app.get("/api/health")
def health():
    return {"ok": True, "ayanamsha": "JN Bhasin"}


@app.post("/api/chart")
def chart(body: ChartIn):
    try:
        return compute_chart(
            body.year,
            body.month,
            body.day,
            body.hour,
            body.minute,
            body.second,
            body.latitude,
            body.longitude,
            body.timezone,
            body.place,
            body.timeUnknown,
            "true" if body.node == "true" else "mean",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Chart could not be computed: {exc}") from exc


@app.get("/")
def index():
    return FileResponse(WEB / "index.html")


app.mount("/", StaticFiles(directory=WEB), name="web")
