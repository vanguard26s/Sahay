"""
Authentication and Role-Based Access Control Service for SAHAY Gujarat Command System.
Supports Citizens and Authorities (GSDMA / NDRF / SDRF / Police Officials).
"""
import hashlib
import secrets
import uuid
from typing import Dict, Optional, Tuple
from datetime import datetime, timezone
from backend.models import UserProfile, UserRegisterRequest, UserLoginRequest, AuthResponse


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Generate SHA-256 password hash with salt."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return hashed, salt


class AuthService:
    """User account registration, authentication, and credential verification."""

    def __init__(self):
        self.users: Dict[str, Dict] = {}  # email -> {profile, password_hash, salt}
        self.tokens: Dict[str, str] = {}  # token -> email
        self._seed_default_users()

    def _seed_default_users(self):
        """Seed pre-configured demo accounts for instant Authority and Citizen logins."""
        # 1. Authority Seed Account
        auth_hash, auth_salt = hash_password("Password@123")
        auth_profile = UserProfile(
            user_id="USR-AUTH-001",
            name="Major R. K. Patel",
            email="commander@gsdma.gujarat.gov.in",
            role="AUTHORITY",
            agency_name="Gujarat State Disaster Management Authority (GSDMA) / NDRF 6th Bn",
            badge_number="GSDMA-CMD-094",
            phone="+91-9825001122",
            city="Gandhinagar / Vadodara"
        )
        self.users[auth_profile.email.lower()] = {
            "profile": auth_profile,
            "hash": auth_hash,
            "salt": auth_salt
        }

        # 2. Citizen Seed Account
        cit_hash, cit_salt = hash_password("Password@123")
        cit_profile = UserProfile(
            user_id="USR-CIT-001",
            name="Jignesh Shah",
            email="jignesh.vadodara@gmail.com",
            role="CITIZEN",
            agency_name=None,
            badge_number=None,
            phone="+91-9825123456",
            city="Karelibaug, Vadodara"
        )
        self.users[cit_profile.email.lower()] = {
            "profile": cit_profile,
            "hash": cit_hash,
            "salt": cit_salt
        }

    def register_user(self, req: UserRegisterRequest) -> AuthResponse:
        """Register a new Citizen or Authority."""
        email_key = req.email.strip().lower()
        if email_key in self.users:
            raise ValueError(f"An account with email '{req.email}' already exists.")

        user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
        pwd_hash, salt = hash_password(req.password)

        role = req.role.upper()
        if role not in ["CITIZEN", "AUTHORITY"]:
            role = "CITIZEN"

        profile = UserProfile(
            user_id=user_id,
            name=req.name.strip(),
            email=email_key,
            role=role,
            agency_name=req.agency_name if role == "AUTHORITY" else None,
            badge_number=req.badge_number if role == "AUTHORITY" else None,
            phone=req.phone,
            city=req.city or "Gujarat"
        )

        self.users[email_key] = {
            "profile": profile,
            "hash": pwd_hash,
            "salt": salt
        }

        token = f"sahay_tk_{secrets.token_urlsafe(24)}"
        self.tokens[token] = email_key

        return AuthResponse(
            token=token,
            user=profile,
            message=f"Welcome {profile.name}! Registered successfully as {role}."
        )

    def login_user(self, req: UserLoginRequest) -> AuthResponse:
        """Authenticate user credentials and issue a session token."""
        email_key = req.email.strip().lower()
        user_record = self.users.get(email_key)
        if not user_record:
            raise ValueError("Invalid email or password.")

        expected_hash, _ = hash_password(req.password, user_record["salt"])
        if expected_hash != user_record["hash"]:
            raise ValueError("Invalid email or password.")

        token = f"sahay_tk_{secrets.token_urlsafe(24)}"
        self.tokens[token] = email_key

        return AuthResponse(
            token=token,
            user=user_record["profile"],
            message=f"Signed in as {user_record['profile'].name} ({user_record['profile'].role})."
        )

    def get_user_by_token(self, token: str) -> Optional[UserProfile]:
        """Resolve active user session from token."""
        email_key = self.tokens.get(token)
        if not email_key:
            return None
        user_record = self.users.get(email_key)
        return user_record["profile"] if user_record else None

    def logout_token(self, token: str) -> bool:
        """Invalidate session token."""
        if token in self.tokens:
            del self.tokens[token]
            return True
        return False


auth_service = AuthService()
