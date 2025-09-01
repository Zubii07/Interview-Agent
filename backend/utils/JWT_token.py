from datetime import datetime, timedelta, timezone
import os
from typing import Optional, Tuple

import jwt
from flask import Request, Response

from config.settings import Settings


def _get_bool(value: str) -> bool:
	return str(value).lower() in {"1", "true", "yes", "on"}


def get_jwt_secret() -> str:
	"""Return JWT secret from env or fallback to app secret key, with a safe default in dev."""
	secret = os.getenv("JWT_SECRET") or getattr(Settings, "SECRET_KEY", None)
	if not secret:
		# Dev fallback; ensure not used in production
		secret = "dev-secret-change-me"
	return secret


def _build_payload(user_id: int, token_type: str, expires_in_seconds: int) -> dict:
	now = datetime.now(timezone.utc)
	payload = {
		"sub": str(user_id),
		"type": token_type,
		"iat": int(now.timestamp()),
		"exp": int((now + timedelta(seconds=expires_in_seconds)).timestamp()),
	}
	return payload


def create_access_token(user_id: int) -> str:
	payload = _build_payload(user_id, "access", Settings.JWT_ACCESS_TOKEN_EXPIRES)
	token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
	# PyJWT>=2 returns a str
	return token


def create_refresh_token(user_id: int) -> str:
	payload = _build_payload(user_id, "refresh", Settings.JWT_REFRESH_TOKEN_EXPIRES)
	token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
	return token


def decode_token(token: str) -> dict:
	return jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])


def get_token_from_request(req: Request, token_name: str = "access_token") -> Optional[str]:
	"""Fetch token from Authorization header (Bearer), cookies, query, or form.

	Priority:
	1) Authorization: Bearer <token>
	2) Cookie by name
	3) Query string ?access_token=...
	4) Form field (for multipart/form-data uploads)
	"""
	# 1) Authorization header
	auth_header = req.headers.get("Authorization", "")
	if auth_header.startswith("Bearer "):
		return auth_header.split(" ", 1)[1].strip()

	# 2) Cookie
	cookie_val = req.cookies.get(token_name)
	if cookie_val:
		return cookie_val

	# 3) Query param
	query_val = req.args.get(token_name)
	if query_val:
		return query_val

	# 4) Form field (useful for multipart requests)
	try:
		form_val = req.form.get(token_name)
		if form_val:
			return form_val
	except Exception:
		pass

	return None


def set_token_cookies(
	resp: Response,
	access_token: str,
	refresh_token: Optional[str] = None,
) -> Response:
	"""Set HttpOnly cookies for access and optionally refresh tokens."""
	secure = _get_bool(Settings.COOKIE_SECURE)
	samesite = Settings.COOKIE_SAMESITE

	resp.set_cookie(
		key="access_token",
		value=access_token,
		max_age=Settings.JWT_ACCESS_TOKEN_EXPIRES,
		httponly=True,
		secure=secure,
		samesite=samesite,
		path="/",
	)

	if refresh_token is not None:
		resp.set_cookie(
			key="refresh_token",
			value=refresh_token,
			max_age=Settings.JWT_REFRESH_TOKEN_EXPIRES,
			httponly=True,
			secure=secure,
			samesite=samesite,
			path="/",
		)

	return resp


def clear_token_cookies(resp: Response) -> Response:
	secure = _get_bool(Settings.COOKIE_SECURE)
	samesite = Settings.COOKIE_SAMESITE

	# Clearing by setting expiry in the past
	for key in ("access_token", "refresh_token"):
		resp.set_cookie(
			key, "", max_age=0, expires=0, httponly=True, secure=secure, samesite=samesite, path="/"
		)
	return resp
