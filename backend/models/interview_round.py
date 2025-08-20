from datetime import datetime
from models import db

class InterviewRound(db.Model):
    __tablename__ = "interview_rounds"

    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey("interviews.id"), nullable=False)

    round_number = db.Column(db.Integer, nullable=False)  # 1 or 2
    status = db.Column(db.String(50), default="pending")  # pending, pass, fail

    scheduled_at = db.Column(db.DateTime, nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    result_json = db.Column(db.JSON, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    interview = db.relationship("Interview", back_populates="rounds")
    questions = db.relationship("InterviewQuestion", backref="round", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewRound {self.round_number} for Interview {self.interview_id}>"
