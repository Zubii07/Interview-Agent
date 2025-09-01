import os
import tempfile
from flask import Blueprint, request, jsonify, g
from services.round1_service import Round1Service
from middleware.auth_middleware import auth_required

round1_bp = Blueprint("round1_bp", __name__)
svc = Round1Service()

@round1_bp.route("/start", methods=["POST"])
@auth_required
def start_round_1():
    user_id = g.current_user.id
    result = svc.start_round_1(user_id)
    status = 200 if "error" not in result else 400
    return jsonify(result), status


@round1_bp.route("/get-question-audio", methods=["GET"])
@auth_required
def get_question_audio():
    user_id = g.current_user.id
    q = svc.get_question_audio(user_id)
    if not q:
        return jsonify({"round_status": "no_more_questions", "message": "No more questions"}), 200
    status = 200 if "error" not in q else 400
    return jsonify(q), status


@round1_bp.route("/submit-answer/<int:question_id>", methods=["POST"])
@auth_required
def submit_answer(question_id):
    user_id = g.current_user.id
    audio_file = request.files.get("audio")
    if not audio_file:
        return jsonify({"error": "Audio file required"}), 400

    # Persist upload temporarily so Whisper can read a file path
    os.makedirs(os.path.join("static", "uploads"), exist_ok=True)
    tmp_dir = os.path.join("static", "uploads")
    # Use NamedTemporaryFile for uniqueness (delete=False so Whisper can read)
    with tempfile.NamedTemporaryFile(dir=tmp_dir, suffix=".wav", delete=False) as tmp:
        audio_path = tmp.name
        audio_file.save(audio_path)

    try:
        result = svc.submit_answer(user_id, question_id, audio_path)
        status = 200 if "error" not in result else 400
        return jsonify(result), status
    finally:
        # Best-effort cleanup
        try:
            os.remove(audio_path)
        except Exception:
            pass


@round1_bp.route("/end-interview", methods=["POST"])
@auth_required
def end_interview():
    user_id = g.current_user.id
    result = svc.end_round_1(user_id)
    status = 200 if "error" not in result else 400
    return jsonify(result), status


@round1_bp.route("/summary", methods=["GET"])
@auth_required
def get_summary():
    user_id = g.current_user.id
    summary = svc.get_summary(user_id)
    return jsonify(summary or {"message": "Summary not available"}), 200


@round1_bp.route("/get-interview-status", methods=["GET"])
@auth_required
def get_status():
    """Return overall interview + round 1 progress."""
    user_id = g.current_user.id
    summary = svc.get_summary(user_id)
    return jsonify({
        "user_id": user_id,
    "status": "in_progress" if summary else "not_started",
        "round_1_summary": summary
    })
