from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
import sqlite3
from datetime import datetime

BASE = Path(__file__).resolve().parent
DB = BASE / "placementpro.db"
FRONT = BASE.parent / "frontend"

app = Flask(__name__, static_folder=str(FRONT), static_url_path="/static")

def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    c=conn()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS students(
      id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT,branch TEXT,
      cgpa REAL DEFAULT 0,skills TEXT,placement_status TEXT DEFAULT 'Active');
    CREATE TABLE IF NOT EXISTS companies(
      id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,role TEXT,ctc TEXT,
      location TEXT,requirements TEXT);
    CREATE TABLE IF NOT EXISTS applications(
      id INTEGER PRIMARY KEY AUTOINCREMENT,student_id INTEGER,company_id INTEGER,role TEXT,
      status TEXT DEFAULT 'Applied',applied_date TEXT,
      FOREIGN KEY(student_id) REFERENCES students(id),FOREIGN KEY(company_id) REFERENCES companies(id));
    CREATE TABLE IF NOT EXISTS activity(
      id INTEGER PRIMARY KEY AUTOINCREMENT,message TEXT,created_at TEXT);
    CREATE TABLE IF NOT EXISTS interviews(
      id INTEGER PRIMARY KEY AUTOINCREMENT,student_id INTEGER,company_id INTEGER,
      role TEXT,round TEXT,interview_date TEXT,interview_time TEXT,mode TEXT,
      interviewer TEXT,result TEXT DEFAULT 'Scheduled',
      FOREIGN KEY(student_id) REFERENCES students(id),FOREIGN KEY(company_id) REFERENCES companies(id));
    CREATE TABLE IF NOT EXISTS offers(
      id INTEGER PRIMARY KEY AUTOINCREMENT,student_id INTEGER,company_id INTEGER,
      role TEXT,ctc TEXT,joining_date TEXT,status TEXT DEFAULT 'Offer Released',
      FOREIGN KEY(student_id) REFERENCES students(id),FOREIGN KEY(company_id) REFERENCES companies(id));
    """)
    c.commit(); c.close()

def log(msg):
    c=conn(); c.execute("INSERT INTO activity(message,created_at) VALUES(?,?)",(msg,datetime.now().strftime("%d %b %Y, %I:%M %p"))); c.commit(); c.close()

def bad(msg): return jsonify({"error":msg}),400

@app.get("/")
def index(): return send_from_directory(FRONT,"index.html")

@app.get("/api/students")
def students():
    c=conn(); rows=[dict(x) for x in c.execute("SELECT * FROM students ORDER BY id DESC")]; c.close(); return jsonify(rows)

@app.post("/api/students")
def add_student():
    d=request.json or {}
    if not (d.get("name") or "").strip(): return bad("Name is required")
    c=conn(); cur=c.execute("INSERT INTO students(name,email,branch,cgpa,skills,placement_status) VALUES(?,?,?,?,?,?)",
      (d.get("name"),d.get("email"),d.get("branch"),d.get("cgpa",0),d.get("skills"),d.get("placement_status","Active"))); c.commit(); c.close()
    log(f"Added student — {d.get('name')}"); return jsonify({"id":cur.lastrowid}),201

@app.put("/api/students/<int:i>")
def update_student(i):
    d=request.json or {}
    if not (d.get("name") or "").strip(): return bad("Name is required")
    c=conn(); c.execute("UPDATE students SET name=?,email=?,branch=?,cgpa=?,skills=?,placement_status=? WHERE id=?",
      (d.get("name"),d.get("email"),d.get("branch"),d.get("cgpa",0),d.get("skills"),d.get("placement_status","Active"),i)); c.commit(); c.close()
    log(f"Updated student — {d.get('name')}"); return jsonify({"ok":True})

@app.delete("/api/students/<int:i>")
def del_student(i):
    c=conn(); c.execute("DELETE FROM applications WHERE student_id=?",(i,)); c.execute("DELETE FROM students WHERE id=?",(i,)); c.commit(); c.close(); log("Deleted a student record"); return jsonify({"ok":True})

@app.get("/api/companies")
def companies():
    c=conn(); rows=[dict(x) for x in c.execute("SELECT * FROM companies ORDER BY id DESC")]; c.close(); return jsonify(rows)

@app.post("/api/companies")
def add_company():
    d=request.json or {}
    if not (d.get("name") or "").strip(): return bad("Company name is required")
    c=conn(); cur=c.execute("INSERT INTO companies(name,role,ctc,location,requirements) VALUES(?,?,?,?,?)",
      (d.get("name"),d.get("role"),d.get("ctc"),d.get("location"),d.get("requirements"))); c.commit(); c.close()
    log(f"Added recruiter — {d.get('name')}"); return jsonify({"id":cur.lastrowid}),201

@app.put("/api/companies/<int:i>")
def update_company(i):
    d=request.json or {}
    if not (d.get("name") or "").strip(): return bad("Company name is required")
    c=conn(); c.execute("UPDATE companies SET name=?,role=?,ctc=?,location=?,requirements=? WHERE id=?",
      (d.get("name"),d.get("role"),d.get("ctc"),d.get("location"),d.get("requirements"),i)); c.commit(); c.close()
    log(f"Updated recruiter — {d.get('name')}"); return jsonify({"ok":True})

@app.delete("/api/companies/<int:i>")
def del_company(i):
    c=conn(); c.execute("DELETE FROM applications WHERE company_id=?",(i,)); c.execute("DELETE FROM companies WHERE id=?",(i,)); c.commit(); c.close(); log("Deleted a recruiter record"); return jsonify({"ok":True})

@app.get("/api/applications")
def applications():
    c=conn(); rows=c.execute("""SELECT a.*,s.name student_name,c.name company_name
      FROM applications a LEFT JOIN students s ON s.id=a.student_id LEFT JOIN companies c ON c.id=a.company_id
      ORDER BY a.id DESC"""); data=[dict(x) for x in rows]; c.close(); return jsonify(data)

@app.post("/api/applications")
def add_application():
    d=request.json or {}; c=conn(); cur=c.execute("INSERT INTO applications(student_id,company_id,role,status,applied_date) VALUES(?,?,?,?,?)",
      (d.get("student_id"),d.get("company_id"),d.get("role"),d.get("status","Applied"),d.get("applied_date"))); c.commit(); c.close()
    log("Created a new placement application"); return jsonify({"id":cur.lastrowid}),201

@app.put("/api/applications/<int:i>")
def update_application(i):
    d=request.json or {}; c=conn(); c.execute("UPDATE applications SET student_id=?,company_id=?,role=?,status=?,applied_date=? WHERE id=?",
      (d.get("student_id"),d.get("company_id"),d.get("role"),d.get("status","Applied"),d.get("applied_date"),i)); c.commit(); c.close()
    log(f"Application moved to {d.get('status')}"); return jsonify({"ok":True})

@app.delete("/api/applications/<int:i>")
def del_application(i):
    c=conn(); c.execute("DELETE FROM applications WHERE id=?",(i,)); c.commit(); c.close(); log("Deleted an application"); return jsonify({"ok":True})

@app.get("/api/skills")
def skills():
    c=conn()
    rows=c.execute("SELECT skills FROM students WHERE skills IS NOT NULL AND skills != ''").fetchall()
    counts={}
    for r in rows:
        for skill in [x.strip() for x in r["skills"].split(",") if x.strip()]:
            counts[skill]=counts.get(skill,0)+1
    data=[{"skill":k,"students":v} for k,v in sorted(counts.items(), key=lambda x:(-x[1],x[0].lower()))]
    c.close(); return jsonify(data)

@app.get("/api/interviews")
def interviews():
    c=conn()
    rows=c.execute("""SELECT i.*,s.name student_name,c.name company_name
      FROM interviews i LEFT JOIN students s ON s.id=i.student_id
      LEFT JOIN companies c ON c.id=i.company_id ORDER BY i.interview_date,i.interview_time,i.id""")
    data=[dict(x) for x in rows]; c.close(); return jsonify(data)

@app.post("/api/interviews")
def add_interview():
    d=request.json or {}
    c=conn(); cur=c.execute("""INSERT INTO interviews
      (student_id,company_id,role,round,interview_date,interview_time,mode,interviewer,result)
      VALUES(?,?,?,?,?,?,?,?,?)""",
      (d.get("student_id"),d.get("company_id"),d.get("role"),d.get("round"),
       d.get("interview_date"),d.get("interview_time"),d.get("mode"),
       d.get("interviewer"),d.get("result","Scheduled")))
    c.commit(); c.close(); log("Scheduled an interview"); return jsonify({"id":cur.lastrowid}),201

@app.put("/api/interviews/<int:i>")
def update_interview(i):
    d=request.json or {}
    c=conn(); c.execute("""UPDATE interviews SET student_id=?,company_id=?,role=?,round=?,
      interview_date=?,interview_time=?,mode=?,interviewer=?,result=? WHERE id=?""",
      (d.get("student_id"),d.get("company_id"),d.get("role"),d.get("round"),
       d.get("interview_date"),d.get("interview_time"),d.get("mode"),
       d.get("interviewer"),d.get("result","Scheduled"),i))
    c.commit(); c.close(); log("Updated an interview"); return jsonify({"ok":True})

@app.delete("/api/interviews/<int:i>")
def del_interview(i):
    c=conn(); c.execute("DELETE FROM interviews WHERE id=?",(i,)); c.commit(); c.close()
    log("Deleted an interview"); return jsonify({"ok":True})

@app.get("/api/offers")
def offers():
    c=conn()
    rows=c.execute("""SELECT o.*,s.name student_name,c.name company_name
      FROM offers o LEFT JOIN students s ON s.id=o.student_id
      LEFT JOIN companies c ON c.id=o.company_id ORDER BY o.id DESC""")
    data=[dict(x) for x in rows]; c.close(); return jsonify(data)

@app.post("/api/offers")
def add_offer():
    d=request.json or {}
    c=conn(); cur=c.execute("""INSERT INTO offers
      (student_id,company_id,role,ctc,joining_date,status) VALUES(?,?,?,?,?,?)""",
      (d.get("student_id"),d.get("company_id"),d.get("role"),d.get("ctc"),
       d.get("joining_date"),d.get("status","Offer Released")))
    c.commit(); c.close(); log("Recorded a placement offer"); return jsonify({"id":cur.lastrowid}),201

@app.put("/api/offers/<int:i>")
def update_offer(i):
    d=request.json or {}
    c=conn(); c.execute("""UPDATE offers SET student_id=?,company_id=?,role=?,ctc=?,
      joining_date=?,status=? WHERE id=?""",
      (d.get("student_id"),d.get("company_id"),d.get("role"),d.get("ctc"),
       d.get("joining_date"),d.get("status","Offer Released"),i))
    c.commit(); c.close(); log("Updated a placement offer"); return jsonify({"ok":True})

@app.delete("/api/offers/<int:i>")
def del_offer(i):
    c=conn(); c.execute("DELETE FROM offers WHERE id=?",(i,)); c.commit(); c.close()
    log("Deleted a placement offer"); return jsonify({"ok":True})

@app.get("/api/activity")
def activity():
    c=conn(); rows=[dict(x) for x in c.execute("SELECT * FROM activity ORDER BY id DESC LIMIT 100")]; c.close(); return jsonify(rows)

@app.delete("/api/activity")
def clear_activity():
    c=conn(); c.execute("DELETE FROM activity"); c.commit(); c.close(); return jsonify({"ok":True})

def seed_demo():
    c=conn()
    if c.execute("SELECT COUNT(*) FROM students").fetchone()[0] > 0:
        c.close(); return
    students=[
      ("Aarav Sharma","aarav@campus.edu","CSE",8.7,"Python, SQL, Flask, ML","Active"),
      ("Ananya Rao","ananya@campus.edu","CSE",9.1,"Java, Spring, SQL, AWS","Placed"),
      ("Riya Mehta","riya@campus.edu","IT",8.4,"Python, React, SQL","Active"),
      ("Vikram Singh","vikram@campus.edu","CSE",7.9,"Java, DSA, Spring","Active"),
      ("Neha Kapoor","neha@campus.edu","CSE",8.8,"Python, ML, TensorFlow","Placed"),
      ("Karan Patel","karan@campus.edu","AIML",8.2,"Python, NLP, SQL","Active"),
      ("Ishita Verma","ishita@campus.edu","IT",7.6,"JavaScript, React, Node","Active"),
      ("Arjun Nair","arjun@campus.edu","CSE",9.0,"Python, Docker, PostgreSQL","Placed"),
      ("Sneha Iyer","sneha@campus.edu","CSE",7.4,"C++, DSA, SQL","Seeking"),
      ("Rahul Das","rahul@campus.edu","IT",8.0,"Python, Django, REST APIs","Active"),
      ("Meera Joshi","meera@campus.edu","AIML",8.6,"Python, Deep Learning, SQL","Active"),
      ("Aditya Rao","aditya@campus.edu","CSE",7.8,"Java, SQL, Git","Active"),
    ]
    c.executemany("INSERT INTO students(name,email,branch,cgpa,skills,placement_status) VALUES(?,?,?,?,?,?)",students)
    companies=[
      ("TechNova","Software Engineer","₹8.5 LPA","Bengaluru","CGPA ≥ 7.5; CSE/IT; Python or Java"),
      ("CloudPeak","Backend Developer","₹10 LPA","Hyderabad","CGPA ≥ 8.0; Python; SQL; APIs"),
      ("DataSphere","Data Analyst","₹7.2 LPA","Pune","CGPA ≥ 7.5; Python; SQL; Analytics"),
      ("FinEdge","Graduate Engineer","₹9 LPA","Gurugram","CGPA ≥ 7.5; CSE/IT; DSA"),
      ("Nexora Labs","ML Engineer","₹12 LPA","Bengaluru","CGPA ≥ 8.0; Python; ML"),
      ("Vertex Systems","Full Stack Developer","₹8 LPA","Noida","CGPA ≥ 7.5; React; Node"),
    ]
    c.executemany("INSERT INTO companies(name,role,ctc,location,requirements) VALUES(?,?,?,?,?)",companies)
    apps=[
      (1,1,"Software Engineer","Selected","2026-09-02"),(2,1,"Software Engineer","Selected","2026-09-03"),
      (3,2,"Backend Developer","Interview","2026-09-05"),(4,2,"Backend Developer","Shortlisted","2026-09-06"),
      (5,5,"ML Engineer","Selected","2026-09-07"),(6,3,"Data Analyst","Interview","2026-09-08"),
      (7,6,"Full Stack Developer","Shortlisted","2026-09-09"),(8,4,"Graduate Engineer","Selected","2026-09-10"),
      (9,3,"Data Analyst","Rejected","2026-09-10"),(10,1,"Software Engineer","Applied","2026-09-11"),
      (11,5,"ML Engineer","Shortlisted","2026-09-12"),(12,4,"Graduate Engineer","Applied","2026-09-13"),
      (1,2,"Backend Developer","Shortlisted","2026-09-13"),(3,6,"Full Stack Developer","Applied","2026-09-14"),
      (6,5,"ML Engineer","Interview","2026-09-15"),(7,1,"Software Engineer","Applied","2026-09-15"),
    ]
    c.executemany("INSERT INTO applications(student_id,company_id,role,status,applied_date) VALUES(?,?,?,?,?)",apps)
    interviews=[
      (3,2,"Backend Developer","Technical Round","2026-09-26","10:30 AM","Video","Priya Menon","Scheduled"),
      (6,3,"Data Analyst","HR Round","2026-09-26","02:00 PM","Video","Rahul Kapoor","Scheduled"),
      (11,5,"ML Engineer","Technical Round","2026-09-27","11:00 AM","On-site","Amit Shah","Scheduled"),
      (7,6,"Full Stack Developer","Manager Round","2026-09-28","03:30 PM","Video","Nisha Rao","Scheduled")
    ]
    c.executemany("""INSERT INTO interviews
      (student_id,company_id,role,round,interview_date,interview_time,mode,interviewer,result)
      VALUES(?,?,?,?,?,?,?,?,?)""",interviews)
    offers=[
      (1,1,"Software Engineer","₹8.5 LPA","2027-07-01","Accepted"),
      (2,1,"Software Engineer","₹8.5 LPA","2027-07-01","Accepted"),
      (5,5,"ML Engineer","₹12 LPA","2027-07-05","Offer Released"),
      (8,4,"Graduate Engineer","₹9 LPA","2027-07-01","Accepted")
    ]
    c.executemany("""INSERT INTO offers
      (student_id,company_id,role,ctc,joining_date,status) VALUES(?,?,?,?,?,?)""",offers)
    c.commit(); c.close()
    for msg in ["4 placement offers recorded","4 interviews scheduled","New recruiter added — Vertex Systems","Placement drive data initialized"]:
        log(msg)

init_db()
seed_demo()

if __name__=="__main__":
    print("PlacementPro is running at http://127.0.0.1:5000")
    app.run(debug=True)
