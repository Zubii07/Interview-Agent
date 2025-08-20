from config.db import db

# Import all models here so Flask-Migrate can see them
from .user import User
__all__ = ["User"]
