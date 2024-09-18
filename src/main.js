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
    app.dock.hide();
}

app.on('ready', () => {
    setting = store.get('setting');
    console.log(setting, 'on ready')
    if (setting) {
    } else {
        let setting = {
            notifyMe: 'Popup',
            breakFrequency: 30,
            breakLength: 2,
            skipBreak: 'on',
            snoozeBreak: 'on',
            snoozeLength: 5,
        }
        store.set('setting', setting)
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

    // Listen for system sleep event
    powerMonitor.on('suspend', () => {
        console.log('System is going to sleep');
        // Pause or stop any intensive work like network requests, timers, etc.
        if (mainWindow) {
            mainWindow.webContents.send('app-suspend'); // Notify renderer to pause activity
        }
    });

    // Listen for system resume (wake) event
    powerMonitor.on('resume', () => {
        console.log('System is waking up');
        // Resume any suspended work, such as timers or network requests
        if (mainWindow) {
            mainWindow.webContents.send('app-resume'); // Notify renderer to resume activity
        }
    });

    // Listen for screen lock event
    powerMonitor.on('lock-screen', () => {
        console.log('Screen is locked');
        // Pause or reduce resource-heavy tasks, save data, etc.
        if (mainWindow) {
            mainWindow.webContents.send('app-lock'); // Notify renderer to pause activity
        }
    });

    // Listen for screen unlock event
    powerMonitor.on('unlock-screen', () => {
        console.log('Screen is unlocked');
        // Resume tasks or reset timers
        if (mainWindow) {
            mainWindow.webContents.send('app-unlock'); // Notify renderer to resume activity
        }
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