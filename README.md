# PlacementPro — Campus Placement Intelligence Platform

A polished full-stack campus placement management application built with **HTML, CSS, JavaScript, Flask and SQLite**.

## Final features
- Premium responsive dashboard with placement KPIs and live pipeline
- Student profiles with academics, skills and placement status
- Recruiter/company management
- Placement applications and status workflow
- Eligibility center
- Skill intelligence page
- Interview scheduling and tracking
- Offers and placement outcomes
- Analytics and report export
- Placement insights and activity/audit timeline
- Global search (`Ctrl + K`)
- Dark/light mode
- Modal forms, validation, toast feedback and animations
- Demo dataset for immediate presentation
- REST API + SQLite persistence

## Run locally
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Open `http://127.0.0.1:5000`

## Architecture
Browser UI → Flask REST API → SQLite database

## Project structure
```text
PlacementPro_Final/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── README.md
└── .gitignore
```

## Presentation note
The included database is intentionally not committed. A fresh database is initialized with realistic demo data the first time the backend starts.


## Render deployment
- Build command: `pip install -r backend/requirements.txt`
- Start command: `gunicorn --chdir backend --bind 0.0.0.0:$PORT app:app`
- The app uses SQLite for this demo. On Render Free, local SQLite data is ephemeral and can reset after a restart/redeploy.
