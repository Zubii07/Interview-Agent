from functools import wraps
from typing import Callable

from flask import g, request, jsonify, make_response

from models.user import User
from utils.JWT_token import (
	get_token_from_request,
	decode_token,
	create_access_token,
	set_token_cookies,
)


def auth_required(f: Callable):
	@wraps(f)
	def wrapper(*args, **kwargs):
		user = None
		new_access_token = None

		# 1) Try access token first (header or cookie)
		token = get_token_from_request(request, token_name="access_token")
		if token:
			try:
				payload = decode_token(token)
				if payload.get("type") == "access":
					user_id = int(payload.get("sub"))
					user = User.find_by_id(user_id)
			except Exception:
				# fall through to try refresh token
				user = None

		# 2) If access missing/invalid, try refresh token silently
		if not user:
			refresh = request.cookies.get("refresh_token") or get_token_from_request(
				request, "refresh_token"
			)
			if refresh:
				try:
					payload = decode_token(refresh)
					if payload.get("type") == "refresh":
						user_id = int(payload.get("sub"))
						maybe_user = User.find_by_id(user_id)
						# validate token is the current one in DB (revocation-aware)
						if maybe_user and maybe_user.refresh_token == refresh:
							user = maybe_user
							new_access_token = create_access_token(user.id)
				except Exception:
					user = None

		if not user:
			return jsonify({"error": "Unauthorized"}), 401

		g.current_user = user
		# Call the view and set refreshed access cookie if needed
		rv = f(*args, **kwargs)
		if new_access_token:
			resp = make_response(rv)
			set_token_cookies(resp, access_token=new_access_token)
			return resp
		return rv

	return wrapper
