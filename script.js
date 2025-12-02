
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let currentAlarmId = null;
let lastAlarmMinute = null;


const elements = {
    navAdd: document.getElementById('nav-add'),
    navEvents: document.getElementById('nav-events'),
    addAlarmSection: document.getElementById('add-alarm'),
    eventsSection: document.getElementById('events'),
    alarmMinuteInput: document.getElementById('alarmMinute'),
    alarmNameInput: document.getElementById('alarmName'),
    alarmEffectSelect: document.getElementById('alarmEffect'),
    addAlarmBtn: document.getElementById('addAlarmBtn'),
    eventsList: document.getElementById('eventsList'),
    timeDisplay: document.getElementById('timeDisplay'),
    themeToggle: document.getElementById('themeToggle'),
    alarmOverlay: document.getElementById('alarmOverlay'),
    alarmMessage: document.getElementById('alarmMessage'),
    alarmAcknowledge: document.getElementById('alarmAcknowledge')
};


function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
}

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    elements.themeToggle.innerHTML = isDark 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
}


elements.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    updateThemeIcon();
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


elements.navAdd.addEventListener('click', () => {
    showSection('add-alarm');
    setActiveNav(elements.navAdd);
});

elements.navEvents.addEventListener('click', () => {
    showSection('events');
    setActiveNav(elements.navEvents);
    renderEvents();
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function setActiveNav(button) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
}


elements.addAlarmBtn.addEventListener('click', addAlarm);

function addAlarm() {
    const minuteValue = parseInt(elements.alarmMinuteInput.value) || 0;
    
    if (minuteValue < 0 || minuteValue > 59) {
        alert('Please enter a minute between 0 and 59');
        return;
    }

    const minute = String(minuteValue).padStart(2, '0');
    const name = elements.alarmNameInput.value.trim() || 'Untitled Alarm';
    const effect = elements.alarmEffectSelect.value;

    const alarm = {
        id: Date.now(),
        minute,
        name,
        effect,
        enabled: true,
        createdAt: new Date().toLocaleString()
    };

    alarms.push(alarm);
    saveAlarms();

  
    elements.alarmMinuteInput.value = '07';
    elements.alarmNameInput.value = '';
    elements.alarmEffectSelect.value = 'multicolor';

    alert(`Alarm "${name}" created for xx:${minute}`);
}


function renderEvents() {
    if (alarms.length === 0) {
        elements.eventsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No alarms created yet. Go to Add Alarm to create one!</p>
            </div>
        `;
        return;
    }

    elements.eventsList.innerHTML = alarms.map(alarm => `
        <div class="event-card ${!alarm.enabled ? 'disabled' : ''}">
            <div class="event-info">
                <h3>
                    <i class="fas fa-${alarm.enabled ? 'check-circle' : 'circle'}"></i>
                    ${alarm.name}
                </h3>
                <p>
                    <i class="fas fa-clock"></i> Every xx:${alarm.minute} | 
                    <i class="fas fa-palette"></i> ${formatEffect(alarm.effect)} | 
                    <i class="fas fa-${alarm.enabled ? 'play' : 'pause'}"></i> ${alarm.enabled ? 'Enabled' : 'Disabled'}
                </p>
            </div>
            <div class="event-actions">
                <button class="btn-small" onclick="toggleAlarm(${alarm.id})" title="${alarm.enabled ? 'Disable' : 'Enable'}">
                    <i class="fas fa-${alarm.enabled ? 'toggle-on' : 'toggle-off'}"></i>
                    ${alarm.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-small" onclick="editAlarm(${alarm.id})" title="Edit alarm">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn-small danger" onclick="deleteAlarm(${alarm.id})" title="Delete alarm">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function formatEffect(effect) {
    const effects = {
        'multicolor': 'Flashy Multicolor',
        'blackwhite': 'Black & White',
        'redwarning': 'Red Warning'
    };
    return effects[effect] || effect;
}


window.toggleAlarm = function(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.enabled = !alarm.enabled;
        saveAlarms();
        renderEvents();
    }
};

window.editAlarm = function(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        elements.alarmMinuteInput.value = alarm.minute;
        elements.alarmNameInput.value = alarm.name;
        elements.alarmEffectSelect.value = alarm.effect;
        deleteAlarm(id);
        showSection('add-alarm');
        setActiveNav(elements.navAdd);
    }
};

window.deleteAlarm = function(id) {
    if (confirm('Are you sure you want to delete this alarm?')) {
        alarms = alarms.filter(a => a.id !== id);
        saveAlarms();
        renderEvents();
    }
};

function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}


function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    elements.timeDisplay.textContent = `${hours}:${minutes}`;

    checkAlarms(minutes);
}

function checkAlarms(currentMinute) {
    if (currentAlarmId !== null) return; 
    if (currentMinute === lastAlarmMinute) return; 

    const enabledAlarms = alarms.filter(a => a.enabled && a.minute === currentMinute);

    if (enabledAlarms.length > 0) {
        const alarm = enabledAlarms[0];
        currentAlarmId = alarm.id;
        lastAlarmMinute = currentMinute;
        triggerAlarm(alarm);
    }
}

function triggerAlarm(alarm) {
    elements.alarmMessage.textContent = alarm.name.toUpperCase();
    elements.alarmOverlay.className = `alarm-overlay active ${alarm.effect}`;
}


elements.alarmAcknowledge.addEventListener('click', () => {
    elements.alarmOverlay.classList.remove('active');
    currentAlarmId = null;
});


function init() {
    initTheme();
    updateTime();
    setInterval(updateTime, 1000);
    renderEvents();
}


document.addEventListener('DOMContentLoaded', init);