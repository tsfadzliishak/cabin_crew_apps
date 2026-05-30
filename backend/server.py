from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date, time
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class FlightSegment(BaseModel):
    flight_number: str
    dep_airport: str
    dep_time: str
    arr_airport: str
    arr_time: str
    work_type: str = "OP"
    block_hours: Optional[str] = None
    aircraft_type: Optional[str] = None

class RosterEntry(BaseModel):
    id: Optional[str] = None
    date: str  # Format: DD-MMM-YYYY
    day: str
    duty_start_time: Optional[str] = None
    flights: List[FlightSegment] = []
    duty_end_time: Optional[str] = None
    duty_hours: Optional[str] = None
    duty_code: Optional[str] = None
    off_type: Optional[str] = None  # D, DO, DO1, AL
    is_day_off: bool = False
    
    # Calculated fields
    prep_time: Optional[str] = None  # 2 hours before first flight
    commute_time: Optional[str] = None  # 1 hour before duty start
    rest_time_to_next: Optional[str] = None  # Time until next duty

class RosterCreate(BaseModel):
    entries: List[RosterEntry]

class RosterResponse(BaseModel):
    id: str
    date: str
    day: str
    duty_start_time: Optional[str] = None
    flights: List[FlightSegment] = []
    duty_end_time: Optional[str] = None
    duty_hours: Optional[str] = None
    duty_code: Optional[str] = None
    off_type: Optional[str] = None
    is_day_off: bool = False
    prep_time: Optional[str] = None
    commute_time: Optional[str] = None
    rest_time_to_next: Optional[str] = None

# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Stewardess Roster API"}

@api_router.post("/roster", response_model=dict)
async def create_roster(roster_data: RosterCreate):
    """Create or update roster entries"""
    # Delete existing entries
    await db.roster_entries.delete_many({})
    
    # Insert new entries
    entries_to_insert = []
    for entry in roster_data.entries:
        entry_dict = entry.dict(exclude={"id"})
        entries_to_insert.append(entry_dict)
    
    if entries_to_insert:
        result = await db.roster_entries.insert_many(entries_to_insert)
        return {"message": f"Created {len(result.inserted_ids)} roster entries", "count": len(result.inserted_ids)}
    
    return {"message": "No entries to create", "count": 0}

@api_router.get("/roster", response_model=List[RosterResponse])
async def get_roster(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Get all roster entries or filter by date range"""
    query = {}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    entries = await db.roster_entries.find(query).sort("date", 1).to_list(1000)
    
    result = []
    for entry in entries:
        entry["id"] = str(entry["_id"])
        del entry["_id"]
        result.append(RosterResponse(**entry))
    
    return result

@api_router.get("/roster/today", response_model=Optional[RosterResponse])
async def get_today_roster():
    """Get today's roster entry"""
    # For demo, we'll use the first entry with flights
    entry = await db.roster_entries.find_one({"is_day_off": False})
    
    if entry:
        entry["id"] = str(entry["_id"])
        del entry["_id"]
        return RosterResponse(**entry)
    
    return None

@api_router.get("/roster/upcoming", response_model=List[RosterResponse])
async def get_upcoming_flights(limit: int = 5):
    """Get upcoming flights"""
    entries = await db.roster_entries.find({"is_day_off": False}).sort("date", 1).limit(limit).to_list(limit)
    
    result = []
    for entry in entries:
        entry["id"] = str(entry["_id"])
        del entry["_id"]
        result.append(RosterResponse(**entry))
    
    return result

@api_router.post("/roster/upload")
async def upload_roster_image(file: UploadFile = File(...)):
    """Upload roster image for OCR processing (placeholder for now)"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # For now, return a placeholder response
    # OCR implementation will be added later
    return {
        "message": "Image uploaded successfully. OCR processing will be implemented.",
        "filename": file.filename,
        "content_type": file.content_type
    }

@api_router.delete("/roster")
async def delete_all_roster():
    """Delete all roster entries"""
    result = await db.roster_entries.delete_many({})
    return {"message": f"Deleted {result.deleted_count} entries", "count": result.deleted_count}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
