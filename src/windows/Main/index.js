const {BrowserWindow, ipcMain, Menu, powerMonitor, dialog} = require("electron");
const { autoUpdater } = require('electron-updater');
const {join} = require('path');
const dotenv = require('dotenv');
const moment = require("moment/moment");
const {createSettingWindow, getSettingWindow} = require("../Setting");
const {createAboutModalWindow} = require("../About");
const {createPopupWindow} = require("../Popup");
const Store = require('electron-store');

dotenv.config();
const env = process.env
let mainWindow
let contextMenu = null
let nextBreak = "";
let minInterval;

// statistics count
let lockCount = 0;
let unlockCount = 0;
let suspendCount = 0;
let resumeCount = 0;

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

    // Listen for system sleep event
    powerMonitor.on('suspend', () => {
        suspendCount++;
        console.log('System is going to sleep');
        updateStatisticsCounts(suspendCount, resumeCount, lockCount, unlockCount);
        // Pause or stop any intensive work like network requests, timers, etc.
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('app-suspend'); // Notify renderer to pause activity
                const settingWindow = getSettingWindow();
                if (settingWindow && !settingWindow.isDestroyed()) {

                }
            }
        } catch (error) {
            console.error('Error sending event:', error)
        }
    });

    // Listen for system resume (wake) event
    powerMonitor.on('resume', () => {
        resumeCount++;
        console.log('System is waking up');
        updateStatisticsCounts(suspendCount, resumeCount, lockCount, unlockCount);
        // Resume any suspended work, such as timers or network requests
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('app-resume'); // Notify renderer to resume activity
                const settingWindow = getSettingWindow();
                if (settingWindow && !settingWindow.isDestroyed()) {

                }
            }
        } catch (error) {
            console.error('Error sending event:', error)
        }
    });

    // Listen for screen lock event
    powerMonitor.on('lock-screen', () => {
        lockCount++;
        console.log(lockCount, 'Screen is locked');

        updateStatisticsCounts(suspendCount, resumeCount, lockCount, unlockCount);

        // Pause or reduce resource-heavy tasks, save data, etc.
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('app-lock'); // Notify renderer to pause activity
                const settingWindow = getSettingWindow();
                if (settingWindow && !settingWindow.isDestroyed()) {

                }
            }
        } catch (error) {
            console.error('Error sending event:', error)
        }
    });

    // Listen for screen unlock event
    powerMonitor.on('unlock-screen', () => {
        unlockCount++;
        console.log(unlockCount, 'Screen is unlocked');
        updateStatisticsCounts(suspendCount, resumeCount, lockCount, unlockCount);
        // Resume tasks or reset timers
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('app-unlock'); // Notify renderer to resume activity
                const settingWindow = getSettingWindow();
                if (settingWindow && !settingWindow.isDestroyed()) {
                    // settingWindow.webContents.send('update-event-counts', {
                    //     suspendCount,
                    //     resumeCount,
                    //     lockCount,
                    //     unlockCount
                    // });
                }
            }
        } catch (error) {
            console.error('Error sending event:', error)
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });


    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for updates...');
        mainWindow.webContents.send('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info);
        mainWindow.webContents.send('update-available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
        console.log('No updates available:', info);
        mainWindow.webContents.send('update-not-available', info);
    });

    autoUpdater.on('error', (err) => {
        console.error('Update error:', err);
        mainWindow.webContents.send('update-error', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
        log_message += ` - Downloaded ${progressObj.percent}%`;
        log_message += ` (${progressObj.transferred}/${progressObj.total})`;
        console.log(log_message);
        mainWindow.webContents.send('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('Update downloaded:', info);
        mainWindow.webContents.send('update-downloaded', info);

        // Ask user to install the update
        dialog
            .showMessageBox({
                type: 'info',
                title: 'Update available',
                message: 'A new version is available. Do you want to install the update now?',
                buttons: ['Yes', 'Later'],
            })
            .then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
    });

    // Check for updates immediately after creating the window
    mainWindow.webContents.once('did-finish-load', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
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
                click: () => {
                    mainWindow.webContents.send('start-break')
                    clearInterval(minInterval);
                },
                visible: currentAppStatus === 'enable',
            },
            /*{
                label: 'Pause Break',
                click: () => mainWindow.webContents.send('pause-break'),
                visible: currentAppStatus === 'enable',
            },*/
            {
                label: 'Reset Timer',
                click: () => {
                    mainWindow.webContents.send('reset-timer')
                    clearInterval(minInterval);
                },
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
                    createSettingWindow(restartApp, mainWindow, inWorkingHours); // Open the modal when the menu item is clicked
                },
            },
            {
                label: 'About',
                click: () => {
                    createAboutModalWindow(mainWindow); // Open the modal when the menu item is clicked
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

function updateStatisticsCounts(suspendCount, resumeCount, lockCount, unlockCount) {
    try {
        store.set({
            sleepCount: suspendCount,
            resumeCount: resumeCount,
            lockCount: lockCount,
            unlockCount: unlockCount
        });
    } catch (error) {
        console.error('Error updating counts in store:', error);
    }
}

module.exports = {createMainWindow, mainWindow, menuWithTimerInfo};