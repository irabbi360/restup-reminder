const {BrowserWindow, ipcMain, Menu} = require("electron");
const { join} = require('path');
const dotenv = require('dotenv');
const moment = require("moment/moment");
const {createSettingWindow} = require("../Setting");
const {createAboutModalWindow} = require("../About");
const {createPopupWindow} = require("../Popup");
const Store = require('electron-store');

dotenv.config();
const env  = process.env
let mainWindow
let contextMenu = null
let nextBreak = "";
let minInterval;

const store = new Store();

const createMainWindow = (rendererWindows) => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: join(__dirname, '../../assets/icon/icon.ico'),
        title: 'RestUp Reminder',
        show: false, // env.NODE_ENV === 'dev',
        // frame: env.NODE_ENV === 'dev',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(join(__dirname, '../../views/index.html'));

    rendererWindows.push(mainWindow);

    // Open the DevTools in development mode
    if (env.NODE_ENV === 'dev') {
        mainWindow.webContents.openDevTools();
    }
    if (env.NODE_ENV !== 'dev') {
        mainWindow.setMenu(null);
    }
    // }

    // Listen for a message from the renderer process
    /*ipcMain.on('timer-start', (event, message) => {
      console.log('Message from renderer process:', message);
      // mainWindow.minimize();
      // Send a response back to the renderer process
      event.reply('message-from-main', 'Hello from the main process!');
    });*/
    // Listen for a message from the renderer process
    ipcMain.on('timer-stop', (event, message) => {
        createPopupWindow(rendererWindows, mainWindow);
        // mainWindow.restore();
        console.log('From renderer process:', message);
        // event.reply('message-from-main', 'Hello from the main process!');
        if (env.NODE_ENV !== 'dev') {
            mainWindow.setAlwaysOnTop(true, 'floating', 1);
        }
    });

    ipcMain.on('call-from-main', (event, arg) => {
        // console.log(arg, 'call-from-main'); // Do something with the data received
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
}

const menuWithTimerInfo = (async (setting, tray, restartApp) => {
    // Update the countdown every 1 second
    let minutes, seconds = 0;
    const breakTime = setting.breakLength;
    const breakTimeMoment = moment(breakTime, 'HH:mm:ss');
    const inWorkingHours = setting.breakFrequency;

    minInterval = setInterval(async function () {
        const currentAppStatus = store.get('setting.app_status', 'enable');
        if (currentAppStatus === 'disable') {
            clearInterval(minInterval);
            nextBreak = 'RestUp Reminder is disabled';
        } else {
            let remainingTime = store.get('remainingTime')
            minutes = remainingTime.minutes
            seconds = remainingTime.seconds
            console.log(minutes, seconds, 'mm')

            if (minutes !== undefined) {
                if (minutes > 1) {
                    nextBreak = `Next break in ${minutes + "m " + seconds + "s "} minutes`;
                } else if (minutes === 1) {
                    nextBreak = `Next break in 1 minute`;
                } else if (seconds === 0) {
                    nextBreak = `It's break time!`;
                } else {
                    nextBreak = `Next break in less than a minute`;
                }
            }
        }

        contextMenu = Menu.buildFromTemplate([
            {
                label: nextBreak,
                visible: inWorkingHours,
                enabled: false,
            },
            {
                label: `Outside of working hours`,
                visible: !inWorkingHours,
                enabled: false,
            },
            {
                label: 'Start Break',
                click: () => mainWindow.webContents.send('start-break'),
                visible: currentAppStatus === 'enable',
            },
            {
                label: 'Pause Break',
                click: () => mainWindow.webContents.send('pause-break'),
                visible: currentAppStatus === 'enable',
            },
            {
                label: 'Reset Timer',
                click: () => mainWindow.webContents.send('reset-timer'),
                visible: currentAppStatus === 'enable',
            },
            {
                label: currentAppStatus === 'enable' ? 'Disable' : 'Enable',
                click: () => {
                    const newStatus = currentAppStatus === 'enable' ? 'disable' : 'enable';
                    store.set('setting.app_status', newStatus);
                    mainWindow.webContents.send('app-status-changed', newStatus);
                }
            },
            {
                label: 'Settings',
                click: () => {
                    createSettingWindow(restartApp, mainWindow); // Open the modal when the menu item is clicked
                    mainWindow.hide();
                },
            },
            {
                label: 'About',
                click: () => {
                    createAboutModalWindow(mainWindow); // Open the modal when the menu item is clicked
                    mainWindow.hide();
                },
            },
            {type: 'separator'},
            {
                label: 'Quit',
                role: 'quit',
            },
        ]);

        if (minutes === 0 && seconds === 0 || currentAppStatus === 'disable') {
            clearInterval(minInterval);
        }

        await tray.setContextMenu(contextMenu);
    }, 1000)
})

module.exports = {createMainWindow, mainWindow, menuWithTimerInfo};