from config.db import db

# Import all models here so Flask-Migrate can see them
from .user import User
from .interviews import Interview
from .interview_round import InterviewRound
from .interview_questions import InterviewQuestion
__all__ = ["User", "Interview", "InterviewRound","InterviewQuestion"]
