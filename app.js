// 🔥 ВСТАВ СЮДИ СВІЙ FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAjBvyxNONDfo3zZxfwMXsCP_yojfvt6Ug",
  authDomain: "leaderugt5.firebaseapp.com",
  projectId: "leaderugt5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;

// 👑 акаунти
const users = {
  "Octavian": { password: "30072002", role: "owner" },
  "Katysokal": { password: "123456", role: "deputy" }
};

// 🔐 ЛОГІН
function login() {
  const login = document.getElementById("login").value;
  const pass = document.getElementById("password").value;

  if (!users[login] || users[login].password !== pass) {
    alert("Невірний логін або пароль");
    return;
  }

  currentUser = {
    username: login,
    role: users[login].role,
    id: login
  };

  document.getElementById("app").style.display = "block";
  document.getElementById("user").innerText =
    login + " | " + currentUser.role;

  loadTickets();
}

// 🎫 СТВОРЕННЯ
async function createTicket() {
  const text = prompt("Введи текст:");
  if (!text) return;

  await db.collection("tickets").add({
    userId: currentUser.id,
    username: currentUser.username,
    text: text,
    status: "open",
    createdAt: Date.now()
  });

  loadTickets();
}

// 📥 ЗАВАНТАЖЕННЯ
async function loadTickets() {
  const snapshot = await db.collection("tickets").get();
  const container = document.getElementById("tickets");
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const t = doc.data();

    if (
      t.userId !== currentUser.id &&
      currentUser.role !== "owner" &&
      currentUser.role !== "deputy"
    ) return;

    const div = document.createElement("div");

    div.innerHTML = `
      <b>${t.username}</b><br>
      ${t.text}<br>
      Статус: ${t.status}<br>
      ${getButtons(doc.id, t.status)}
      <hr>
    `;

    container.appendChild(div);
  });
}

// 🎛 КНОПКИ
function getButtons(id, status) {
  if (currentUser.role !== "owner" && currentUser.role !== "deputy") return "";

  if (status === "open") {
    return `<button onclick="setStatus('${id}','in_progress')">Взяти</button>`;
  }
  if (status === "in_progress") {
    return `<button onclick="setStatus('${id}','closed')">Закрити</button>`;
  }

  return "";
}

// 🔄 СТАТУС
async function setStatus(id, status) {
  await db.collection("tickets").doc(id).update({ status });
  loadTickets();
}
