from datetime import datetime
from models import db

class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    status = db.Column(db.String(50), default="in_progress")  # in_progress, completed, failed
    final_result_json = db.Column(db.JSON, nullable=True)

    round_2_confirmation_sent = db.Column(db.Boolean, default=False)
    round_2_reminder_sent = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="interviews")
    rounds = db.relationship("InterviewRound", back_populates="interview", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Interview {self.id} for User {self.user_id}>"
