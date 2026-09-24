from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

DB = Path(__file__).with_name("placement.db")

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript('''
      CREATE TABLE IF NOT EXISTS students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        branch TEXT NOT NULL,
        cgpa REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS companies(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS applications(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Applied'
      );
    ''')
    conn.commit()
    conn.close()

@app.get("/api/students")
def students():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.post("/api/students")
def add_student():
    data = request.get_json()
    required = ["name","email","branch","cgpa"]
    if not data or any(k not in data for k in required):
        return jsonify({"error":"Missing required fields"}), 400
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO students(name,email,branch,cgpa) VALUES(?,?,?,?)",
        (data["name"], data["email"], data["branch"], data["cgpa"])
    )
    conn.commit()
    row = conn.execute("SELECT * FROM students WHERE id=?", (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.get("/api/companies")
def companies():
    conn = get_db()
    rows = conn.execute("SELECT * FROM companies ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.get("/api/applications")
def applications():
    conn = get_db()
    rows = conn.execute("SELECT * FROM applications ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.get("/")
def home():
    return "PlacementPro API is running."

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
