// ВСТАВ СЮДИ СВІЙ FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAjBvyxNONDfo3zZxfwMXsCP_yojfvt6Ug",
  authDomain: "leaderugt5.firebaseapp.com",
  projectId: "leaderugt5"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = null;

function getRole(username) {
  if (username === "oaugustus1") return "owner";
  if (username === "Katysokal") return "deputy";
  return "leader";
}

window.onTelegramAuth = async function(user) {
  currentUser = user;

  document.getElementById("app").style.display = "block";
  document.getElementById("user").innerText =
    `@${user.username} | ${getRole(user.username)}`;

  loadTickets();
};

async function createTicket() {
  const text = prompt("Текст:");
  if (!text) return;

  await addDoc(collection(db, "tickets"), {
    userId: currentUser.id,
    username: currentUser.username,
    text,
    status: "open",
    createdAt: Date.now()
  });

  loadTickets();
}

async function loadTickets() {
  const snap = await getDocs(collection(db, "tickets"));
  const div = document.getElementById("tickets");
  div.innerHTML = "";

  snap.forEach(docSnap => {
    const t = docSnap.data();

    if (
      t.userId !== currentUser.id &&
      getRole(currentUser.username) !== "owner" &&
      getRole(currentUser.username) !== "deputy"
    ) return;

    const el = document.createElement("div");

    el.innerHTML = `
      <b>@${t.username}</b><br>
      ${t.text}<br>
      Статус: ${t.status}<br>
      ${buttons(docSnap.id, t.status)}
      <hr>
    `;

    div.appendChild(el);
  });
}

function buttons(id, status) {
  const role = getRole(currentUser.username);

  if (role !== "owner" && role !== "deputy") return "";

  if (status === "open") {
    return `<button onclick="setStatus('${id}','in_progress')">Взяти</button>`;
  }
  if (status === "in_progress") {
    return `<button onclick="setStatus('${id}','closed')">Закрити</button>`;
  }

  return "";
}

window.setStatus = async function(id, status) {
  await updateDoc(doc(db, "tickets", id), { status });
  loadTickets();
};
