 let alarms = [];
        let currentAlarmId = null;
        let lastAlarmTime = null;

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
            alarmOverlay: document.getElementById('alarmOverlay'),
            alarmMessage: document.getElementById('alarmMessage'),
            alarmAcknowledge: document.getElementById('alarmAcknowledge'),
            specificHour: document.getElementById('specificHour'),
            specificMinute: document.getElementById('specificMinute'),
            specificAlarmName: document.getElementById('specificAlarmName'),
            minuteMode: document.getElementById('minute-mode'),
            specificMode: document.getElementById('specific-mode')
        };

        let currentMode = 'minute';

        document.querySelectorAll('.time-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-mode-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.time-mode-section').forEach(s => s.classList.remove('active'));
                
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                if (currentMode === 'minute') {
                    elements.minuteMode.classList.add('active');
                } else {
                    elements.specificMode.classList.add('active');
                }
            });
        });

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const icon = type === 'success' 
                ? '<i class="fas fa-check-circle"></i>'
                : '<i class="fas fa-exclamation-circle"></i>';
            
            notification.innerHTML = `${icon}<span>${message}</span>`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

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
            let alarm;

            if (currentMode === 'minute') {
                const minuteValue = parseInt(elements.alarmMinuteInput.value) || 0;
                
                if (minuteValue < 0 || minuteValue > 59) {
                    showNotification('Please enter a minute between 0 and 59', 'error');
                    return;
                }

                const minute = String(minuteValue).padStart(2, '0');
                const name = elements.alarmNameInput.value.trim() || 'Untitled Alarm';

                alarm = {
                    id: Date.now(),
                    type: 'minute',
                    minute,
                    name,
                    effect: elements.alarmEffectSelect.value,
                    enabled: true,
                    createdAt: new Date().toLocaleString()
                };

                elements.alarmMinuteInput.value = '00';
                elements.alarmNameInput.value = '';
                showNotification(`Alarm "${name}" created for xx:${minute}`);

            } else {
                const hour = String(parseInt(elements.specificHour.value) || 0).padStart(2, '0');
                const minute = String(parseInt(elements.specificMinute.value) || 0).padStart(2, '0');
                const name = elements.specificAlarmName.value.trim() || 'Untitled Alarm';

                if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                    showNotification('Please enter valid time', 'error');
                    return;
                }

                alarm = {
                    id: Date.now(),
                    type: 'specific',
                    hour,
                    minute,
                    name,
                    effect: elements.alarmEffectSelect.value,
                    enabled: true,
                    createdAt: new Date().toLocaleString()
                };

                elements.specificHour.value = '00';
                elements.specificMinute.value = '00';
                elements.specificAlarmName.value = '';
                showNotification(`Alarm "${name}" created for ${hour}:${minute}`);
            }

            alarms.push(alarm);
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

            elements.eventsList.innerHTML = alarms.map(alarm => {
                const timeStr = alarm.type === 'minute' 
                    ? `xx:${alarm.minute}`
                    : `${alarm.hour}:${alarm.minute}`;

                return `
                    <div class="event-card ${!alarm.enabled ? 'disabled' : ''}">
                        <div class="event-info">
                            <h3>
                                <i class="fas fa-${alarm.enabled ? 'check-circle' : 'circle'}"></i>
                                ${alarm.name}
                            </h3>
                            <p>
                                <i class="fas fa-clock"></i> ${timeStr} | 
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
                `;
            }).join('');
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
                renderEvents();
            }
        };

        window.editAlarm = function(id) {
            const alarm = alarms.find(a => a.id === id);
            if (alarm) {
                if (alarm.type === 'minute') {
                    elements.alarmMinuteInput.value = alarm.minute;
                    elements.alarmNameInput.value = alarm.name;
                } else {
                    elements.specificHour.value = alarm.hour;
                    elements.specificMinute.value = alarm.minute;
                    elements.specificAlarmName.value = alarm.name;
                    currentMode = 'specific';
                    document.querySelectorAll('.time-mode-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.time-mode-section').forEach(s => s.classList.remove('active'));
                    document.querySelector('[data-mode="specific"]').classList.add('active');
                    elements.specificMode.classList.add('active');
                }
                elements.alarmEffectSelect.value = alarm.effect;
                deleteAlarm(id);
                showSection('add-alarm');
                setActiveNav(elements.navAdd);
            }
        };

        window.deleteAlarm = function(id) {
            alarms = alarms.filter(a => a.id !== id);
            renderEvents();
            showNotification('Alarm deleted', 'success');
        };

        function updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            elements.timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;

            checkAlarms(hours, minutes);
        }

        function checkAlarms(currentHour, currentMinute) {
            if (currentAlarmId !== null) return;
            
            const currentTime = `${currentHour}:${currentMinute}`;
            if (currentTime === lastAlarmTime) return;

            const enabledAlarms = alarms.filter(alarm => {
                if (!alarm.enabled) return false;
                if (alarm.type === 'minute') {
                    return alarm.minute === currentMinute;
                } else {
                    return alarm.hour === currentHour && alarm.minute === currentMinute;
                }
            });

            if (enabledAlarms.length > 0) {
                const alarm = enabledAlarms[0];
                currentAlarmId = alarm.id;
                lastAlarmTime = currentTime;
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
            updateTime();
            setInterval(updateTime, 1000);
            renderEvents();
        }

        document.addEventListener('DOMContentLoaded', init);