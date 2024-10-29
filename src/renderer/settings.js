const { ipcRenderer, contextBridge, shell } = require('electron');
const Store = require('electron-store');

const store = new Store();
const setting = store.get('setting');

const toast = new Toast({
    position: 'top-right', // options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
    duration: 3000 // Duration in milliseconds, 0 for permanent
})

let notifyMe = document.getElementById("notifyMe");
let breakFrequency = document.getElementById("breakFrequency");
let breakLength = document.getElementById("breakLength");
let skipBreak = document.getElementById("skipBreak");
let snoozeBreak = document.getElementById("snoozeBreak");
let snoozeLength = document.getElementById("snoozeLength");
let popupColor = document.getElementById("popupColor");
let breakNotifyTitle = document.getElementById("breakNotifyTitle");
let breakNotifyMessage = document.getElementById("breakNotifyMessage");

document.getElementById("settingSave").addEventListener("click", () => {
    store.set('setting', {
        ...setting,
        notifyMe: notifyMe.value,
        breakFrequency: breakFrequency.value,
        breakLength: breakLength.value,
        skipBreak: skipBreak.value,
        snoozeBreak: snoozeBreak.value,
        snoozeLength: snoozeLength.value,
    });

    toast.show({
        type: 'success',
        message: 'Setting successfully updated.'
    });
});
document.getElementById("uiSettingSave").addEventListener("click", () => {
    store.set('setting', {
        ...setting,
        popupColor: popupColor.value,
        breakNotifyTitle: breakNotifyTitle.value,
        breakNotifyMessage: breakNotifyMessage.value,
    });

    toast.show({
        type: 'success',
        message: 'Customization successfully updated.'
    });
});

store.onDidChange('setting', (newValue, oldValue) => {
    // Perform actions in response to the change, e.g., update the UI.
    ipcRenderer.send('update-setting', newValue);
});

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

// notify title message value assign
breakNotifyTitle.value = setting.breakNotifyTitle ?? ''
breakNotifyMessage.value = setting.breakNotifyMessage ?? ''