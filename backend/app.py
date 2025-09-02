from flask import Flask
from flask_cors import CORS
from config.db import db, migrate
from config.settings import Settings
from models import * 
from models.user import User
from routes.auth_route import auth_bp
from routes.resume_route import resume_bp
from routes.round1_route import round1_bp

from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
app.config.from_object(Settings)

db.init_app(app)
migrate.init_app(app, db)

CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


app.register_blueprint(auth_bp,url_prefix="/api/auth")
app.register_blueprint(resume_bp, url_prefix="/api")
app.register_blueprint(round1_bp, url_prefix="/api/round1")



if __name__ == '__main__':
    app.run(debug=True)
