from flask import Blueprint, request, g

from services.auth_service import (
	register_service,
	login_service,
	refresh_service,
	me_service,
	logout_service,
)
from middleware.auth_middleware import auth_required


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
	return register_service(request.get_json(silent=True) or {})


@auth_bp.post("/login")
def login():
	return login_service(request.get_json(silent=True) or {})


@auth_bp.post("/refresh")
def refresh():
	return refresh_service(request)


@auth_bp.get("/me")
@auth_required
def me():
	return me_service(getattr(g, "current_user", None))


@auth_bp.post("/logout")
@auth_required
def logout():
	return logout_service(getattr(g, "current_user", None))
