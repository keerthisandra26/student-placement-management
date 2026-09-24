const state={page:"dashboard",students:[],companies:[],applications:[],activity:[],skills:[],interviews:[],offers:[],theme:localStorage.getItem("pp-theme")||"light"};
const app=document.getElementById("app"), modal=document.getElementById("modal"), modalCard=document.getElementById("modalCard");
const api=async(path,opts={})=>{const r=await fetch(path,{headers:{"Content-Type":"application/json"},...opts}); if(!r.ok) throw new Error(await r.text()); return r.json()};
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const initials=s=>String(s||"?").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
function toast(msg,type="success"){const d=document.createElement("div");d.className="toast "+type;d.textContent=msg;document.getElementById("toast-container").appendChild(d);setTimeout(()=>d.remove(),2600)}
function statusBadge(s){const c={Selected:"green",Placed:"green",Shortlisted:"violet",Interview:"yellow",Seeking:"yellow",Rejected:"red","Not Eligible":"red",Applied:"blue",Active:"blue"}[s]||"blue";return `<span class="badge ${c}">${esc(s)}</span>`}
function openModal(title,body,foot){modalCard.innerHTML=`<div class="modal-head"><h3>${title}</h3><button class="close" id="closeModal">×</button></div><div class="modal-content">${body}</div><div class="modal-foot">${foot||""}</div>`;modal.classList.remove("hidden");document.getElementById("closeModal").onclick=closeModal;modalCard.querySelector("input")?.focus()}
function closeModal(){modal.classList.add("hidden")}
modal.addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop"))closeModal()});
async function load(){
 [state.students,state.companies,state.applications,state.activity,state.skills,state.interviews,state.offers]=await Promise.all([
   api("/api/students"),api("/api/companies"),api("/api/applications"),api("/api/activity"),
   api("/api/skills"),api("/api/interviews"),api("/api/offers")
 ]);
 render();
}
function nav(){document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;document.body.classList.remove("nav-open");document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()})}
function header(title,sub,actions=""){return `<div class="page-head"><div><div class="eyebrow">${({companies:"RECRUITERS",applications:"PIPELINE"}[state.page]||state.page.toUpperCase())}</div><h1>${title}</h1><p>${sub}</p></div><div class="head-actions">${actions}</div></div>`}
function metric(label,value,trend,icon){return `<div class="metric"><div class="label">${label}</div><h2>${value}</h2><div class="trend">${trend}</div><div class="metric-icon">${icon}</div></div>`}
function dashboard(){
 const placed=new Set(state.applications.filter(a=>a.status==="Selected").map(a=>a.student_id)).size;
 const rate=state.students.length?Math.round(placed/state.students.length*100):0;
 const interview=state.applications.filter(a=>a.status==="Interview").length;
 const shortlisted=state.applications.filter(a=>a.status==="Shortlisted").length;
 const counts=["Applied","Shortlisted","Interview","Selected"].map(s=>[s,state.applications.filter(a=>a.status===s).length]);
 const max=Math.max(1,...counts.map(x=>x[1]));
 const top=topCompany()||"No recruiter data";
 return `
 <div class="dash-shell">
   <div class="dash-top">
     <div>
       <div class="overline">PLACEMENT OPERATIONS • 2026–27</div>
       <h1>Good ${new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, Placement Team <span class="wave">✦</span></h1>
       <p>Here’s what’s happening across your campus recruitment workspace.</p>
     </div>
     <div class="dash-actions">
       <button class="ghost-btn" id="quickAdd">＋ Quick add</button>
       <button class="accent-btn" id="exportBtn">Export report ↗</button>
     </div>
   </div>

   <div class="command-hero">
     <div class="hero-copy">
       <div class="live-pill"><i></i> LIVE PLACEMENT CYCLE</div>
       <h2>Build momentum.<br><em>Place talent.</em></h2>
       <p>One workspace for students, recruiters, applications and placement intelligence.</p>
       <div class="hero-links"><button id="viewAnalytics">Open analytics <span>→</span></button><button id="allApps">View pipeline <span>→</span></button></div>
     </div>
     <div class="hero-orbit">
       <div class="orbit-ring ring-one"></div><div class="orbit-ring ring-two"></div>
       <div class="orbit-center"><strong>${rate}%</strong><span>PLACED</span></div>
       <div class="orbit-node node-a">✓</div><div class="orbit-node node-b">↗</div><div class="orbit-node node-c">★</div>
     </div>
   </div>

   <div class="stat-strip">
     <div class="stat-tile"><span class="stat-icon blue">◉</span><div><small>Students</small><b>${state.students.length}</b><em>active pool</em></div></div>
     <div class="stat-tile"><span class="stat-icon violet">▣</span><div><small>Recruiters</small><b>${state.companies.length}</b><em>partner companies</em></div></div>
     <div class="stat-tile"><span class="stat-icon mint">↗</span><div><small>Applications</small><b>${state.applications.length}</b><em>${shortlisted} shortlisted</em></div></div>
     <div class="stat-tile"><span class="stat-icon amber">◎</span><div><small>Interviews</small><b>${interview}</b><em>in progress</em></div></div>
   </div>

   <div class="bento-grid">
     <section class="bento-card pipeline-card">
       <div class="bento-head"><div><span class="section-kicker">APPLICATION FLOW</span><h3>Recruitment pipeline</h3></div><span class="live-label">● live</span></div>
       <div class="pipeline-visual">
         ${counts.map(([s,n],i)=>`<div class="pipeline-step"><div class="step-top"><span>${["01","02","03","04"][i]}</span><b>${n}</b></div><div class="step-name">${s}</div><div class="step-line"><i style="width:${Math.max(8,Math.round(n/max*100))}%"></i></div></div>`).join("")}
       </div>
       <div class="pipeline-foot"><span>From application to offer</span><button id="openPipeline">Open pipeline →</button></div>
     </section>

     <section class="bento-card insight-card">
       <div class="bento-head"><div><span class="section-kicker">PLACEMENT INTELLIGENCE</span><h3>What needs attention</h3></div><span class="spark">✦</span></div>
       <div class="insight-list">${insights().map((x,i)=>`<div class="insight-line"><span class="insight-num">0${i+1}</span><div><b>${x.t}</b><p>${x.p}</p></div><span>→</span></div>`).join("")}</div>
     </section>

     <section class="bento-card recruiter-card">
       <div class="bento-head"><div><span class="section-kicker">RECRUITER ACTIVITY</span><h3>Hiring partners</h3></div><button class="text-btn" id="recruitersLink">View all</button></div>
       <div class="recruiter-list">${state.companies.slice(0,5).map((c,i)=>{const n=state.applications.filter(a=>a.company_id===c.id).length;return `<div class="recruiter-row"><div class="company-logo">${initials(c.name)}</div><div class="recruiter-main"><b>${esc(c.name)}</b><span>${esc(c.role||"Open role")}</span></div><div class="recruiter-count">${n}<small>apps</small></div></div>`}).join("")||`<div class="empty">Add recruiters to populate this panel.</div>`}</div>
     </section>

     <section class="bento-card activity-card">
       <div class="bento-head"><div><span class="section-kicker">LIVE FEED</span><h3>Recent activity</h3></div><button class="text-btn" id="activityLink">Activity center</button></div>
       <div class="feed">${state.activity.slice(0,5).map(x=>`<div class="feed-row"><span class="feed-dot"></span><div><b>${esc(x.message)}</b><small>${esc(x.created_at)}</small></div></div>`).join("")||`<div class="empty">No activity yet.</div>`}</div>
     </section>

     <section class="bento-card quick-card">
       <div class="quick-copy"><span class="section-kicker">QUICK ACTIONS</span><h3>Keep the drive moving.</h3><p>Jump directly into the most-used placement workflows.</p></div>
       <div class="quick-grid">
         <button id="qaStudent"><span>＋</span>Add student</button>
         <button id="qaCompany"><span>＋</span>Add recruiter</button>
         <button id="qaApp"><span>↗</span>New application</button>
         <button id="qaAnalytics"><span>◒</span>View analytics</button>
       </div>
     </section>
   </div>

   <div class="dash-footer"><span>PlacementPro Intelligence Workspace</span><span>All systems operational <i></i></span></div>
 </div>`;
}
function insights(){const noApps=state.students.filter(s=>!state.applications.some(a=>a.student_id===s.id)).length;const selected=state.applications.filter(a=>a.status==="Selected").length;const top=Object.entries(state.companies.reduce((m,c)=>(m[c.name]=(m[c.name]||0)+state.applications.filter(a=>a.company_id===c.id).length,m),{})).sort((a,b)=>b[1]-a[1])[0];return [{t:"Attention Needed",p:`${noApps} student${noApps===1?"":"s"} currently have no application activity.`},{t:"Placement Momentum",p:`${selected} student${selected===1?"":"s"} have reached the Selected stage.`},{t:"Recruiter Demand",p:top?`${top[0]} currently has the highest application volume (${top[1]}).`:"Add recruiters to unlock demand insights."}]}
function tablePage(type){
 const isS=type==="students", arr=isS?state.students:state.companies, title=isS?"Students":"Recruiters", sub=isS?"Manage profiles, skills, academics and placement readiness.":"Track recruiter partners, roles and hiring activity.";
 return header(title,sub,`<button class="btn primary" id="addBtn">＋ Add ${isS?"Student":"Recruiter"}</button>`) + `<div class="toolbar"><input class="control search" id="pageSearch" placeholder="Search ${isS?"students":"companies"}..."><button class="btn" id="refreshBtn">↻ Refresh</button></div><div class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr>${isS?"<th>Student</th><th>Branch</th><th>CGPA</th><th>Skills</th><th>Status</th><th>Actions</th>":"<th>Company</th><th>Role</th><th>CTC</th><th>Applicants</th><th>Actions</th>"}</tr></thead><tbody id="dataRows">${renderRows(type,arr)}</tbody></table></div></div>`;
}
function renderRows(type,arr){if(!arr.length)return `<tr><td colspan="6" class="empty">No records found.</td></tr>`;if(type==="students")return arr.map(s=>`<tr><td><div class="person"><div class="avatar">${initials(s.name)}</div><div><b>${esc(s.name)}</b><small style="display:block;color:var(--muted)">${esc(s.email||"")}</small></div></div></td><td>${esc(s.branch)}</td><td><b>${Number(s.cgpa||0).toFixed(1)}</b></td><td>${esc(s.skills||"—")}</td><td>${statusBadge(s.placement_status||"Active")}</td><td><div class="row-actions"><button class="mini-btn" onclick="studentView(${s.id})">View</button><button class="mini-btn" onclick="editStudent(${s.id})">Edit</button><button class="mini-btn" onclick="deleteItem('students',${s.id})">Delete</button></div></td></tr>`).join("");return arr.map(c=>`<tr><td><b>${esc(c.name)}</b><small style="display:block;color:var(--muted)">${esc(c.location||"")}</small></td><td>${esc(c.role)}</td><td>${esc(c.ctc||"—")}</td><td>${state.applications.filter(a=>a.company_id===c.id).length}</td><td><div class="row-actions"><button class="mini-btn" onclick="companyView(${c.id})">View</button><button class="mini-btn" onclick="editCompany(${c.id})">Edit</button><button class="mini-btn" onclick="deleteItem('companies',${c.id})">Delete</button></div></td></tr>`).join("")}
function applications(){
 return header("Application Pipeline","Track every application from first submission to final outcome.","<button class='btn primary' id='addApp'>＋ New Application</button>")+`<div class="toolbar"><input class="control search" id="appSearch" placeholder="Search student or company..."><select class="control" id="statusFilter"><option value="">All statuses</option><option>Applied</option><option>Shortlisted</option><option>Interview</option><option>Selected</option><option>Rejected</option></select></div><div class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Company</th><th>Role</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead><tbody id="appRows">${renderApps(state.applications)}</tbody></table></div></div>`;
}
function renderApps(arr){return arr.length?arr.map(a=>`<tr><td>${esc(a.student_name)}</td><td>${esc(a.company_name)}</td><td>${esc(a.role)}</td><td>${esc(a.applied_date||"—")}</td><td>${statusBadge(a.status)}</td><td><div class="row-actions"><button class="mini-btn" onclick="editApp(${a.id})">Update</button><button class="mini-btn" onclick="deleteItem('applications',${a.id})">Delete</button></div></td></tr>`).join(""):`<tr><td colspan="6" class="empty">No applications match your filters.</td></tr>`}
function eligibility(){const eligible=state.students.filter(s=>Number(s.cgpa||0)>=7.5);return header("Eligibility Center","Quickly identify placement-ready students based on academic criteria.","<button class='btn primary' id='eligRule'>＋ Create Rule</button>")+`<div class="grid metrics">${metric("Eligible",eligible.length,"CGPA ≥ 7.5","✓")}${metric("Needs Review",state.students.length-eligible.length,"Below current threshold","!")}${metric("No Applications",state.students.filter(s=>!state.applications.some(a=>a.student_id===s.id)).length,"Action recommended","↗")}${metric("Selected",state.applications.filter(a=>a.status==="Selected").length,"Final outcomes","★")}</div><div class="card table-card"><div class="card-head"><h3>Current Eligibility Rule</h3><span>Demo policy — editable</span></div><div class="card-body"><div class="insight"><b>Standard Software Role</b><p>CGPA ≥ 7.5 • CSE/IT preferred • Relevant technical skills • No active rejection restriction.</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>CGPA</th><th>Skills</th><th>Eligibility</th></tr></thead><tbody>${state.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.cgpa)}</td><td>${esc(s.skills||"—")}</td><td>${Number(s.cgpa||0)>=7.5?'<span class="badge green">Eligible</span>':'<span class="badge red">Review</span>'}</td></tr>`).join("")}</tbody></table></div></div>`}
function analytics(){const selected=state.applications.filter(a=>a.status==="Selected").length;const vals=["Applied","Shortlisted","Interview","Selected"].map(s=>state.applications.filter(a=>a.status===s).length);const max=Math.max(1,...vals);return header("Analytics & Reports","Turn placement activity into clear, decision-ready insights.","<button class='btn primary' id='exportBtn'>Export CSV</button>")+`<div class="grid metrics">${metric("Selection Rate",state.applications.length?Math.round(selected/state.applications.length*100)+"%":"0%","Applications → selected","↗")}${metric("Avg. Applications",state.students.length?(state.applications.length/state.students.length).toFixed(1):"0","Per student","◒")}${metric("Active Drives",state.companies.length,"Recruiter partners","▣")}${metric("Interview Stage",vals[2],"Currently in interview","◎")}</div><div class="chart-grid"><div class="card"><div class="card-head"><h3>Application Funnel</h3><span>Current cycle</span></div><div class="chart">${vals.map((v,i)=>`<div class="vbar"><i style="height:${Math.max(5,v/max*78)}%"></i><b>${v}</b><span>${["Applied","Shortlisted","Interview","Selected"][i]}</span></div>`).join("")}</div></div><div class="card"><div class="card-head"><h3>Recruiter Demand</h3><span>Applications per company</span></div><div class="card-body">${(()=>{const d=state.companies.map(c=>[c.name,state.applications.filter(a=>a.company_id===c.id).length]).sort((a,b)=>b[1]-a[1]),m=Math.max(1,...d.map(x=>x[1]));return d.map(([name,n])=>`<div class="demand-row"><span>${esc(name)}</span><div class="bar"><i style="width:${Math.max(4,n/m*100)}%"></i></div><b>${n}</b></div>`).join("")})()||"<div class='empty'>Add companies to see demand.</div>"}</div></div></div><div class="grid three-col"><div class="card report-card"><span class="label">Placement Rate</span><div class="big-number">${state.students.length?Math.round(new Set(state.applications.filter(a=>a.status==="Selected").map(a=>a.student_id)).size/state.students.length*100):0}%</div><p style="font-size:12.5px;color:var(--muted)">Selected students relative to total student pool.</p></div><div class="card report-card"><span class="label">Top Recruiter</span><div class="big-number" style="font-size:21px">${esc(topCompany()||"—")}</div><p style="font-size:12.5px;color:var(--muted)">Based on current application volume.</p></div><div class="card report-card"><span class="label">Data Coverage</span><div class="big-number">${state.students.length?100:0}%</div><p style="font-size:12.5px;color:var(--muted)">Workspace records available to analytics.</p></div></div>`}
function topCompany(){let x=state.companies.map(c=>[c.name,state.applications.filter(a=>a.company_id===c.id).length]).sort((a,b)=>b[1]-a[1])[0];return x?.[0]}

function skillsPage(){
 const max=Math.max(1,...state.skills.map(x=>x.students));
 const recruiterDemand=state.companies.map(c=>({name:c.name,count:state.applications.filter(a=>a.company_id===c.id).length})).sort((a,b)=>b.count-a.count);
 return header("Skill Intelligence","See the capabilities across your student pool and where recruiter demand is concentrated.","<button class='btn primary' id='refreshSkills'>↻ Refresh insights</button>")+
 `<div class="grid metrics">
   ${metric("Unique Skills",state.skills.length,"Across student profiles","✦")}
   ${metric("Top Skill",state.skills[0]?.skill||"—","Most represented","★")}
   ${metric("Skill Coverage",state.students.length?Math.round(state.skills.reduce((a,x)=>a+x.students,0)/state.students.length):0,"Avg. skill mentions / student","◒")}
   ${metric("Recruiters",state.companies.length,"Demand sources","▣")}
 </div>
 <div class="grid two-col" style="margin-top:16px">
   <div class="card"><div class="card-head"><h3>Student Skill Distribution</h3><span>Live from profiles</span></div><div class="card-body skill-bars">${state.skills.slice(0,10).map(x=>`<div class="skill-row"><div><b>${esc(x.skill)}</b><span>${x.students} students</span></div><div class="bar"><i style="width:${Math.max(8,Math.round(x.students/max*100))}%"></i></div></div>`).join("")||"<div class='empty'>Add student skills to populate this view.</div>"}</div></div>
   <div class="card"><div class="card-head"><h3>Recruiter Activity</h3><span>Application volume</span></div><div class="card-body">${recruiterDemand.map(x=>`<div class="report-row"><span>${esc(x.name)}</span><b>${x.count} applications</b></div>`).join("")||"<div class='empty'>No recruiter data.</div>"}</div></div>
 </div>
 <div class="card table-card"><div class="card-head"><h3>Skill Gap Watchlist</h3><span>Simple intelligence layer</span></div><div class="card-body"><div class="insight"><b>Recruiter-ready skills</b><p>Python, SQL, JavaScript, Java, React, Docker and machine learning appear across the current student pool. Use recruiter requirements to identify candidates who need a specific skill before applying.</p></div></div></div>`;
}
function interviewsPage(){
 return header("Interview Center","Schedule, monitor and update every recruitment interview.","<button class='btn primary' id='addInterview'>＋ Schedule interview</button>")+
 `<div class="grid metrics">${metric("Upcoming",state.interviews.filter(x=>x.result==="Scheduled").length,"Scheduled interviews","◷")}${metric("Today",state.interviews.filter(x=>x.interview_date==="2026-09-26").length,"Demo calendar date","◎")}${metric("On-site",state.interviews.filter(x=>x.mode==="On-site").length,"Interview mode","⌂")}${metric("Video",state.interviews.filter(x=>x.mode==="Video").length,"Interview mode","◌")}</div>
 <div class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Date / Time</th><th>Student</th><th>Recruiter</th><th>Role</th><th>Round</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead><tbody>${state.interviews.map(x=>`<tr><td><b>${esc(x.interview_date)}</b><small style="display:block;color:var(--muted)">${esc(x.interview_time)}</small></td><td>${esc(x.student_name)}</td><td>${esc(x.company_name)}</td><td>${esc(x.role)}</td><td>${esc(x.round)}</td><td>${esc(x.mode)}</td><td>${statusBadge(x.result==="Scheduled"?"Shortlisted":x.result)}</td><td><div class="row-actions"><button class="mini-btn" onclick="editInterview(${x.id})">Edit</button><button class="mini-btn" onclick="deleteItem('interviews',${x.id})">Delete</button></div></td></tr>`).join("")||"<tr><td colspan='8' class='empty'>No interviews scheduled.</td></tr>"}</tbody></table></div></div>`;
}
function offersPage(){
 return header("Offers & Outcomes","Track offers, packages and joining details for selected students.","<button class='btn primary' id='addOffer'>＋ Record offer</button>")+
 `<div class="grid metrics">${metric("Offers",state.offers.length,"Recorded offers","★")}${metric("Accepted",state.offers.filter(x=>x.status==="Accepted").length,"Student decisions","✓")}${metric("Highest Package",highestCtc(),"Current highest","₹")}${metric("Selected Students",new Set(state.offers.map(x=>x.student_id)).size,"Unique recipients","◉")}</div>
 <div class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Recruiter</th><th>Role</th><th>Package</th><th>Joining</th><th>Status</th><th>Actions</th></tr></thead><tbody>${state.offers.map(x=>`<tr><td><div class="person"><div class="avatar">${initials(x.student_name)}</div>${esc(x.student_name)}</div></td><td>${esc(x.company_name)}</td><td>${esc(x.role)}</td><td><b>${esc(x.ctc)}</b></td><td>${esc(x.joining_date)}</td><td>${statusBadge(x.status==="Accepted"?"Selected":x.status)}</td><td><div class="row-actions"><button class="mini-btn" onclick="editOffer(${x.id})">Edit</button><button class="mini-btn" onclick="deleteItem('offers',${x.id})">Delete</button></div></td></tr>`).join("")||"<tr><td colspan='7' class='empty'>No offers recorded.</td></tr>"}</tbody></table></div></div>`;
}
function highestCtc(){
 const nums=state.offers.map(x=>{const m=String(x.ctc||"").match(/[\d.]+/);return m?Number(m[0]):0});
 const n=Math.max(0,...nums); return n?n+" LPA":"—";
}

function activityPage(){return header("Activity Center","A transparent audit trail of important placement actions.","<button class='btn' id='clearActivity'>Clear activity</button>")+`<div class="card"><div class="card-body"><div class="activity">${state.activity.map(x=>`<div class="activity-item"><i class="activity-dot"></i><div><b>${esc(x.message)}</b><small>${esc(x.created_at)}</small></div></div>`).join("")||"<div class='empty'>No activity recorded yet.</div>"}</div></div>`}
function settings(){return header("Settings","Workspace preferences and application controls.","<button class='btn primary' id='saveSettings'>Save changes</button>")+`<div class="card"><div class="card-body"><div class="settings-row"><div><b style="font-size:14px">Dark mode</b><small style="display:block;color:var(--muted);font-size:12.5px;margin-top:4px">Use a dark workspace for low-light environments.</small></div><button class="toggle ${state.theme==="dark"?"on":""}" id="darkToggle"><i></i></button></div><div class="settings-row"><div><b style="font-size:14px">Notifications</b><small style="display:block;color:var(--muted);font-size:12.5px;margin-top:4px">Show placement activity alerts.</small></div><button class="toggle on"><i></i></button></div><div class="settings-row"><div><b style="font-size:14px">Academic Year</b><small style="display:block;color:var(--muted);font-size:12.5px;margin-top:4px">Current workspace cycle.</small></div><select class="control"><option>2026–27</option><option>2025–26</option></select></div></div></div>`}
function render(){document.body.classList.toggle("dark",state.theme==="dark");let html=state.page==="dashboard"?dashboard():state.page==="students"?tablePage("students"):state.page==="companies"?tablePage("companies"):state.page==="applications"?applications():state.page==="eligibility"?eligibility():state.page==="skills"?skillsPage():state.page==="interviews"?interviewsPage():state.page==="offers"?offersPage():state.page==="analytics"?analytics():state.page==="activity"?activityPage():settings();app.innerHTML=html;if(state.lastPage!==state.page){state.lastPage=state.page;window.scrollTo({top:0,behavior:"instant"})}document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));bindPage();nav()}
function bindPage(){
 document.getElementById("quickAdd")?.addEventListener("click",()=>addStudent());
 document.getElementById("addBtn")?.addEventListener("click",()=>state.page==="students"?addStudent():addCompany());
 document.getElementById("refreshBtn")?.addEventListener("click",load);
 document.getElementById("addApp")?.addEventListener("click",addApplication);
 document.getElementById("addInterview")?.addEventListener("click",addInterview);
 document.getElementById("addOffer")?.addEventListener("click",addOffer);
 document.getElementById("refreshSkills")?.addEventListener("click",load);
 document.getElementById("allApps")?.addEventListener("click",()=>{state.page="applications";render()});
 document.getElementById("openPipeline")?.addEventListener("click",()=>{state.page="applications";render()});
 document.getElementById("viewAnalytics")?.addEventListener("click",()=>{state.page="analytics";render()});
 document.getElementById("recruitersLink")?.addEventListener("click",()=>{state.page="companies";render()});
 document.getElementById("activityLink")?.addEventListener("click",()=>{state.page="activity";render()});
 document.getElementById("qaStudent")?.addEventListener("click",()=>addStudent());
 document.getElementById("qaCompany")?.addEventListener("click",()=>addCompany());
 document.getElementById("qaApp")?.addEventListener("click",()=>addApplication());
 document.getElementById("qaAnalytics")?.addEventListener("click",()=>{state.page="analytics";render()});

 document.getElementById("exportBtn")?.addEventListener("click",exportCSV);
 document.getElementById("eligRule")?.addEventListener("click",()=>toast("Eligibility rule editor is ready for the current software-role policy."));
 document.getElementById("clearActivity")?.addEventListener("click",async()=>{await api("/api/activity",{method:"DELETE"});await load();toast("Activity cleared")});
 document.getElementById("darkToggle")?.addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";localStorage.setItem("pp-theme",state.theme);render()});
 const ps=document.getElementById("pageSearch");ps?.addEventListener("input",()=>{const q=ps.value.toLowerCase();const a=state.page==="students"?state.students.filter(x=>[x.name,x.email,x.skills,x.branch].join(" ").toLowerCase().includes(q)):state.companies.filter(x=>[x.name,x.role,x.location].join(" ").toLowerCase().includes(q));document.getElementById("dataRows").innerHTML=renderRows(state.page,a)});
 const as=document.getElementById("appSearch"),sf=document.getElementById("statusFilter");const filterApps=()=>{let q=(as?.value||"").toLowerCase(),s=sf?.value||"";document.getElementById("appRows").innerHTML=renderApps(state.applications.filter(a=>[a.student_name,a.company_name,a.role].join(" ").toLowerCase().includes(q)&&(!s||a.status===s)))};as?.addEventListener("input",filterApps);sf?.addEventListener("change",filterApps);
}
function form(fields,values={}){return `<div class="form-grid">${fields.map(f=>`<div class="field ${f.full?"full":""}"><label>${f.label}</label>${f.type==="select"?`<select id="${f.id}">${f.options.map(o=>`<option ${String(values[f.id]??"")===o?"selected":""}>${o}</option>`).join("")}</select>`:`<input id="${f.id}" type="${f.type||"text"}" value="${esc(values[f.id]??"")}" placeholder="${f.placeholder||""}">`}</div>`).join("")}</div>`}
function addStudent(existing){const fields=[{id:"name",label:"Full name",placeholder:"e.g. Aarav Sharma"},{id:"email",label:"Email",type:"email"},{id:"branch",label:"Branch",placeholder:"CSE / IT"},{id:"cgpa",label:"CGPA",type:"number"},{id:"skills",label:"Skills",placeholder:"Python, SQL, Flask"},{id:"placement_status",label:"Placement status",type:"select",options:["Active","Placed","Seeking","Not Eligible"]}];openModal(existing?"Edit Student":"Add Student",form(fields,existing||{}),`<button class="btn" id="cancelM">Cancel</button><button class="btn primary" id="saveM">Save student</button>`);document.getElementById("cancelM").onclick=closeModal;document.getElementById("saveM").onclick=async()=>{let d=Object.fromEntries(fields.map(f=>[f.id,document.getElementById(f.id).value]));d.cgpa=Number(d.cgpa||0);try{await api(existing?`/api/students/${existing.id}`:"/api/students",{method:existing?"PUT":"POST",body:JSON.stringify(d)});closeModal();await load();toast(existing?"Student updated":"Student added")}catch(e){toast("Could not save student","error")}}}
function editStudent(id){addStudent(state.students.find(x=>x.id===id))}
async function studentView(id){const s=state.students.find(x=>x.id===id);const apps=state.applications.filter(a=>a.student_id===id);openModal("Student Profile",`<div class="person" style="margin-bottom:16px"><div class="avatar" style="width:46px;height:46px">${initials(s.name)}</div><div><h3 style="margin:0">${esc(s.name)}</h3><small style="color:var(--muted)">${esc(s.branch)} • CGPA ${esc(s.cgpa)}</small></div></div><div class="insight"><b>Skills</b><p>${esc(s.skills||"No skills recorded")}</p></div><h4 style="font-size:14px">Applications</h4>${apps.map(a=>`<div class="report-row"><span>${esc(a.company_name)} — ${esc(a.role)}</span>${statusBadge(a.status)}</div>`).join("")||"<div class='empty'>No applications yet.</div>"}`,`<button class="btn primary" id="profileEdit">Edit profile</button>`);document.getElementById("profileEdit").onclick=()=>{closeModal();editStudent(id)}}
function addCompany(existing){const fields=[{id:"name",label:"Company name"},{id:"role",label:"Primary role"},{id:"ctc",label:"CTC / package"},{id:"location",label:"Location"},{id:"requirements",label:"Requirements",placeholder:"CGPA, skills, degree"}];openModal(existing?"Edit Recruiter":"Add Recruiter",form(fields,existing||{}),`<button class="btn" id="cancelM">Cancel</button><button class="btn primary" id="saveM">Save recruiter</button>`);document.getElementById("cancelM").onclick=closeModal;document.getElementById("saveM").onclick=async()=>{let d=Object.fromEntries(fields.map(f=>[f.id,document.getElementById(f.id).value]));try{await api(existing?`/api/companies/${existing.id}`:"/api/companies",{method:existing?"PUT":"POST",body:JSON.stringify(d)});closeModal();await load();toast(existing?"Recruiter updated":"Recruiter added")}catch(e){toast("Could not save recruiter","error")}}}
function editCompany(id){addCompany(state.companies.find(x=>x.id===id))}
function companyView(id){const c=state.companies.find(x=>x.id===id),apps=state.applications.filter(a=>a.company_id===id);openModal("Recruiter Profile",`<h3 style="margin-top:0">${esc(c.name)}</h3><p style="font-size:14px;color:var(--muted)">${esc(c.location||"")} • ${esc(c.role||"")} • ${esc(c.ctc||"")}</p><div class="insight"><b>Hiring Requirements</b><p>${esc(c.requirements||"Not specified")}</p></div><h4 style="font-size:14px">Application activity</h4><div class="big-number">${apps.length}</div><p style="font-size:12.5px;color:var(--muted)">applications linked to this recruiter.</p>`,`<button class="btn primary" id="companyEdit">Edit recruiter</button>`);document.getElementById("companyEdit").onclick=()=>{closeModal();editCompany(id)}}
function addApplication(existing){if(!state.students.length||!state.companies.length)return toast("Add at least one student and one recruiter first","error");const fields=[{id:"student_id",label:"Student",type:"select",options:state.students.map(s=>String(s.id)+":"+s.name)},{id:"company_id",label:"Company",type:"select",options:state.companies.map(c=>String(c.id)+":"+c.name)},{id:"role",label:"Role"},{id:"status",label:"Status",type:"select",options:["Applied","Shortlisted","Interview","Selected","Rejected"]},{id:"applied_date",label:"Applied date",type:"date"}];const v=existing?{...existing,student_id:String(existing.student_id),company_id:String(existing.company_id)}:{};openModal(existing?"Update Application":"New Application",form(fields,v),`<button class="btn" id="cancelM">Cancel</button><button class="btn primary" id="saveM">Save application</button>`);document.getElementById("cancelM").onclick=closeModal;document.getElementById("saveM").onclick=async()=>{let d=Object.fromEntries(fields.map(f=>[f.id,document.getElementById(f.id).value.split(":")[0]]));d.student_id=Number(d.student_id);d.company_id=Number(d.company_id);try{await api(existing?`/api/applications/${existing.id}`:"/api/applications",{method:existing?"PUT":"POST",body:JSON.stringify(d)});closeModal();await load();toast(existing?"Application updated":"Application created")}catch(e){toast("Could not save application","error")}}}
function editApp(id){addApplication(state.applications.find(x=>x.id===id))}

function personOptions(list){return list.map(x=>`${x.id}:${x.name}`).join("|")}
function addInterview(existing){
 const fields=[
  {id:"student_id",label:"Student",type:"select",options:state.students.map(s=>String(s.id)+":"+s.name)},
  {id:"company_id",label:"Recruiter",type:"select",options:state.companies.map(c=>String(c.id)+":"+c.name)},
  {id:"role",label:"Role"},
  {id:"round",label:"Round",type:"select",options:["HR Round","Technical Round","Manager Round","Assessment"]},
  {id:"interview_date",label:"Date",type:"date"},
  {id:"interview_time",label:"Time"},
  {id:"mode",label:"Mode",type:"select",options:["Video","On-site","Phone"]},
  {id:"interviewer",label:"Interviewer"},
  {id:"result",label:"Status",type:"select",options:["Scheduled","Completed","Selected","Rejected"]}
 ];
 const v=existing?{...existing,student_id:String(existing.student_id),company_id:String(existing.company_id)}:{};
 openModal(existing?"Edit Interview":"Schedule Interview",form(fields,v),`<button class="btn" id="cancelM">Cancel</button><button class="btn primary" id="saveM">Save interview</button>`);
 document.getElementById("cancelM").onclick=closeModal;
 document.getElementById("saveM").onclick=async()=>{
  let d=Object.fromEntries(fields.map(f=>[f.id,document.getElementById(f.id).value.split(":")[0]]));
  d.student_id=Number(d.student_id); d.company_id=Number(d.company_id);
  try{await api(existing?`/api/interviews/${existing.id}`:"/api/interviews",{method:existing?"PUT":"POST",body:JSON.stringify(d)});closeModal();await load();toast(existing?"Interview updated":"Interview scheduled")}catch(e){toast("Could not save interview","error")}
 };
}
function editInterview(id){addInterview(state.interviews.find(x=>x.id===id))}
function addOffer(existing){
 const fields=[
  {id:"student_id",label:"Student",type:"select",options:state.students.map(s=>String(s.id)+":"+s.name)},
  {id:"company_id",label:"Recruiter",type:"select",options:state.companies.map(c=>String(c.id)+":"+c.name)},
  {id:"role",label:"Role"},
  {id:"ctc",label:"Package / CTC"},
  {id:"joining_date",label:"Joining date",type:"date"},
  {id:"status",label:"Offer status",type:"select",options:["Offer Released","Accepted","Declined","On Hold"]}
 ];
 const v=existing?{...existing,student_id:String(existing.student_id),company_id:String(existing.company_id)}:{};
 openModal(existing?"Edit Offer":"Record Offer",form(fields,v),`<button class="btn" id="cancelM">Cancel</button><button class="btn primary" id="saveM">Save offer</button>`);
 document.getElementById("cancelM").onclick=closeModal;
 document.getElementById("saveM").onclick=async()=>{
  let d=Object.fromEntries(fields.map(f=>[f.id,document.getElementById(f.id).value.split(":")[0]]));
  d.student_id=Number(d.student_id); d.company_id=Number(d.company_id);
  try{await api(existing?`/api/offers/${existing.id}`:"/api/offers",{method:existing?"PUT":"POST",body:JSON.stringify(d)});closeModal();await load();toast(existing?"Offer updated":"Offer recorded")}catch(e){toast("Could not save offer","error")}
 };
}
function editOffer(id){addOffer(state.offers.find(x=>x.id===id))}

async function deleteItem(type,id){if(!confirm("Delete this record?"))return;try{await api(`/api/${type}/${id}`,{method:"DELETE"});await load();toast("Record deleted")}catch(e){toast("Delete failed","error")}}
function exportCSV(){const rows=[["Student","Company","Role","Status","Applied Date"],...state.applications.map(a=>[a.student_name,a.company_name,a.role,a.status,a.applied_date||""])];const csv=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="placementpro-report.csv";a.click();toast("Report exported")}
document.getElementById("menuBtn").onclick=()=>document.body.classList.toggle("nav-open");
document.addEventListener("click",e=>{if(document.body.classList.contains("nav-open")&&!e.target.closest(".sidebar,#menuBtn"))document.body.classList.remove("nav-open")});
document.getElementById("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";localStorage.setItem("pp-theme",state.theme);render()};
document.getElementById("notificationBtn").onclick=()=>openModal("Notifications",insights().map(x=>`<div class="insight"><b>${x.t}</b><p>${x.p}</p></div>`).join(""),`<button class="btn primary" onclick="closeModal()">Close</button>`);
document.getElementById("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.toLowerCase();if(state.students.some(s=>(s.name||"").toLowerCase().includes(q))){state.page="students"}else if(state.companies.some(c=>(c.name||"").toLowerCase().includes(q))){state.page="companies"}else{state.page="applications"}render();const box=document.getElementById(state.page==="applications"?"appSearch":"pageSearch");if(box){box.value=e.target.value;box.dispatchEvent(new Event("input"))}}});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.getElementById("globalSearch").focus()}if(e.key==="Escape")closeModal()});
load().catch(e=>{app.innerHTML=`<div class="card" style="padding:30px"><h2>Could not load PlacementPro</h2><p style="color:var(--muted)">Start the Flask server with <b>python app.py</b> and refresh this page.</p></div>`});
