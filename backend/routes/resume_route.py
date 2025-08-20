# routes/resume_route.py
from flask import Blueprint, request, jsonify
from services.resume_service import ResumeService
from utils.JWT_token import get_token_from_request, decode_token

resume_bp = Blueprint('resume_bp', __name__)
resume_service = ResumeService()

def get_current_user_id(req):
    token = get_token_from_request(req, token_name="access_token")
    if not token:
        raise ValueError("Missing access token")

    try:
        payload = decode_token(token)
        return int(payload["sub"])   # user_id stored in "sub"
    except Exception as e:
        raise ValueError(f"Invalid or expired token: {str(e)}")


@resume_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    """Upload Resume + JD (only once for Round 1)"""
    try:
        user_id = get_current_user_id(request)
        file = request.files.get('file')
        job_description = request.form.get('job_description')

        result = resume_service.upload_and_parse_resume(user_id, file, job_description)
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@resume_bp.route('/get-resume-jd', methods=['GET'])
def get_resume_and_jd():
    """Fetch saved Resume & JD (for Round 2 use)"""
    try:
        user_id = get_current_user_id(request)
        result = resume_service.get_resume_and_jd(user_id)
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
