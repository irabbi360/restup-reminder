// popup.js
const closeButton = document.getElementById('closeButton');
const settings = JSON.parse(localStorage.getItem('settings'));

closeButton.addEventListener('click', () => {
    stopTimer();
    window.close(); // Close the popup window when the close button is clicked
});

let timerInterval;
let secondsRemaining = settings.breakLength * 60;
let isTimerRunning = false;

function updateTimer() {
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;
    document.getElementById('timer').textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
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
    }
    document.getElementById("closeButton").click();
}

function resetTimer() {
    stopTimer();
    secondsRemaining = 0;
    updateTimer();
}

startTimer();