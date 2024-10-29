const { ipcRenderer, contextBridge, shell } = require('electron');
const Store = require('electron-store');

const store = new Store();

let notifyMe = document.getElementById("notifyMe");
let breakFrequency = document.getElementById("breakFrequency");
let breakLength = document.getElementById("breakLength");
let skipBreak = document.getElementById("skipBreak");
let snoozeBreak = document.getElementById("snoozeBreak");
let snoozeLength = document.getElementById("snoozeLength");
let popupColor = document.getElementById("popupColor");

document.getElementById("settingSave").addEventListener("click", () => {

    let setting = {
        notifyMe: notifyMe.value,
        breakFrequency: breakFrequency.value,
        breakLength: breakLength.value,
        skipBreak: skipBreak.value,
        snoozeBreak: snoozeBreak.value,
        snoozeLength: snoozeLength.value,
        popupColor: popupColor.value,
    }

    store.set('setting', setting)
});
document.getElementById("uiSettingSave").addEventListener("click", () => {

    let setting = {
        notifyMe: notifyMe.value,
        breakFrequency: breakFrequency.value,
        breakLength: breakLength.value,
        skipBreak: skipBreak.value,
        snoozeBreak: snoozeBreak.value,
        snoozeLength: snoozeLength.value,
        popupColor: popupColor.value,
    }

    store.set('setting', setting)
});

store.onDidChange('setting', (newValue, oldValue) => {
    // Perform actions in response to the change, e.g., update the UI.
    ipcRenderer.send('update-setting', newValue);
});

const setting = store.get('setting');
if (setting && setting.breakFrequency) {
    breakFrequency.value = setting.breakFrequency
}
if (setting && setting.notifyMe) {
    notifyMe.value = setting.notifyMe
}
if (setting && setting.breakLength) {
    breakLength.value = setting.breakLength
}
if (setting && setting.skipBreak) {
    skipBreak.value = setting.skipBreak
}
if (setting && setting.snoozeBreak) {
    snoozeBreak.value = setting.snoozeBreak
}
if (setting && setting.snoozeLength) {
    snoozeLength.value = setting.snoozeLength
}
if (setting && setting.popupColor) {
    popupColor.value = setting.popupColor
}

// Listen for event counts from the main process
let sleepCount = store.get('sleepCount');
let resumeCount = store.get('resumeCount');
let lockCount = store.get('lockCount');
let unlockCount = store.get('unlockCount');

ipcRenderer.on('update-event-counts', (event, counts) => {
    // console.log(counts, 'ssss counts')
    // document.getElementById('suspend-count').innerText = sleepCount;
    // document.getElementById('resume-count').innerText = resumeCount;
    // document.getElementById('lock-count').innerText = lockCount;
    // document.getElementById('unlock-count').innerText = unlockCount;
});

const aboutUsBtn = document.getElementById('aboutUsBtn');

if (aboutUsBtn) {
    aboutUsBtn.addEventListener('click', () => {
        shell.openExternal('https://github.com/irabbi360');
    });
}