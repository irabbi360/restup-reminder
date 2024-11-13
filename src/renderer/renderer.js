const {ipcRenderer, ipcMain} = require('electron');
const Store = require('electron-store');

const store = new Store();

let setting = store.get('setting');
let renderInterval;

function initiateTimer() {
    ipcRenderer.send('timer-start', 'Your Timer Started! ' + timer.sessions);
    // sendNotification("Pomodoro Timer Started", "Let's go start the work.")
    startTimer();
}

const timer = {
    pomodoro: setting.breakFrequency,
    shortBreak: setting.breakLength,
    longBreakInterval: 4,
    sessions: 0,
};

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

function updateClock() {
    const {remainingTime} = timer;

    store.set('remainingTime', remainingTime)
    // ipcRenderer.send('remaining-time', remainingTime);
}

function startTimer() {
    clearInterval(renderInterval);

    if (store.get('setting.app_status') === 'disable') {
        console.log('Timer is disabled');
        return;
    }
    clearInterval(renderInterval);

    let {total} = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;

    store.set('break_sessions', timer.sessions)

    renderInterval = setInterval(function () {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();
        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(renderInterval);

            switch (timer.mode) {
                default:
                    switchMode('pomodoro');
            }

            if (Notification.permission === 'granted') {
                const text =
                    timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
                // new Notification(text);
                ipcStopNotify(timer.mode)
            }
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(renderInterval);
    ipcIntervalClear();
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    updateClock();
}

if ('Notification' in window) {
    if (
        Notification.permission !== 'granted' &&
        Notification.permission !== 'denied'
    ) {
        Notification.requestPermission().then(function (permission) {
            if (permission === 'granted') {
                new Notification(
                    'Awesome! You will be notified at the start of each session'
                );
            }
        });
    }
}

switchMode('pomodoro');
initPomodoroTimer();

function initPomodoroTimer() {
    ipcRenderer.send('timer-start', 'Your Timer Started!');
    // sendNotification("Pomodoro Timer Started", "Let's go start the work.")
    startTimer();
}

function sendNotification(title, body) {
    new window.Notification(title, {body: body})
}

function ipcStopNotify(mode) {
    ipcRenderer.send('timer-stop', 'Your Timer Ended! ' + mode + ' ' + timer.sessions);
}

ipcRenderer.on('broadcast-message', (event, message) => {
    console.log('Broadcast message:', message);
    clearInterval(renderInterval)

    initPomodoroTimer();
});

function ipcIntervalClear() {
    const {remainingTime} = timer;
    ipcRenderer.send('interval-clear', remainingTime);
}

ipcRenderer.on('start-break', (event, context) => {
    console.log('hello start-break')
    stopTimer();
    ipcStopNotify(timer.mode)
})

ipcRenderer.on('pause-break', (event, context) => {
    console.log('hello pause-break')
})

ipcRenderer.on('reset-timer', (event, context) => {
    stopTimer();
    switchMode('pomodoro');
    initPomodoroTimer();
    console.log('hello reset-timer')
})

ipcRenderer.on('app-status-changed', (event, newStatus) => {
    if (newStatus === 'disable') {
        stopTimer();
    } else {
        initPomodoroTimer();
    }

    console.log(`Timer ${newStatus}d`);
});

ipcRenderer.on('app-lock', () => {
    console.log('Screen locked. Pausing activity...');
    stopTimer();
});

ipcRenderer.on('app-unlock', () => {
    console.log('Screen unlocked. Resuming activity...');
    startTimer();
});

ipcRenderer.on('app-suspend', () => {
    console.log('App is suspended. Pausing activity...');
    // Pause any activity in the renderer
    stopTimer();
});

ipcRenderer.on('app-resume', () => {
    console.log('App is resuming. Resuming activity...');
    // Resume any paused activity in the renderer
    startTimer();
});

ipcRenderer.on('update-checking', () => {
    console.log('Checking for updates...');
    document.getElementById('status').innerText = 'Checking for updates...';
});

ipcRenderer.on('update-available', (event, info) => {
    console.log('Update available:', info);
    document.getElementById('status').innerText = 'Update available. Downloading...';
});

ipcRenderer.on('update-not-available', (event, info) => {
    console.log('Update not available:', info);
    document.getElementById('status').innerText = 'No updates available.';
});

ipcRenderer.on('update-error', (event, error) => {
    console.error('Update error:', error);
    document.getElementById('status').innerText = 'Update error: ' + error;
});

ipcRenderer.on('download-progress', (event, progressObj) => {
    let log_message = `Downloaded ${progressObj.percent}%`;
    console.log(log_message);
    document.getElementById('status').innerText = log_message;
});

ipcRenderer.on('update-downloaded', (event, info) => {
    console.log('Update downloaded:', info);
    document.getElementById('status').innerText = 'Update downloaded. Ready to install.';
});