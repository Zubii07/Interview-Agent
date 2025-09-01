from typing import Dict, Optional, List
import logging

from models import db, User, Interview, InterviewRound, InterviewQuestion
from utils.interview_shared import InterviewUtils

class Round1Service:

    def __init__(self):
        self.utils = InterviewUtils()

    def start_round_1(self, user_id: int) -> Dict:

        logger = logging.getLogger(__name__)
        logger.info("ROUND1 start called user_id=%s", user_id)
        user = User.find_by_id(user_id)
        if not user:
            logger.error("ROUND1 start: user not found user_id=%s", user_id)
            return {"round_status": "error", "error": "User not found"}
        if not user.resume_text or not user.job_description:
            logger.error(
                "ROUND1 start: missing resume/JD user_id=%s resume_len=%s jd_len=%s",
                user_id,
                len(user.resume_text or ""),
                len(user.job_description or ""),
            )
            return {"round_status": "error", "error": "Resume and job description are required"}

        interview = self.utils.ensure_or_create_interview(user_id)

        # Reset round 1 questions to ensure unique retry set
        round1: Optional[InterviewRound] = InterviewRound.query.filter_by(
            interview_id=interview.id, round_number=1
        ).first()
        if round1:
            InterviewQuestion.query.filter_by(round_id=round1.id).delete()
            round1.status = "in_progress"
            round1.started_at = round1.started_at or db.func.now()
            round1.completed_at = None
            round1.result_json = None
            db.session.commit()
        else:
            round1 = self.utils.start_round(interview, round_number=1)

        created: List[InterviewQuestion] = self.utils.generate_and_store_questions(user, round1, num_q=5)

        questions_payload = [
            {"id": q.id, "text": q.question_text} for q in created
        ]

        if not questions_payload:
            logger.warning(
                "ROUND1 start: empty question set user_id=%s round_id=%s", user_id, round1.id
            )
            return {
                "interview_id": interview.id,
                "round_id": round1.id,
                "round_status": "error",
                "message": "Question generation failed",
                "questions": [],
            }

        result = {
            "interview_id": interview.id,
            "round_id": round1.id,
            "round_status": "in_progress",
            "questions": questions_payload,
        }
        logger.info(
            "ROUND1 start: success user_id=%s round_id=%s qcount=%s",
            user_id,
            round1.id,
            len(questions_payload),
        )
        return result


    def get_question_audio(self, user_id: int) -> Optional[Dict]:
        user = User.find_by_id(user_id)
        if not user:
            return {"error": "User not found"}
        interview = self.utils.ensure_or_create_interview(user_id)
        round1 = self.utils.start_round(interview, 1)

        q = self.utils.get_next_unanswered(round1)
        if not q:
            return None
        audio_url = self.utils.text_to_speech(q.question_text, filename=f"q_{q.id}")
        return {"question_id": q.id, "text": q.question_text, "audio_url": audio_url}

    def submit_answer(self, user_id: int, question_id: int, audio_file_path: str) -> Dict:
        user = User.find_by_id(user_id)
        if not user:
            return {"error": "User not found"}

        q: Optional[InterviewQuestion] = InterviewQuestion.query.get(question_id)
        if not q or q.round.interview.user_id != user_id:
            return {"error": "Invalid question"}

        transcript = self.utils.speech_to_text(audio_file_path)
        eval_json = self.utils.evaluate_answer(
            q.question_text, transcript, user.resume_text or "", user.job_description or ""
        )

        q.answer_text = transcript
        q.evaluation_json = eval_json
        db.session.commit()

        round_obj = q.round
        remaining = self.utils.get_next_unanswered(round_obj)
        if not remaining:  # all answered
            summary = self.utils.summarize_round(round_obj, user)
            # If passed, mark interview eligible for round 2
            interview = round_obj.interview
            if summary.get("pass"):
                interview.status = "in_progress"  # still overall in progress, but eligible for R2
            else:
                interview.status = "failed"
            db.session.commit()
            return {
                "question_id": q.id,
                "transcript": transcript,
                "evaluation": eval_json,
                "completed": True,
                "summary": summary,
            }
        return {
            "question_id": q.id,
            "transcript": transcript,
            "evaluation": eval_json,
            "completed": False,
        }

    def end_round_1(self, user_id: int) -> Dict:
        """Force-complete round 1 by summarizing current answers."""
        user = User.find_by_id(user_id)
        if not user:
            return {"error": "User not found"}
        interview = self.utils.ensure_or_create_interview(user_id)
        round1 = self.utils.start_round(interview, 1)
        return self.utils.summarize_round(round1, user)

    def get_summary(self, user_id: int) -> Optional[Dict]:
        """Return the stored round 1 summary if available."""
        interview = Interview.query.filter_by(user_id=user_id).first()
        if not interview:
            return None
        round1 = InterviewRound.query.filter_by(interview_id=interview.id, round_number=1).first()
        return round1.result_json if round1 and round1.result_json else None
