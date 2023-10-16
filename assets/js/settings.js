const Store = require('electron-store');

const store = new Store();

store.set('text', 'Hello world');
console.log(store.get('settings'), 'settings')
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
    // Cookies.set('test_xx', 'setting.notifyMe')
    // Cookies.set('name', 'value', { expires: 365, path: '/' })
    store.set('setting', setting)
    console.log(store.get('setting'), 'ssdfkguhsdjkfgh')
    localStorage.setItem('settings', JSON.stringify(setting))
});