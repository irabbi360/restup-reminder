const { ipcRenderer } = require('electron');
// popup.js
const closeButton = document.getElementById('closeButton');
const settings = JSON.parse(localStorage.getItem('settings'));

closeButton.addEventListener('click', () => {
    stopTimer();
    window.close(); // Close the popup window when the close button is clicked
});

let timerInterval;
let secondsRemaining = 30//settings.breakLength * 60;
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
    }
}

function stopTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timerInterval);
        ipcRenderer.removeAllListeners('break-end');
        ipcRenderer.send('break-end', 'Your Break is End. Popup Closed.')
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

startTimer();