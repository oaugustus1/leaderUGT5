import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Твої конфігураційні дані, які ти надав
const firebaseConfig = {
  apiKey: "AIzaSyAjBvyxNONDfo3zZxfwMXsCP_yojfvt6Ug",
  authDomain: "leaderugt5.firebaseapp.com",
  projectId: "leaderugt5",
  storageBucket: "leaderugt5.firebasestorage.app",
  messagingSenderId: "873118641338",
  appId: "1:873118641338:web:f4d4c64bad53e3302c6683",
  measurementId: "G-G03E0F5NRT",
  databaseURL: "https://leaderugt5-default-rtdb.firebaseio.com" // Автоматично сформовано для твого проекту
};

// Ініціалізація
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const USERS = [
    { login: 'Octavian', pass: '30072002', role: 'Curator State', name: 'Octavian' },
    { login: 'admin', pass: 'admin', role: 'Main Admin', name: 'Адміністратор' }
];

let currentUser = null;

// ЛОГІКА ВХОДУ
document.getElementById('loginBtn').onclick = () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const found = USERS.find(user => user.login === u && user.pass === p);

    if (found) {
        currentUser = found;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('user-display').innerText = currentUser.name;
        
        if (['Main Admin', 'Curator State'].includes(currentUser.role)) {
            document.getElementById('admin-panel').classList.remove('hidden');
        }
        initRealtimeSync();
    } else {
        alert('Помилка: Невірні дані!');
    }
};

// СИНХРОНІЗАЦІЯ В РЕАЛЬНОМУ ЧАСІ
function initRealtimeSync() {
    // Отримання організацій
    onValue(ref(db, 'organizations'), (snapshot) => {
        const data = snapshot.val();
        if (data) renderOrgs(data);
        else seedDatabase(); 
    });

    // Отримання логів
    onValue(ref(db, 'logs'), (snapshot) => {
        const logs = snapshot.val();
        if (logs) renderLogs(logs);
    });
}

function renderOrgs(orgs) {
    const list = document.getElementById('org-list');
    list.innerHTML = '';
    Object.keys(orgs).forEach(key => {
        const org = orgs[key];
        const div = document.createElement('div');
        div.className = 'card p-6 flex flex-col justify-between shadow-lg';
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h4 class="text-xl font-bold text-white">${org.name}</h4>
                    <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">${org.points} PTS</span>
                </div>
                <p class="text-sm text-slate-400 mb-6 font-medium">Лідер: <span class="text-slate-200">${org.leader}</span></p>
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <p class="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Усні</p>
                        <p class="text-xl font-bold text-yellow-500">${org.warnings.oral}</p>
                    </div>
                    <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <p class="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Суворі</p>
                        <p class="text-xl font-bold text-red-500">${org.warnings.strict}</p>
                    </div>
                </div>
            </div>
            <button onclick="window.manageOrg('${key}')" class="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm font-bold transition-all uppercase tracking-widest">Управління</button>
        `;
        list.appendChild(div);
    });
}

// ФУНКЦІЇ УПРАВЛІННЯ
window.manageOrg = (id) => {
    onValue(ref(db, `organizations/${id}`), (snapshot) => {
        const org = snapshot.val();
        document.getElementById('modal-title').innerText = org.name;
        document.getElementById('modal-content').innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="window.updateDb('${id}', 'oral', 1)" class="bg-yellow-600 p-3 rounded-xl text-white font-bold text-[10px] uppercase shadow-md hover:bg-yellow-500 transition-colors">+ Усна</button>
                    <button onclick="window.updateDb('${id}', 'strict', 1)" class="bg-red-600 p-3 rounded-xl text-white font-bold text-[10px] uppercase shadow-md hover:bg-red-500 transition-colors">+ Сувора</button>
                </div>
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div class="flex gap-2">
                        <input type="number" id="pts-input" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white" placeholder="Кількість балів">
                        <button onclick="window.addPts('${id}')" class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white font-bold text-xs">OK</button>
                    </div>
                </div>
                <button onclick="window.newLeader('${id}')" class="w-full bg-blue-600/10 text-blue-400 border border-blue-600/30 p-3 rounded-xl font-bold text-xs uppercase hover:bg-blue-600 hover:text-white transition-all">Змінити лідера</button>
            </div>
        `;
    }, { onlyOnce: true });
    document.getElementById('modal-overlay').classList.remove('hidden');
};

window.updateDb = (id, type, val) => {
    onValue(ref(db, `organizations/${id}`), (snapshot) => {
        const org = snapshot.val();
        if (type === 'oral') org.warnings.oral += val;
        if (type === 'strict') org.warnings.strict += val;
        set(ref(db, `organizations/${id}`), org);
        addCloudLog(`[${org.name}] Оновлено догани.`);
        document.getElementById('modal-overlay').classList.add('hidden');
    }, { onlyOnce: true });
};

window.addPts = (id) => {
    const val = parseInt(document.getElementById('pts-input').value);
    if (!val) return;
    onValue(ref(db, `organizations/${id}`), (snapshot) => {
        const org = snapshot.val();
        org.points += val;
        set(ref(db, `organizations/${id}`), org);
        addCloudLog(`[${org.name}] Нараховано ${val} балів. (Разом: ${org.points})`);
        document.getElementById('modal-overlay').classList.add('hidden');
    }, { onlyOnce: true });
};

window.newLeader = (id) => {
    const name = prompt("Введіть ім'я лідера:");
    if (!name) return;
    onValue(ref(db, `organizations/${id}`), (snapshot) => {
        const org = snapshot.val();
        const old = org.leader;
        org.leader = name;
        set(ref(db, `organizations/${id}`), org);
        addCloudLog(`[${org.name}] Зміна лідера: ${old} -> ${name}`);
        document.getElementById('modal-overlay').classList.add('hidden');
    }, { onlyOnce: true });
};

function addCloudLog(msg) {
    const logRef = ref(db, 'logs');
    const newLogRef = push(logRef);
    set(newLogRef, {
        message: msg,
        user: currentUser.name,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    });
}

function renderLogs(logs) {
    const container = document.getElementById('action-logs');
    // Перетворюємо об'єкт у масив, розвертаємо, щоб нові були зверху
    const logsArray = Object.values(logs).reverse();
    container.innerHTML = logsArray.slice(0, 50).map(log => `
        <div class="text-[10px] border-b border-slate-800 pb-1 py-1">
            <span class="text-slate-500">[${log.time}]</span> 
            <span class="text-blue-400 font-bold">${log.user}:</span> 
            <span class="text-slate-300">${log.message}</span>
        </div>
    `).join('');
}

function seedDatabase() {
    const defaultData = {
        gov: { name: 'Government', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
        lspd: { name: 'LSPD', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
        ems: { name: 'EMS', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
        fib: { name: 'FIB', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
        bcsd: { name: 'BCSD', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
        wn: { name: 'WZL News', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } }
    };
    set(ref(db, 'organizations'), defaultData);
}
