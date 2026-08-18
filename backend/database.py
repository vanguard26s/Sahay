"""
SQLite Database Layer with SQLAlchemy for persistent storage of Disaster Incidents,
Response Units, Dispatch Orders, and Alert Broadcasts.
"""
import os
import json
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import create_engine, Column, String, Float, Integer, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "disaster_iq.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DBIncident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    source = Column(String, index=True)
    source_url = Column(String, nullable=True)
    author = Column(String, default="Anonymous")
    raw_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    detected_language = Column(String, default="en")
    disaster_type = Column(String, index=True)
    urgency_level = Column(String, index=True)
    urgency_score = Column(Float, default=0.5)
    location_name = Column(String, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.85)
    verification_status = Column(String, default="UNVERIFIED")
    verification_score = Column(Float, default=0.7)
    verification_sources = Column(Text, default="[]")  # JSON string
    needs_identified = Column(Text, default="[]")       # JSON string
    victim_count_estimated = Column(Integer, default=1)
    status = Column(String, default="REPORTED", index=True)
    assigned_unit_id = Column(String, nullable=True)
    assigned_unit_name = Column(String, nullable=True)
    created_at = Column(String)
    updated_at = Column(String)
    is_sos = Column(Boolean, default=False)


class DBResponseUnit(Base):
    __tablename__ = "response_units"

    unit_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    base_location = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    personnel = Column(Integer, default=25)
    boats = Column(Integer, default=4)
    ambulances = Column(Integer, default=2)
    drones = Column(Integer, default=2)
    status = Column(String, default="AVAILABLE", index=True)
    active_incident_id = Column(String, nullable=True)
    last_updated = Column(String)


class DBDispatchOrder(Base):
    __tablename__ = "dispatch_orders"

    order_id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, index=True)
    unit_id = Column(String, index=True)
    unit_name = Column(String)
    timestamp = Column(String)
    status = Column(String, default="DISPATCHED")
    eta_minutes = Column(Float)
    distance_km = Column(Float)
    instructions = Column(Text)


class DBAlertBroadcast(Base):
    __tablename__ = "alert_broadcasts"

    broadcast_id = Column(String, primary_key=True, index=True)
    target_channel = Column(String)  # SMS, WHATSAPP, CAP_EMERGENCY, LOUDSPEAKER
    recipient_count = Column(Integer, default=0)
    target_zone = Column(String)
    severity = Column(String)
    message = Column(Text)
    timestamp = Column(String)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency helper for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
