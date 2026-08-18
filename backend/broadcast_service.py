"""
Emergency Multi-Channel Broadcast and Notification Service (SMS, WhatsApp, Siren, CAP).
"""
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class BroadcastRequest(BaseModel):
    target_channel: str = Field("SMS_AND_WHATSAPP", description="SMS, WHATSAPP, CAP_BROADCAST, ALL")
    target_zone: str = Field(..., description="Target locality / district name")
    severity: str = Field("HIGH_EMERGENCY", description="CRITICAL_EVACUATION, HIGH_EMERGENCY, ADVISORY")
    message: str = Field(..., description="Alert broadcast text message")
    recipient_count_simulated: int = 2500


class BroadcastRecord(BaseModel):
    broadcast_id: str
    target_channel: str
    target_zone: str
    severity: str
    message: str
    timestamp: str
    recipient_count: int
    delivery_rate_percent: float = 98.4
    status: str = "DELIVERED"


class EmergencyBroadcastService:
    """Dispatches mass alert broadcasts to citizens and ground responders."""

    def __init__(self):
        self.broadcast_history: List[BroadcastRecord] = []
        self._seed_recent_broadcasts()

    def _seed_recent_broadcasts(self):
        initial = [
            BroadcastRecord(
                broadcast_id=f"BCAST-{uuid.uuid4().hex[:6].upper()}",
                target_channel="SMS_AND_WHATSAPP",
                target_zone="Wayanad / Chooralmala Sector",
                severity="CRITICAL_EVACUATION",
                message="[NDRF EMERGENCY] Flash flood & landslide red alert. Relocate immediately to Meppadi Community Safe Camp. Avoid bridge crossings.",
                timestamp=datetime.now(timezone.utc).isoformat(),
                recipient_count=4200,
                delivery_rate_percent=99.1,
                status="DELIVERED"
            )
        ]
        self.broadcast_history.extend(initial)

    def send_broadcast(self, req: BroadcastRequest) -> BroadcastRecord:
        record = BroadcastRecord(
            broadcast_id=f"BCAST-{uuid.uuid4().hex[:6].upper()}",
            target_channel=req.target_channel,
            target_zone=req.target_zone,
            severity=req.severity,
            message=req.message,
            timestamp=datetime.now(timezone.utc).isoformat(),
            recipient_count=req.recipient_count_simulated,
            delivery_rate_percent=98.7,
            status="DELIVERED"
        )
        self.broadcast_history.insert(0, record)
        return record

    def get_history(self) -> List[BroadcastRecord]:
        return self.broadcast_history


# Global singleton
broadcast_service = EmergencyBroadcastService()
