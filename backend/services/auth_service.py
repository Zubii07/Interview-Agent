from typing import Tuple, Optional

from flask import jsonify, make_response, Request

from config.db import db
from models.user import User
from utils.JWT_token import (
	create_access_token,
	create_refresh_token,
	decode_token,
	get_token_from_request,
	set_token_cookies,
	clear_token_cookies,
)

import re


email_regex = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_password(password: str) -> Optional[str]:
	if len(password) < 8:
		return "Password must be at least 8 characters long."
	if not re.search(r"[A-Z]", password):
		return "Password must contain at least one uppercase letter."
	if not re.search(r"[a-z]", password):
		return "Password must contain at least one lowercase letter."
	if not re.search(r"[0-9]", password):
		return "Password must contain at least one digit."
	return None


def register_service(req_json: dict):
	name = (req_json.get("name") or "").strip()
	email = (req_json.get("email") or "").strip().lower()
	password = req_json.get("password") or ""

	if not name:
		return jsonify({"error": "Name is required"}), 400
	if not email or not email_regex.match(email):
		return jsonify({"error": "Valid email is required"}), 400

	pw_err = _validate_password(password)
	if pw_err:
		return jsonify({"error": pw_err}), 400

	if User.find_by_email(email):
		return jsonify({"error": "Email already registered"}), 409

	user = User(name=name, email=email)
	user.set_password(password)

	db.session.add(user)
	db.session.commit()

	# Session not created yet; return created minimal info
	return jsonify({"message": "User registered successfully"}), 201


def login_service(req_json: dict):
	email = (req_json.get("email") or "").strip().lower()
	password = req_json.get("password") or ""

	if not email or not password:
		return jsonify({"error": "Email and password are required"}), 400

	user: Optional[User] = User.find_by_email(email)
	if not user or not user.check_password(password):
		return jsonify({"error": "Invalid credentials"}), 401

	access = create_access_token(user.id)
	refresh = create_refresh_token(user.id)

	# Persist refresh token
	user.refresh_token = refresh
	db.session.commit()

	resp = make_response(
		jsonify(
			{
				"user": user.to_dict(),
				"access_token": access,
				"refresh_token": refresh,
			}
		)
	)
	set_token_cookies(resp, access_token=access, refresh_token=refresh)
	return resp, 200


def refresh_service(req: Request):
	# Prefer cookie
	token = req.cookies.get("refresh_token") or get_token_from_request(req, "refresh_token")
	if not token:
		return jsonify({"error": "Missing refresh token"}), 401
	try:
		payload = decode_token(token)
		if payload.get("type") != "refresh":
			return jsonify({"error": "Invalid token type"}), 401
		user_id = int(payload.get("sub"))
	except Exception:
		return jsonify({"error": "Invalid or expired token"}), 401

	user = User.find_by_id(user_id)
	if not user or user.refresh_token != token:
		return jsonify({"error": "Token revoked"}), 401

	new_access = create_access_token(user.id)
	resp = make_response(
		jsonify({"access_token": new_access, "user": user.to_dict()})
	)
	set_token_cookies(resp, access_token=new_access)
	return resp, 200


def me_service(user: User):
	if not user:
		return jsonify({"error": "Unauthorized"}), 401
	# Always fetch freshest data
	fresh = User.find_by_id(user.id)
	if not fresh:
		return jsonify({"error": "User not found"}), 404
	return jsonify({"user": fresh.to_dict()}), 200


def logout_service(user: Optional[User]):
	# Logout should be idempotent
	if user:
		# Clear stored refresh token
		user.refresh_token = None
		db.session.commit()

	resp = make_response(jsonify({"message": "Logged out"}))
	clear_token_cookies(resp)
	return resp, 200
