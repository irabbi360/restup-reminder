const {BrowserWindow, ipcMain} = require("electron");
const {join} = require("path");
const dotenv = require("dotenv");

dotenv.config();
const env  = process.env

const createAboutModalWindow =  (mainWindow) => {
    let modalWindow = new BrowserWindow({
        parent: mainWindow, // Make the main window the parent of the modal
        modal: true,
        width: 400,
        height: 300,
        icon: join(__dirname, '../../assets/icon/icon.ico'),
        // frame: env.NODE_ENV === 'dev',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    modalWindow.loadFile(join(__dirname,'../../views/about-us.html')); // Create a separate HTML file for the modal content
    if (env.NODE_ENV === 'dev') {
        modalWindow.webContents.openDevTools();
    }
    if (env.NODE_ENV !== 'dev') {
        modalWindow.setMenu(null);
    }
    // Listen for a close request from the modal
    ipcMain.on('close-modal', () => {
        modalWindow.close();
    });

    modalWindow.on('closed', () => {
        modalWindow = null;
    });

    return modalWindow
}

module.exports = { createAboutModalWindow };