from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from config.db import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    refresh_token = db.Column(db.String(255), nullable=True)
    resume_text = db.Column(db.Text, nullable=True)
    job_description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password: str) -> None:
        self.password = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password, password)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'refresh_token': self.refresh_token,
            'resume_text': self.resume_text,
            'job_description':self.job_description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def find_by_email(email: str) -> 'User':
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_id(user_id: int) -> 'User':
        return User.query.get(user_id)
