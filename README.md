# PlacementPro - Student Placement Management System

A simple full-stack project for managing student placement data.

## Features
- Student dashboard
- Add student records
- Search students
- Company and application API endpoints
- REST API using Flask
- SQLite database
- Responsive frontend

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Python Flask
- Database: SQLite

## Project Structure
- `frontend/` - user interface
- `backend/` - Flask REST API and SQLite database

## Run Locally

### 1. Install Python
Python 3.10+ is recommended.

### 2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the backend
```bash
python app.py
```

The API runs at `http://127.0.0.1:5000`.

### 4. Open the frontend
Open `frontend/index.html` in a browser while the backend is running.

## API Endpoints
- `GET /api/students`
- `POST /api/students`
- `GET /api/companies`
- `GET /api/applications`

## Purpose
This project demonstrates frontend development, backend REST APIs, database integration, CRUD operations and responsive UI design.
