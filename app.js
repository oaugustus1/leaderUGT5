<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Management | Database Sync</title>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js"></script>
    
    <style>
        :root {
            --bg: #0f172a; --card: #1e293b; --accent: #38bdf8;
            --text: #f1f5f9; --danger: #ef4444; --success: #22c55e;
        }
        body { font-family: sans-serif; background: var(--bg); color: var(--text); padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: var(--card); padding: 20px; border-radius: 12px; border-top: 4px solid var(--accent); }
        .input-group { margin-bottom: 12px; }
        label { display: block; font-size: 0.8rem; margin-bottom: 4px; opacity: 0.7; }
        input { 
            width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #334155;
            background: #0f172a; color: white; box-sizing: border-box;
        }
        button { 
            width: 100%; padding: 10px; border: none; border-radius: 6px; 
            background: var(--success); color: white; cursor: pointer; font-weight: bold; 
        }
        button:hover { opacity: 0.9; }
        .admin-only { display: none; background: #334155; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
    </style>
</head>
<body>

<div class="container">
    <h1>Керування Держ. Структурами</h1>
    
    <div id="admin-panel" class="admin-only">
        <h3>Панель Вищої Адміністрації</h3>
        <p>Права доступу: Створення акаунтів та зміна ролей дозволена.</p>
    </div>

    <div class="grid" id="org-list">
        </div>
</div>

<script>
    // --- 1. ВСТАВТЕ ВАШІ ДАНІ З FIREBASE ТУТ ---
    const firebaseConfig = {
       const firebaseConfig = {
  apiKey: "AIzaSyAjBvyxNONDfo3zZxfwMXsCP_yojfvt6Ug",
  authDomain: "leaderugt5.firebaseapp.com",
  projectId: "leaderugt5"
    };

    // Ініціалізація
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Роль користувача (для тесту: 'admin' або 'leader')
    const userRole = 'admin'; 

    const orgs = ["Government", "LSPD", "BCSD", "FIB", "Army", "WZL", "EMS Hospital"];

    // --- 2. СИНХРОНІЗАЦІЯ З БАЗОЮ В РЕАЛЬНОМУ ЧАСІ ---
    function initApp() {
        if (userRole === 'admin') document.getElementById('admin-panel').style.display = 'block';

        const orgList = document.getElementById('org-list');

        // Слухаємо зміни в базі даних
        database.ref('organizations').on('value', (snapshot) => {
            const data = snapshot.val() || {};
            orgList.innerHTML = '';

            orgs.forEach(org => {
                const info = data[org] || { leader: "Відсутній", points: 10, oral: 0, strict: 0 };
                
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h2>${org}</h2>
                    <div class="input-group">
                        <label>Лідер</label>
                        <input type="text" id="leader-${org}" value="${info.leader}">
                    </div>
                    <div class="input-group">
                        <label>Бали (10-150)</label>
                        <input type="number" id="pts-${org}" value="${info.points}" min="10" max="150">
                    </div>
                    <div style="display:flex; gap:10px">
                        <div class="input-group">
                            <label>Усні</label>
                            <input type="number" id="oral-${org}" value="${info.oral}" max="3">
                        </div>
                        <div class="input-group">
                            <label>Суворі</label>
                            <input type="number" id="strict-${org}" value="${info.strict}" max="3">
                        </div>
                    </div>
                    <button onclick="updateOrg('${org}')">ОНОВИТИ В БАЗІ</button>
                `;
                orgList.appendChild(card);
            });
        });
    }

    // --- 3. ФУНКЦІЯ ЗАПИСУ В БАЗУ ---
    function updateOrg(name) {
        const leader = document.getElementById(`leader-${name}`).value;
        let points = parseInt(document.getElementById(`pts-${name}`).value);
        const oral = parseInt(document.getElementById(`oral-${name}`).value);
        const strict = parseInt(document.getElementById(`strict-${name}`).value);

        // Валідація лімітів балів
        if (points < 10) points = 10;
        if (points > 150) points = 150;

        database.ref('organizations/' + name).set({
            leader: leader,
            points: points,
            oral: oral,
            strict: strict,
            lastUpdated: new Date().toLocaleString()
        }).then(() => {
            console.log("Дані успішно синхронізовано з хмарою");
        }).catch((error) => {
            alert("Помилка доступу до бази: " + error.message);
        });
    }

    initApp();
</script>
</body>
</html>
