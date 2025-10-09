# AI Voice Interview 🎙️🤖

AI Voice Interview is a web-based platform that helps candidates prepare for different interviews based on their **Resume** and **Job Description (JD)**.
The system leverages **LLMs with Voice I/O** to simulate real interview scenarios, provide instant feedback, and guide candidates toward improvement.

---

## Features ✨

* **Authentication** – Candidates can sign up and log in securely.
* **Resume & JD Upload** – Upload documents to tailor interview questions.
* **Round 1 (Implemented)**

  * Basic questions about education, experience, previous work history and core subjects.
  * LLM asks questions in **voice**.
  * Candidate answers in **voice**.
  * LLM evaluates responses, provides **feedback**, improvement tips, and **pass/fail** status.
  * Retry option for candidates.
* **Future Roadmap (Round 2)**

  * Auto-scheduling of Round 2 after Round 1 clearance.
  * **Email notifications** (confirmation + reminders).
  * Candidate revisits on the scheduled day, and Round 2 begins automatically with the same voice-based flow.

---

## ⚙️ Tech Stack

* **Frontend**: React (Vite), Context API, Hooks, Custom Components
* **Backend**: Python/Flask, SQLite, SQLAlchemy (python version: 3.10)
* **AI/Voice**:

  * LLMs for *question generation & evaluation*
  * Whisper (speech-to-text)
  * TTS (text-to-speech for questions)
* **Database**: SQLite (dev), extensible to PostgreSQL/MySQL
* **Email**: SMTP integration for notifications

---

## Folder Structure 📂

### Backend

```
backend
├─ app.py                # Entry point
├─ chains/               # LLM question generation logic
├─ config/               # DB & settings
├─ middleware/           # Authentication middleware
├─ models/               # Database models (users, interviews, questions)
├─ routes/               # API routes (auth, resume, round1)
├─ services/             # Business logic for auth, resume, round1
├─ tools/                # TTS, Whisper STT integration
├─ utils/                # Shared utilities (prompts, JWT, resume parser)
├─ static/               # Audio & uploaded files
└─ requirements.txt
```

### Frontend

```
frontend/interview-agent
├─ src/
│  ├─ api/               # Axios clients for APIs
│  ├─ components/        # Layouts, sections, shared UI
│  ├─ contexts/          # Auth & Toast providers
│  ├─ hooks/             # Custom hooks (useResume, useRound1)
│  ├─ pages/             # Main pages (Login, SignUp, Dashboard, Round1)
│  ├─ services/          # Frontend services
│  └─ utils/             # Helpers (VoiceRecorder, storage)
└─ vite.config.js
```

---

## Environment Variables 🔑

Set up the following in `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRES=3600
JWT_REFRESH_EXPIRES=86400
DATABASE_URL=sqlite:///instance/interview_sessions.db
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_password
MAIL_DEFAULT_SENDER=your_email@example.com
COOKIE_SECURE=True
COOKIE_SAMESITE=None
```

---

## Getting Started 🚀

### Backend Setup

```bash
cd backend
python -m venv venv    
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend/interview-agent
npm install
npm run dev
```

---

## Roadmap 🛤️

* [x] Authentication (JWT-based)
* [x] Resume & JD upload
* [x] Round 1 with Voice Q/A & evaluation
* [ ] Round 2 with scheduling and email notifications
* [ ] Multi-round interview simulation
* [ ] Enhanced analytics & reporting

---

## Contributing 🤝

Contributions are welcome!

1. Fork the repo
2. Create a feature branch: git checkout -b feature-name
3. Commit your changes: git commit -m "Added new feature"
4. Push the branch: git push origin feature-name
5. Open a Pull Request

---

## License 📜

This project is licensed under the MIT License.

---

### Made with ❤ by Zohaib

**Happy Learning!**

---
