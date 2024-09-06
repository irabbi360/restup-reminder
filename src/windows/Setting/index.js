const {BrowserWindow, ipcMain} = require("electron");
const {join} = require("path");
const dotenv = require("dotenv");
const Store = require('electron-store');

dotenv.config();
const env  = process.env
const store = new Store();
let setting = {};

const createSettingWindow = ((restartApp, mainWindow) => {
    let settingWindow = new BrowserWindow({
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

    settingWindow.loadFile(join(__dirname,'../../views/settings-tab.html')); // Create a separate HTML file for the modal content
    if (env.NODE_ENV === 'dev') {
        settingWindow.webContents.openDevTools();
    }
    if (env.NODE_ENV !== 'dev') {
        settingWindow.setMenu(null);
    }
    // Listen for a close request from the modal
    ipcMain.on('close-modal', () => {
        settingWindow.close();
    });

    settingWindow.on('closed', () => {
        let upSetting = store.get('setting');
        if (upSetting.breakFrequency !== setting.breakFrequency) {
            restartApp();
        }
    });
});

module.exports = {createSettingWindow};