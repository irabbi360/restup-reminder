const {app, BrowserWindow, ipcMain, Menu, Tray, screen, ipcRenderer, powerMonitor} = require('electron');
const {join} = require('path');
const moment = require('moment');
const dotenv = require('dotenv');
const AutoLaunch = require('auto-launch');
const Store = require('electron-store');
const {mainWindow, createMainWindow, menuWithTimerInfo} = require("./windows");

dotenv.config();

let tray;
let setting = {};
let countdownInterval;
let minInterval;

const store = new Store();

let rendererWindows = [];

// Initialize the auto-launch instance
const autoLaunch = new AutoLaunch({
    name: 'RestUpReminder',
});

app.whenReady().then(() => {
    autoLaunch.enable();
});

autoLaunch.isEnabled()
    .then(function (isEnabled) {
        if (isEnabled) {
            return;
        }
        autoLaunch.enable();
    })
    .catch(function (err) {
        // handle error
    });

if (process.platform === 'darwin') {
    // Hide the application from the Dock
    app.dock.hide();

    // Prevent the application from appearing in the Force Quit menu
    app.setActivationPolicy('prohibited');
}

app.on('ready', () => {

    if (process.platform === 'darwin') {
        app.dock.hide(); // Hide the dock icon
    }

    setting = store.get('setting');
    console.log(setting, 'on ready')
    if (setting) {
    } else {
        let setting = {
            notifyMe: 'popup',
            breakFrequency: 30,
            breakLength: 2,
            skipBreak: 'on',
            snoozeBreak: 'on',
            snoozeLength: 5,
            breakNotifyTitle: 'Time for break!',
            breakNotifyMessage: 'Rest your eyes. Stretch your legs. Breathe. Relax.'
        }
        store.set('setting', setting);
    }

    setting = store.get('setting');

    createMainWindow(rendererWindows);

    ipcMain.on('timer-start', async (event, message) => {
        await menuWithTimerInfo(setting, tray, restartApp)
    });

    ipcMain.on('interval-clear', (event, remainingTime) => {
        console.log('interval-clear', remainingTime)
        clearInterval(countdownInterval);
        clearInterval(minInterval);
    })
    // Create a system tray icon
    const iconPath = join(__dirname, './assets/icon/tryicon.png');
    tray = new Tray(iconPath);

    tray.setToolTip('RestUp Reminder');

    tray.on('click', () => {
        tray.popUpContextMenu();
    });
});

app.setAppUserModelId("RestUpReminder");

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow(rendererWindows);
    }
});

function restartApp() {
    app.relaunch(); // Relaunch the app
    app.quit(); // Quit the current instance
}