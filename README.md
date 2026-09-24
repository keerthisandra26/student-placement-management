PlacementPro — Campus Placement Intelligence Platform

Live Demo
https://student-placement-management-lz2l.onrender.com/

---
About the Project

PlacementPro is a full-stack **campus placement management system** that helps colleges manage students, recruiters, applications, interviews, offers, and placement analytics in one centralized platform.
It provides a dashboard to track the complete placement process from student applications to final placement outcomes.

---

## Features

- **Students** — Manage student details, CGPA, branch, skills, and placement status.
- **Recruiters** — Manage companies, job roles, packages, locations, and requirements.
- **Applications** — Track applications through Applied, Shortlisted, Interview, Selected, or Rejected stages.
- **Eligibility** — Check students against placement criteria.
- **Skills** — Analyze technical skills available among students.
- **Interviews** — Schedule and track interview rounds, dates, modes, and status.
- **Offers** — Record company offers, roles, packages, joining dates, and outcomes.
- **Analytics** — View placement percentage, application funnel, recruiter activity, and placement insights.
- **Other** — Global search, dark/light mode, activity tracking, quick actions, and CSV export.

---

## Technologies Used

| Technology |Used For |

| **HTML5** | Structure of the application |
| **CSS3** | UI design, layout, and themes |
| **JavaScript** | Frontend interactions and API communication |
| **Python** | Backend application logic |
| **Flask** | REST API and server |
| **SQLite** | Database and data storage |
| **Gunicorn** | Production server |
| **Render** | Cloud deployment |
| **GitHub** | Source code and version control |

---

## Application Flow

```text
Frontend
HTML + CSS + JavaScript
        ↓
Flask REST API
        ↓
SQLite Database
----

##Run Locally
1. Download the project

Click Code → Download ZIP from the GitHub repository, then extract the ZIP file.

Or clone it using:
git clone https://github.com/keerthisandra26/student-placement-management.git
2. Open the project folder
cd student-placement-management
3. Install dependencies
pip install -r backend/requirements.txt
4. Run the application
python backend/app.py
5. Open in browser

Go to:
http://127.0.0.1:5000

📂 Project Structure
student-placement-management/
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── render.yaml
├── README.md
└── .gitignore
