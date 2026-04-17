// Користувачі
const USERS = [
    { login: 'Octavian', pass: '30072002', role: 'Curator State', name: 'Octavian' },
    { login: 'admin', pass: 'admin', role: 'Main Admin', name: 'Адміністратор' }
];

// Початкові дані організацій
const DEFAULT_ORGS = [
    { id: 'gov', name: 'Government', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
    { id: 'lspd', name: 'LSPD', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
    { id: 'ems', name: 'EMS Hospital', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
    { id: 'wn', name: 'WZL News', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
    { id: 'bcsd', name: 'BCSD', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } },
    { id: 'fib', name: 'FIB', leader: 'Вакантно', points: 0, warnings: { oral: 0, strict: 0 } }
];

let organizations = JSON.parse(localStorage.getItem('state_db_final')) || DEFAULT_ORGS;
let currentUser = null;

// Функція входу
window.handleLogin = function() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();

    const found = USERS.find(user => user.login === u && user.pass === p);

    if (found) {
        currentUser = found;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        document.getElementById('user-display-name').innerText = currentUser.name;
        document.getElementById('user-role-badge').innerText = currentUser.role;
        document.getElementById('user-welcome').innerText = `Вітаємо, ${currentUser.name}!`;

        if (['Main Admin', 'Curator State'].includes(currentUser.role)) {
            document.getElementById('admin-panel').classList.remove('hidden');
        }
        renderOrgs();
    } else {
        alert('Помилка: Невірні дані!');
    }
};

// Підтримка Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !document.getElementById('login-screen').classList.contains('hidden')) {
        handleLogin();
    }
});

function renderOrgs() {
    const list = document.getElementById('org-list');
    list.innerHTML = '';
    organizations.forEach(org => {
        const div = document.createElement('div');
        div.className = 'card p-6 border border-slate-700 flex flex-col justify-between shadow-lg';
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h4 class="text-xl font-bold text-white">${org.name}</h4>
                    <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">${org.points} PTS</span>
                </div>
                <p class="text-sm text-slate-400 mb-6 font-medium">Лідер: <span class="text-slate-200">${org.leader}</span></p>
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <p class="text-[10px] uppercase text-slate-500 font-bold mb-1">Усні</p>
                        <p class="text-xl font-bold text-yellow-500">${org.warnings.oral}</p>
                    </div>
                    <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <p class="text-[10px] uppercase text-slate-500 font-bold mb-1">Суворі</p>
                        <p class="text-xl font-bold text-red-500">${org.warnings.strict}</p>
                    </div>
                </div>
            </div>
            <button onclick="manageOrg('${org.id}')" class="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm font-bold transition-all">Керування</button>
        `;
        list.appendChild(div);
    });
}

window.manageOrg = function(id) {
    const org = organizations.find(o => o.id === id);
    document.getElementById('modal-title').innerText = org.name;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
            <button onclick="updateStat('${id}', 'oral', 1)" class="bg-yellow-600 p-3 rounded-xl text-white font-bold text-[10px] uppercase shadow-md">+ Усна догана</button>
            <button onclick="updateStat('${id}', 'strict', 1)" class="bg-red-600 p-3 rounded-xl text-white font-bold text-[10px] uppercase shadow-md">+ Сувора догана</button>
            <button onclick="updateStat('${id}', 'points', 10)" class="bg-green-600 p-3 rounded-xl text-white font-bold text-[10px] uppercase shadow-md">+ 10 Балів</button>
            <button onclick="updateStat('${id}', 'points', -10)" class="bg-slate-700 p-3 rounded-xl text-white font-bold text-[10px] uppercase shadow-md">- 10 Балів</button>
        </div>
        <button onclick="setLeader('${id}')" class="w-full mt-4 bg-blue-600/10 text-blue-400 border border-blue-600/30 p-3 rounded-xl font-bold text-xs uppercase hover:bg-blue-600 hover:text-white transition-all">Змінити лідера</button>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
};

window.updateStat = function(id, type, val) {
    const org = organizations.find(o => o.id === id);
    if (type === 'oral') org.warnings.oral += val;
    if (type === 'strict') org.warnings.strict += val;
    if (type === 'points') org.points += val;
    save();
    renderOrgs();
    closeModal();
};

window.setLeader = function(id) {
    const name = prompt("Введіть ім'я лідера:");
    if (name) {
        organizations.find(o => o.id === id).leader = name;
        save();
        renderOrgs();
        closeModal();
    }
};

function save() { localStorage.setItem('state_db_final', JSON.stringify(organizations)); }
window.closeModal = function() { document.getElementById('modal-overlay').classList.add('hidden'); };
window.logout = function() { location.reload(); };
