const {BrowserWindow, ipcMain, screen, Notification } = require("electron");
const { join} = require('path');
const Store = require('electron-store');
const dotenv = require("dotenv");
dotenv.config();
const env  = process.env

// Initialize the store
const store = new Store();

function createPopupWindow(rendererWindows, mainWindow) {
    const { width, height } = screen.getPrimaryDisplay().bounds;
    const primaryDisplay = screen.getPrimaryDisplay();
    const taskbarHeight = primaryDisplay.size.height - primaryDisplay.workAreaSize.height;

    let popupWindow = new BrowserWindow({
        width: primaryDisplay.workAreaSize.width,
        height: primaryDisplay.workAreaSize.height,
        x: primaryDisplay.bounds.x,
        y: primaryDisplay.bounds.y + taskbarHeight, // Adjust for the taskbar
        fullscreen: true,  // Enable full-screen mode
        fullscreenable: true,  // Allow exiting full-screen with F11 (optional)
        icon: join(__dirname, '../../assets/icon/icon.ico'),
        parent: mainWindow, // Set the main window as the parent
        modal: true, // Make the popup modal (blocks main window interaction)
        opacity: 0,
        show: false, // Initially, don't show the window
        frame: env.NODE_ENV === 'dev',
        transparent: env.NODE_ENV !== 'dev',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (env.NODE_ENV === 'dev') {
        popupWindow.webContents.openDevTools();
    }

    // Load the popup HTML file
    popupWindow.loadFile(join(__dirname,'../../views/popup.html'));

    popupWindow.once('ready-to-show', () => {
        let setting = store.get('setting');
        if (setting && setting.notifyMe === 'notify') {
            showToastNotification(setting.breakNotifyTitle, setting.breakNotifyMessage);
        } else {
            popupWindow.show(); // Show the popup window once it's ready
            fadeInPopupWindow(popupWindow);
        }
    });

    ipcMain.on('break-end', (event, message) => {
        event.sender.send('message-from-main', 'Reply from main process');
        console.log('Break End', message)
        rendererWindows.forEach((win) => {
            if (win !== event.sender) {
                win.webContents.send('broadcast-message', message);
            }
        });
        ipcMain.removeAllListeners('break-end');
    })

    popupWindow.on('closed', () => {
        popupWindow = null;
    });

    function getAllDisplays() {
        return screen.getAllDisplays();
    }

    function showToastNotification(title, body) {
        const notification = new Notification({
            title: title,
            body: body,
            icon: join(__dirname, '../../assets/icon/icon.png'), // Path to an icon
            silent: false,
        });

        notification.show();

        notification.on('click', () => {
            // Example action: focus the main window
            if (mainWindow) {
                mainWindow.focus();
            }
        });
    }

    // Function to increase the opacity gradually
    function fadeInPopupWindow(window, step = 0.05, interval = 16) {
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += step;
            if (opacity >= 1) {
                opacity = 1;
                clearInterval(fadeInterval); // Stop when opacity reaches 1
            }
            window.setOpacity(opacity);
        }, interval);
    }
}

module.exports = {createPopupWindow};