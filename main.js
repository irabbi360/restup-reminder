const { app, BrowserWindow,ipcMain, Menu, Tray, screen, ipcRenderer} = require('electron');
const path = require('node:path');
const moment = require('moment');
const dotenv = require('dotenv');
const AutoLaunch = require('auto-launch');

dotenv.config();

const env  = process.env

let mainWindow;
let popupWindow;
let modalWindow;
let settingWindow;
let lastMinsLeft = 0;
let tray;
let setting;
let countdownInterval;
let minInterval;
let contextMenu = null
let nextBreak = "";
//
let updateSetting = null;

const Store = require('electron-store');

const store = new Store();

let rendererWindows = [];

// Initialize the auto-launch instance
const autoLaunch = new AutoLaunch({
  name: 'BreakTimer',
});

app.whenReady().then(() => {
    autoLaunch.enable();
});

autoLaunch.isEnabled()
    .then(function(isEnabled){
      if(isEnabled){
        return;
      }
      autoLaunch.enable();
    })
    .catch(function(err){
      // handle error
    });

function createMainWindow(){
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, './assets/icon/icon.ico'),
    title: 'Break Timer',
    show: env.NODE_ENV === 'dev',
    // frame: env.NODE_ENV === 'dev',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  rendererWindows.push(mainWindow);

  // Open the DevTools in development mode
  // if (process.env.NODE_ENV === 'development') {
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
    createPopupWindow();
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

function createPopupWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds;
  const primaryDisplay = screen.getPrimaryDisplay();
  const taskbarHeight = primaryDisplay.size.height - primaryDisplay.workAreaSize.height;

  popupWindow = new BrowserWindow({
    width: primaryDisplay.workAreaSize.width,
    height: primaryDisplay.workAreaSize.height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y + taskbarHeight, // Adjust for the taskbar
    fullscreen: true,  // Enable full-screen mode
    fullscreenable: true,  // Allow exiting full-screen with F11 (optional)
    icon: path.join(__dirname, './assets/icon/icon.ico'),
    parent: mainWindow, // Set the main window as the parent
    modal: true, // Make the popup modal (blocks main window interaction)
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
  popupWindow.loadFile('src/views/popup.html');

  popupWindow.once('ready-to-show', () => {
    popupWindow.show(); // Show the popup window once it's ready
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
}

function createAboutModalWindow() {
  modalWindow = new BrowserWindow({
    parent: mainWindow, // Make the main window the parent of the modal
    modal: true,
    width: 400,
    height: 300,
    icon: path.join(__dirname, './assets/icon/icon.ico'),
    // frame: env.NODE_ENV === 'dev',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  modalWindow.loadFile('src/views/about-us.html'); // Create a separate HTML file for the modal content
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
}
function createSettingWindow() {
  settingWindow = new BrowserWindow({
    parent: mainWindow, // Make the main window the parent of the modal
    modal: true,
    width: 800,
    height: 600,
    icon: path.join(__dirname, './assets/icon/icon.ico'),
    // frame: env.NODE_ENV === 'dev',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingWindow.loadFile('src/views/settings-tab.html'); // Create a separate HTML file for the modal content
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
    // console.log(upSetting,'ghg')
    if (upSetting.breakFrequency !== setting.breakFrequency) {
      restartApp();
    }
  });
}

app.on('ready', () => {
  setting = store.get('setting');

  createMainWindow();
  // console.log(env.NODE_ENV, 'sss')
  ipcMain.on('timer-start', (event, message) => {
    // console.log('start')
    menuWithTimerInfo()
  });

  ipcMain.on('interval-clear', (event, remainingTime) => {
    console.log('interval-clear',remainingTime)
    clearInterval(countdownInterval);
    clearInterval(minInterval);
  })
  // Create a system tray icon
  const iconPath = path.join(__dirname, './assets/icon/icon.ico');
  tray = new Tray(iconPath);

  // menuWithTimerInfo()

  tray.setToolTip('Break Timer');

  tray.on('click', () => {
    tray.popUpContextMenu();
  });
});
app.setAppUserModelId("Timer");

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Listen for a request to open the modal
/*
ipcMain.on('open-modal', () => {
  createAboutModalWindow();
});
*/

function menuWithTimerInfo(){
// Update the countdown every 1 second
  let minutes, seconds = 0;
  const breakTime = setting.breakLength;
  const breakTimeMoment = moment(breakTime, 'HH:mm:ss');
  const inWorkingHours = setting.breakFrequency;

  minInterval = setInterval(function() {

    /*ipcMain.on('remaining-time', (event, remainingTime) => {
      minutes = remainingTime.minutes
      seconds = remainingTime.seconds
      ipcMain.removeAllListeners('remaining-time');
    });*/

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
      },
      {
        label: 'Pause Break',
        click: () => mainWindow.webContents.send('pause-break'),
      },
      {
        label: 'Reset Timer',
        click: () => mainWindow.webContents.send('reset-timer'),
      },
      {
        label: 'Settings',
        click: () => {
          createSettingWindow(); // Open the modal when the menu item is clicked
        },
      },
      {
        label: 'About',
        click: () => {
          createAboutModalWindow(); // Open the modal when the menu item is clicked
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        role: 'quit',
      },
    ]);

    if (minutes === 0 && seconds === 0) {
      clearInterval(minInterval);
    }

    tray.setContextMenu(contextMenu);
  }, 1000)
}

function restartApp() {
  app.relaunch(); // Relaunch the app
  app.quit(); // Quit the current instance
}