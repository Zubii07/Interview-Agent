from datetime import datetime
from models import db

class InterviewQuestion(db.Model):
    __tablename__ = 'interview_questions'

    id = db.Column(db.Integer, primary_key=True)
    round_id = db.Column(db.Integer, db.ForeignKey('interview_rounds.id'), nullable=False)

    question_text = db.Column(db.Text, nullable=False)
    answer_text = db.Column(db.Text, nullable=True)
    evaluation_json = db.Column(db.JSON, default=dict)  # Score, feedback, etc.

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):

        return f"<InterviewQuestion id={self.id} round_id={self.round_id}>"
