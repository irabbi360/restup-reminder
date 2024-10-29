const {BrowserWindow, ipcMain} = require("electron");
const {join} = require("path");
const dotenv = require("dotenv");
const Store = require('electron-store');

dotenv.config();
const env  = process.env
const store = new Store();
let setting = {};
let settingWindow

const createSettingWindow = ((restartApp, mainWindow, breakFrequency) => {
    settingWindow = new BrowserWindow({
        // parent: mainWindow, // Make the main window the parent of the modal
        // modal: true,
        width: 800,
        height: 600,
        icon: join(__dirname, '../../assets/icon/icon.ico'),
        // frame: env.NODE_ENV === 'dev',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    settingWindow.setResizable(false);

    settingWindow.loadFile(join(__dirname,'../../views/settings-tab.html'));
    if (env.NODE_ENV === 'dev') {
        settingWindow.webContents.openDevTools();
    }

    if (env.NODE_ENV !== 'dev') {
        settingWindow.setMenu(null);
    }

    settingWindow.on('closed', () => {
        let upSetting = store.get('setting');
        if (upSetting.breakFrequency !== breakFrequency) {
            restartApp();
        }
    });
    return settingWindow;
});

module.exports = { createSettingWindow, getSettingWindow: () => settingWindow };