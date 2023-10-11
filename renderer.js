const { ipcRenderer, ipcMain } = require('electron');
const buttonSound = new Audio('assets/sound/button-sound.mp3');
const mainButton = document.getElementById('js-btn');

mainButton.addEventListener('click', () => {
  const { action } = mainButton.dataset;
  // buttonSound.play();
  if (action === 'start') {
    ipcRenderer.send('timer-start', 'Your Timer Started! '+ timer.sessions);
    sendNotification("Pomodoro Timer Started", "Let's go start the work.")
    startTimer();
  } else {
    stopTimer();
  }
});

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

const settings = JSON.parse(localStorage.getItem('settings'));

const timer = {
  pomodoro: 1, //parseInt(settings.breakFrequency),
  shortBreak: parseInt(settings.breakLength),
  longBreakInterval: 4,
  sessions: 0,
};

let interval;

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
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, '0');
  const seconds = `${remainingTime.seconds}`.padStart(2, '0');

  const min = document.getElementById('js-minutes');
  const sec = document.getElementById('js-seconds');
  const time = `${minutes}:${seconds}`;
  min.textContent = minutes;
  sec.textContent = seconds;

  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
  document.title = `${time} — ${text}`;

  const progress = document.getElementById('js-progress');
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function startTimer() {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === 'pomodoro') timer.sessions++;

  mainButton.dataset.action = 'stop';
  mainButton.textContent = 'stop';
  mainButton.classList.add('active');

  interval = setInterval(function() {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();
    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      switch (timer.mode) {
        case 'pomodoro':
            switchMode('shortBreak');
          break;
        default:
          switchMode('pomodoro');
      }

      if (Notification.permission === 'granted') {
        const text =
            timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
        new Notification(text);
        ipcStopNotify(timer.mode)
      }

      // document.querySelector(`[data-sound="${timer.mode}"]`).play();
      console.log(timer.shortBreak)
      if (timer.mode === 'shortBreak' && timer.sessions === 1) {
          timer.mode = 'pomodoro'
        startTimer();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action = 'start';
  mainButton.textContent = 'start';
  mainButton.classList.remove('active');
}

function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  document
      .querySelectorAll('button[data-mode]')
      .forEach(e => e.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  document.body.style.backgroundColor = `var(--${mode})`;
  document
      .getElementById('js-progress')
      .setAttribute('max', timer.remainingTime.total);

  updateClock();
}

function handleMode(event) {
  const { mode } = event.target.dataset;

  if (!mode) return;

  timer.sessions = 0;
  switchMode(mode);
  stopTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  if ('Notification' in window) {
    if (
        Notification.permission !== 'granted' &&
        Notification.permission !== 'denied'
    ) {
      Notification.requestPermission().then(function(permission) {
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
});

function initPomodoroTimer(){
  const { action } = mainButton.dataset;
    ipcRenderer.send('timer-start', 'Your Timer Started!');
    sendNotification("Pomodoro Timer Started", "Let's go start the work.")
    startTimer();
}

  function sendNotification(title, body) {
    new window.Notification(title, { body: body })
}

// Send a message to the main process when the button is clicked
/*document.getElementById('send-button').addEventListener('click', () => {
  ipcRenderer.send('message-from-renderer', 'Hello from the renderer process!');
});*/

function ipcStopNotify(mode) {
  ipcRenderer.send('timer-stop', 'Your Timer Ended! ' + mode +' '+ timer.sessions);
}

ipcRenderer.on('break-ending', (event, message) => {
  // initPomodoroTimer();
});

//init call

// Listen for a response from the main process
ipcRenderer.on('message-from-main', (event, message) => {
  // alert(message)
  // initPomodoroTimer();
  // document.getElementById('response').textContent = 'Response from main process: ' + message;
});

function restartPomodoroTimer(){

}
