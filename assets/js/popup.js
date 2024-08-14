// popup.js
const { ipcRenderer } = require('electron');
const closeButton = document.getElementById('closeButton');
const Store = require('electron-store');

const store = new Store();
let setting = store.get('setting');
let breakSessions = store.get('break_sessions');

closeButton.addEventListener('click', () => {
    stopTimer();
    window.close(); // Close the popup window when the close button is clicked
});

let timerInterval;
let secondsRemaining = setting.breakLength * 60;
let isTimerRunning = false;

function updateTimer() {
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;
    document.getElementById('timer').textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    clearInterval(timerInterval)
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (secondsRemaining === 0) {
                stopTimer()
            } else {
                secondsRemaining--;
            }
            updateTimer();
        }, 1000);
        handleBreakSessionMessage(breakSessions);
    }
}

function stopTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timerInterval);
        ipcRenderer.removeAllListeners('break-end');
        ipcRenderer.send('break-end', 'Your Break is End. Popup Closed.')
        console.log(breakSessions, 'break Sessions')
        // ipcRenderer.send('call-from-main', 'Hello from the renderer process');

        ipcRenderer.on('message-from-main', (event, message) => {
            console.log(message, 'message-from-main')
            // document.getElementById('response').textContent = 'Response from main process: ' + message;
        });
    }
    document.getElementById("closeButton").click();
}

function resetTimer() {
    stopTimer();
    secondsRemaining = 0;
    updateTimer();
}

const messages = [
    "Rest your eyes.<br>Stretch your legs.<br>Breathe. Relax.",
    "Tightly close your eyes",
    "Roll your eyes a few times to each side",
    "Rotate your eyes in a clockwise direction",
    "Rotate your eyes in a counterclockwise direction",
    "Blink your eyes",
    "Focus on a point in the far distance",
    "Have some water",
    "Walk for a while",
    "Lean back at your seat and relax",
    "Meditate for a minute."
];

function getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

function handleBreakSessionMessage(breakSessionNumber) {
    const message = getRandomMessage();

    // Display the message in the console
    console.log(`Break Session ${breakSessionNumber}: ${message}`);

    // Alternatively, display the message in the HTML
    const element = document.getElementById('breakMessage');

    // Clear previous messages if needed
    element.innerHTML = '';

    // Append the new message
    element.innerHTML = `${message}`;
}


startTimer();