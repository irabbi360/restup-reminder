const { ipcRenderer } = require('electron');
const Store = require('electron-store');

const store = new Store();

notifyMe = document.getElementById("notifyMe");
breakFrequency = document.getElementById("breakFrequency");
breakLength = document.getElementById("breakLength");
skipBreak = document.getElementById("skipBreak");
snoozeBreak = document.getElementById("snoozeBreak");
snoozeLength = document.getElementById("snoozeLength");

document.getElementById("settingSave").addEventListener("click", () => {

    let setting = {
        notifyMe: notifyMe.value,
        breakFrequency: breakFrequency.value,
        breakLength: breakLength.value,
        skipBreak: skipBreak.value,
        snoozeBreak: snoozeBreak.value,
        snoozeLength: snoozeLength.value,
    }

    store.set('setting', setting)
});

store.onDidChange('setting', (newValue, oldValue) => {
    console.log(`'setting' changed ${oldValue} to ${newValue}`);
    // Perform actions in response to the change, e.g., update the UI.
    ipcRenderer.send('update-setting', newValue);
});