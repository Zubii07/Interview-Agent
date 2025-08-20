from utils.resume_parser import parse_resume
from models.user import User
from config.db import db

class ResumeService:
    def __init__(self):
        pass

    def upload_and_parse_resume(self,user_id,file, job_description):
        if not file:
            raise ValueError("No file provided")
        if file.filename == '':
            raise ValueError("No file selected")
        
        user = User.find_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if user.resume_text and user.job_description:
            return{
                "message": "Resume & JD already uploaded",
                "resume_text": user.resume_text,
                "job_description": user.job_description
            }

        try:
            parsed_resume = parse_resume(file)
            if "error" in parsed_resume:
                raise ValueError(parsed_resume["error"])

            user.resume_text = parsed_resume["text"]
            user.job_description = job_description
            db.session.commit()

            return {
                "message": "Resume & JD uploaded successfully",
                "resume_text": user.resume_text,
                "job_description": user.job_description
            }

        except Exception as e:
            raise ValueError("Error processing resume")
        

    def get_resume_and_jd(self, user_id):
        user = User.find_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not user.resume_text or not user.job_description:
            raise ValueError("Resume and JD not uploaded yet")

        return {
            "resume_text": user.resume_text,
            "job_description": user.job_description
        }
