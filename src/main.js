const {app, BrowserWindow, ipcMain, Menu, Tray, screen, ipcRenderer, powerMonitor} = require('electron');
const {join} = require('path');
const dotenv = require('dotenv');
const AutoLaunch = require('auto-launch');
const Store = require('electron-store');
const {mainWindow, createMainWindow, menuWithTimerInfo} = require("./windows");

dotenv.config();

let mainTray;
let setting = {};
let mainCountdownInterval;
let mainMinInterval;

const store = new Store();

let mainRendererWindows = [];

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

// Default settings object
const defaultSettings = {
    notifyMe: 'popup',
    breakFrequency: 30,
    breakLength: 2,
    skipBreak: 'on',
    snoozeBreak: 'on',
    snoozeLength: 5,
    breakNotifyTitle: 'Time for break!',
    breakNotifyMessage: 'Rest your eyes. Stretch your legs. Breathe. Relax.'
};

app.on('ready', () => {

    if (process.platform === 'darwin') {
        app.dock.hide(); // Hide the dock icon
    }

    setting = store.get('setting', {});

    // Merge existing settings with defaults (missing keys are filled with defaults)
    setting = Object.assign({}, defaultSettings, setting);

    // Store the merged settings back into the store
    store.set('setting', setting);

    console.log(setting, 'updated settings');

    console.log(setting, 'on ready')

    setting = store.get('setting');

    createMainWindow(mainRendererWindows);

    ipcMain.on('timer-start', async (event, message) => {
        await menuWithTimerInfo(setting, mainTray, restartApp)
    });

    ipcMain.on('interval-clear', (event, remainingTime) => {
        console.log('interval-clear', remainingTime)
        clearInterval(mainCountdownInterval);
        clearInterval(mainMinInterval);
    })
    // Create a system tray icon
    const iconPath = join(__dirname, './assets/icon/tryicon.png');
    mainTray = new Tray(iconPath);

    mainTray.setToolTip('RestUp Reminder');

    mainTray.on('click', () => {
        mainTray.popUpContextMenu();
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
        createMainWindow(mainRendererWindows);
    }
});

function restartApp() {
    app.relaunch(); // Relaunch the app
    app.quit(); // Quit the current instance
}