# utils/interview_shared.py
"""
Shared utilities for interview workflows (question generation, TTS/STT glue,
LLM-based evaluation and summarization) used by service layers.
"""

from __future__ import annotations

import json
import os
import random
#!/usr/bin/env python3
# utils/interview_shared.py
"""
Shared utilities for interview workflows (question generation, TTS/STT glue,
LLM-based evaluation and summarization) used by service layers.
"""



import json
import os
import random
import re
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from models import db, Interview, InterviewRound, InterviewQuestion, User
from chains.generate_questions import QuestionGeneratorChain
from tools.tts import text_to_speech as tts_text_to_speech
from tools.whisper_stt import STT
from utils.prompts import (
    EVAL_SYSTEM_PROMPT,
    EVAL_USER_TEMPLATE,
    ROUND_SUMMARY_SYSTEM,
    ROUND_SUMMARY_USER_TEMPLATE,
)


# Logger for debug tracing
logger = logging.getLogger(__name__)

# Low temperature for more deterministic evaluation JSON
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2)

# Passing criteria for Round 1 (percentage 0-100)
PASS_THRESHOLD = 70


class InterviewUtils:
    """Utility methods for managing interview lifecycle pieces.

    This class intentionally contains only stateless helpers or DB-light
    operations that can be reused across services and future rounds.
    """

    # -------------------- JSON parsing helpers --------------------
    @staticmethod
    def _strip_fences(s: str) -> str:
        s = s.strip()
        # Remove triple backtick fences like ```json ... ```
        if s.startswith("```") and s.endswith("```"):
            return s[3:-3].strip()
        # Remove ```json ... ``` prefix/suffix if present
        s = re.sub(r"^```(?:json|JSON)?\s*\n", "", s)
        s = re.sub(r"\n```\s*$", "", s)
        return s.strip()

    @staticmethod
    def _parse_json_safely(text: Optional[str]) -> Optional[Dict[str, Any]]:
        """Best-effort JSON parse that tolerates code fences and extra text.

        Tries several heuristics since LLMs can wrap JSON in prose or code
        fences. Returns None if parsing fails.
        """
        if not text:
            return None
        s = InterviewUtils._strip_fences(text)
        # 1) Direct parse
        try:
            return json.loads(s)
        except Exception:
            pass
        # 2) Extract largest {...} block
        try:
            matches = list(re.finditer(r"\{[\s\S]*\}", s))
            if matches:
                block = s[matches[0].start() : matches[-1].end()]
                return json.loads(block)
        except Exception:
            pass
        # 3) Extract first code fence content if any
        try:
            m = re.search(r"```(?:json|JSON)?\n([\s\S]*?)\n```", text)
            if m:
                return json.loads(m.group(1))
        except Exception:
            pass
        return None

    # -------------------- Interview + Round helpers --------------------
    @staticmethod
    def ensure_or_create_interview(user_id: int) -> Interview:
        """Fetch existing interview for user or create a new in-progress one."""
        interview = Interview.query.filter_by(user_id=user_id).first()
        if not interview:
            interview = Interview(user_id=user_id, status="in_progress")
            db.session.add(interview)
            db.session.commit()
        return interview

    @staticmethod
    def start_round(interview: Interview, round_number: int = 1) -> InterviewRound:
        """Fetch or create a round. If creating, mark in_progress and set started_at."""
        round_obj = (
            InterviewRound.query.filter_by(
                interview_id=interview.id, round_number=round_number
            ).first()
        )
        if not round_obj:
            round_obj = InterviewRound(
                interview_id=interview.id,
                round_number=round_number,
                status="in_progress",
                started_at=datetime.utcnow(),
            )
            db.session.add(round_obj)
            db.session.commit()
        else:
            # If round exists but is pending, kick it to in_progress on use
            if round_obj.status == "pending":
                round_obj.status = "in_progress"
                if not round_obj.started_at:
                    round_obj.started_at = datetime.utcnow()
                db.session.commit()
        return round_obj

    @staticmethod
    def generate_and_store_questions(user: User, round_obj: InterviewRound, num_q: int = 5) -> List[InterviewQuestion]:
        """Generate interview questions using LangChain chain and persist them.

        Ensures variety by passing a time/random-based "randomizer" seed.
        """
        # Ask chain for questions
        randomizer = f"{time.time()}-{random.randint(1000, 9999)}"
        # Debug: log input basics
        try:
            logger.info(
                "QGEN start user_id=%s round_id=%s num_q=%s resume_len=%s jd_len=%s",
                getattr(user, "id", None),
                getattr(round_obj, "id", None),
                num_q,
                len(user.resume_text or ""),
                len(user.job_description or ""),
            )
        except Exception:
            pass
        qchain = QuestionGeneratorChain()
        qset = qchain.generate_questions(
            user.resume_text or "",
            user.job_description or "",
            "easy",
            num_q,
            randomizer,
        )
        # Debug: log raw LLM output (truncate to avoid huge logs)
        try:
            logger.debug("QGEN raw output=%s", json.dumps(qset)[:2000])
        except Exception:
            pass
        raw_questions = qset.get("questions", [])
        created: List[InterviewQuestion] = []

        # Normalize to a list of question strings
        if isinstance(raw_questions, str):
            # Fallback: split by lines if plain text came back
            candidates = [ln.strip("- ") for ln in raw_questions.splitlines() if ln.strip()]
            normalized = candidates[:num_q]
        elif isinstance(raw_questions, list):
            normalized = []
            for item in raw_questions:
                if isinstance(item, dict):
                    qtext = item.get("question") or item.get("question_text") or ""
                    if qtext:
                        normalized.append(qtext)
                elif isinstance(item, str):
                    normalized.append(item)
                if len(normalized) >= num_q:
                    break
        else:
            normalized = []

        # Persist
        for qtext in normalized:
            iq = InterviewQuestion(round_id=round_obj.id, question_text=qtext)
            db.session.add(iq)
            created.append(iq)
        db.session.commit()
        # Debug: log result summary
        try:
            logger.info(
                "QGEN done user_id=%s round_id=%s created=%s", getattr(user, "id", None), getattr(round_obj, "id", None), len(created)
            )
            if not created:
                logger.warning("QGEN produced empty question set")
        except Exception:
            pass
        return created

    # -------------------- Media helpers --------------------
    @staticmethod
    def get_next_unanswered(round_obj: InterviewRound) -> Optional[InterviewQuestion]:
        """Return the next unanswered question for the given round (or None)."""
        return (
            InterviewQuestion.query.filter_by(round_id=round_obj.id, answer_text=None)
            .order_by(InterviewQuestion.id.asc())
            .first()
        )

    @staticmethod
    def text_to_speech(text: str, filename: Optional[str] = None) -> str:
        """Convert text to speech and return a URL path to the audio file.

        Ensures the static/audio directory exists. The underlying TTS util
        returns a "/static/..." URL path which the frontend can fetch.
        """
        os.makedirs(os.path.join("static", "audio"), exist_ok=True)
        safe_name = filename or f"q_{int(time.time())}_{random.randint(1000,9999)}"
        audio_url = tts_text_to_speech(text, filename=safe_name)
        return audio_url

    @staticmethod
    def speech_to_text(audio_path: str) -> str:
        """Transcribe audio at the given file path to text using Whisper STT."""
        return STT.transcribe_audio(audio_path)

    # -------------------- LLM evaluation + summary --------------------
    @staticmethod
    def evaluate_answer(question: str, answer: str, resume: str, jd: str) -> Dict[str, Any]:
        """Evaluate an answer via LLM and normalize the output schema.

        Returns a dict with at least: score (0-10), feedback (str), criteria_met (bool).
        """
        messages = [
            SystemMessage(content=EVAL_SYSTEM_PROMPT),
            HumanMessage(
                content=EVAL_USER_TEMPLATE.format(
                    question=question, answer=answer, resume=resume, jd=jd
                )
            ),
        ]
        response = llm.invoke(messages)
        parsed = InterviewUtils._parse_json_safely(getattr(response, "content", None))
        # Sensible defaults if parsing fails
        if not parsed or not isinstance(parsed, dict):
            parsed = {
                "score": 5,
                "meets_requirement": False,
                "feedback": "Unable to parse evaluator output; using neutral score.",
                "improvements": [],
                "dimensions": {},
            }

        # Normalize keys
        score = parsed.get("score")
        try:
            score_val = float(score) if score is not None else 5.0
        except Exception:
            score_val = 5.0
        # Convert 0-10 to percent for pass check
        percent = max(0.0, min(100.0, (score_val / 10.0) * 100.0))
        criteria_met = bool(parsed.get("meets_requirement")) or percent >= PASS_THRESHOLD

        normalized = {
            "score": int(round(score_val)),
            "feedback": parsed.get("feedback") or "",
            "criteria_met": criteria_met,
            "improvements": parsed.get("improvements") or [],
            "dimensions": parsed.get("dimensions") or {},
            "raw": parsed,  # keep raw for debugging/traceability
        }
        return normalized

    @staticmethod
    def summarize_round(round_obj: InterviewRound, user: User) -> Dict[str, Any]:
        """Summarize round results via LLM and persist status to the DB."""
        evaluations = [q.evaluation_json for q in round_obj.questions if q.evaluation_json]

        messages = [
            SystemMessage(content=ROUND_SUMMARY_SYSTEM),
            HumanMessage(
                content=ROUND_SUMMARY_USER_TEMPLATE.format(
                    evaluations=json.dumps(evaluations),
                    resume=user.resume_text or "",
                    jd=user.job_description or "",
                )
            ),
        ]
        response = llm.invoke(messages)
        parsed = InterviewUtils._parse_json_safely(getattr(response, "content", None))

        if not parsed or not isinstance(parsed, dict):
            # Fallback: simple aggregate
            if evaluations:
                scores = [e.get("score", 0) for e in evaluations if isinstance(e, dict)]
                avg10 = sum(scores) / max(1, len(scores))
                percent = (avg10 / 10.0) * 100.0
            else:
                percent = 0.0
            parsed = {
                "overall_score": int(round(percent)),
                "pass": percent >= PASS_THRESHOLD,
                "strengths": [],
                "gaps": [],
                "recommendations": [],
                "topic_breakdown": [],
            }

        # Persist outcome and mark round completion
        round_obj.result_json = parsed
        round_obj.status = "pass" if bool(parsed.get("pass")) else "fail"
        round_obj.completed_at = datetime.utcnow()
        db.session.commit()

        # Enrich with convenience flag for FE
        parsed["eligible_for_round_2"] = bool(parsed.get("pass"))
        return parsed
