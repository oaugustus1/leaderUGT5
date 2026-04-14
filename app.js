> Святослав:
// 🔥 ВСТАВ СВІЙ FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAjBvyxNONDfo3zZxfwMXsCP_yojfvt6Ug",
  authDomain: "leaderugt5.firebaseapp.com",
  projectId: "leaderugt5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;

const orgs = ["Government","LSPD","BCSD","FIB","EMS","Army","WZL"];

// ===== РОЛІ =====
function isAdmin(){
  return ["owner","deputy","curator_state"].includes(currentUser.role);
}

function isCuratorOrg(org){
  return currentUser.role==="curator_org" &&
         currentUser.orgs?.includes(org);
}

// ===== AUTH =====

// створення owner якщо нема
async function ensureOwner(){
  let snap = await db.collection("users")
    .where("login","==","Octavian")
    .get();

  if(snap.empty){
    await db.collection("users").add({
      login:"Octavian",
      password:"30072002",
      role:"owner",
      orgs:[]
    });
  }
}

// автологін
function autoLogin(){
  let saved = localStorage.getItem("user");
  if(!saved) return;

  currentUser = JSON.parse(saved);

  app.style.display="block";
  user.innerText=currentUser.login+" | "+currentUser.role;

  initOrgSelect();
  loadAll();
}

// логін
async function loginUser(){
  let l = login.value;
  let p = password.value;

  let snap = await db.collection("users")
    .where("login","==",l)
    .where("password","==",p)
    .get();

  if(snap.empty){
    alert("Невірно");
    return;
  }

  currentUser = snap.docs[0].data();

  localStorage.setItem("user", JSON.stringify(currentUser));

  app.style.display="block";
  user.innerText=currentUser.login+" | "+currentUser.role;

  initOrgSelect();
  loadAll();
}

// вихід
function logout(){
  localStorage.removeItem("user");
  location.reload();
}

// ===== LOGS =====
function log(action){
  db.collection("logs").add({
    user:currentUser.login,
    role:currentUser.role,
    action,
    time:new Date().toLocaleString()
  });
}

// ===== LOAD =====
function loadAll(){
  loadLeaders();
  loadTickets();
  loadLogs();
  loadAdmin();
}

// ===== ЛІДЕРИ =====
async function loadLeaders(){
  leaders.innerHTML="";

  let snap = await db.collection("leaders").get();

  orgs.forEach(o=>{
    if(currentUser.role==="curator_org" && !isCuratorOrg(o)) return;

    let d = snap.docs.find(x=>x.id===o);
    let data = d ? d.data() : {name:"-",points:10,warns:0};

    let div = document.createElement("div");
    div.className="card";

    div.innerHTML = `
    <b>${o}</b> (${data.name})<br>
    Бали: ${data.points} | Догани: ${data.warns}<br>

    ${isAdmin() || isCuratorOrg(o) ? `
      <button onclick="changeLeader('${o}')">Змінити</button>
      <button onclick="points('${o}',1)">+Бали</button>
      <button onclick="points('${o}',-1)">-Бали</button>
      <button onclick="warn('${o}',1)">+Догана</button>
      <button onclick="warn('${o}',-1)">-Догана</button>
    ` : ""}
    `;

    leaders.appendChild(div);
  });
}

async function changeLeader(org){
  let name = prompt("Новий лідер:");

  await db.collection("leaders").doc(org).set({
    name,
    points:10,
    warns:0
  });

  log("Зміна лідера "+org);
  loadLeaders();
}

async function points(org,val){
  let ref = db.collection("leaders").doc(org);
  let d = (await ref.get()).data();

  let newPoints = Math.max(0,Math.min(10,d.points+val));

  await ref.set({...d,points:newPoints});
  log("Бали "+org);
  loadLeaders();
}

async function warn(org,val){
  let ref = db.collection("leaders").doc(org);
  let d = (await ref.get()).data();

  let newWarns = Math.max(0,d.warns+val);

  await ref.set({...d,warns:newWarns});
  log("Догани "+org);
  loadLeaders();
}

// ===== ТІКЕТИ =====
async function createTicket(){
  let text = prompt("Текст");
  if(!text) return;

  await db.collection("tickets").add({
    user:currentUser.login,
    org:currentUser.org || "Unknown",
    text,
    status:"open"
  });

  log("Створив тікет");
  loadTickets();
}

async function loadTickets(){
  tickets.innerHTML="";

  let snap = await db.collection("tickets").get();

  snap.forEach(doc=>{
    let t = doc.data();

    if(currentUser.role==="leader" && t.user!==currentUser.login) return;

> Святослав:
if(currentUser.role==="curator_org" && !currentUser.orgs.includes(t.org)) return;

    let div = document.createElement("div");
    div.className="card";

    div.innerHTML = `
    <b>${t.user}</b> (${t.org})<br>
    ${t.text}<br>
    ${t.status}<br>
    <button onclick="setStatus('${doc.id}','in_progress')">Взяти</button>
    <button onclick="setStatus('${doc.id}','closed')">Закрити</button>
    `;

    tickets.appendChild(div);
  });
}

async function setStatus(id,status){
  await db.collection("tickets").doc(id).update({status});
  log("Статус тікета "+status);
  loadTickets();
}

// ===== АДМІНКА =====
function loadAdmin(){
  if(!isAdmin()) return;

  admin.innerHTML = `
  <div class="card">
  <input id="newLogin" placeholder="логін">
  <input id="newPass" placeholder="пароль">

  <select id="roleSelect">
    <option value="leader">Leader</option>
    <option value="curator_org">Curator Org</option>
    <option value="curator_state">Curator State</option>
    <option value="deputy">Deputy</option>
  </select>

  <input id="orgsInput" placeholder="org1,org2">

  <button onclick="createUser()">Створити</button>
  </div>
  `;
}

async function createUser(){
  let login = newLogin.value;
  let password = newPass.value;
  let role = roleSelect.value;
  let orgs = orgsInput.value.split(",");

  await db.collection("users").add({
    login,
    password,
    role,
    orgs
  });

  log("Створив користувача "+login);
}

// ===== ОНЛАЙН =====
const SHEET_URL = "https://opensheet.elk.sh/ID/Sheet1";

function initOrgSelect(){
  orgSelect.innerHTML="";
  orgs.forEach(o=>{
    let opt=document.createElement("option");
    opt.value=o;
    opt.innerText=o;
    orgSelect.appendChild(opt);
  });
}

async function loadOnline(){
  let org = orgSelect.value;

  let res = await fetch(SHEET_URL);
  let data = await res.json();

  let filtered = data.filter(x=>x.org===org);

  let total=0;
  let html=`<div class="card"><b>${org}</b><br>`;

  filtered.forEach(r=>{
    let sum =
      +r.mon + +r.tue + +r.wed +
      +r.thu + +r.fri + +r.sat + +r.sun;

    total+=sum;
    html+=`${r.name}: ${sum} год<br>`;
  });

  html+=`<br><b>Всього: ${total} год</b></div>`;
  online.innerHTML=html;
}

// ===== ЛОГИ =====
async function loadLogs(){
  logs.innerHTML="";

  let snap = await db.collection("logs")
    .orderBy("time","desc")
    .limit(30)
    .get();

  snap.forEach(doc=>{
    let l = doc.data();

    let div=document.createElement("div");
    div.className="card";

    div.innerHTML = `
    ${l.time}<br>
    ${l.user} (${l.role}) → ${l.action}
    `;

    logs.appendChild(div);
  });
}

// ===== INIT =====
ensureOwner().then(()=>{
  autoLogin();
});
