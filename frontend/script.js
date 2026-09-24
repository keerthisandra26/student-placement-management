const API = "http://127.0.0.1:5000/api";
let students = [];

async function loadStudents(){
  try{
    const res = await fetch(`${API}/students`);
    students = await res.json();
    renderStudents();
    document.getElementById("studentCount").textContent = students.length;
    const companies = await fetch(`${API}/companies`).then(r=>r.json());
    const applications = await fetch(`${API}/applications`).then(r=>r.json());
    document.getElementById("companyCount").textContent = companies.length;
    document.getElementById("applicationCount").textContent = applications.length;
  }catch(e){
    console.log("Start the Flask backend to load live data.");
  }
}

function renderStudents(){
  const q = document.getElementById("search").value.toLowerCase();
  const rows = students.filter(s =>
    `${s.name} ${s.email} ${s.branch}`.toLowerCase().includes(q)
  ).map(s => `<tr><td>${s.name}</td><td>${s.email}</td><td>${s.branch}</td><td>${s.cgpa}</td></tr>`).join("");
  document.getElementById("studentTable").innerHTML =
    rows || `<tr><td colspan="4">No students found.</td></tr>`;
}

document.getElementById("studentForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    branch: document.getElementById("branch").value,
    cgpa: Number(document.getElementById("cgpa").value)
  };
  const res = await fetch(`${API}/students`, {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)
  });
  if(res.ok){
    e.target.reset();
    loadStudents();
  }else{
    alert("Could not add student.");
  }
});

loadStudents();
