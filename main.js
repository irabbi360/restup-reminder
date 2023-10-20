const { app, BrowserWindow,ipcMain, Menu, Tray, screen  } = require('electron');
const path = require('node:path');
const moment = require('moment');

let mainWindow;
let popupWindow;
let modalWindow;
let settingWindow;
let lastMinsLeft = 0;
let tray;
let setting;
let countdownInterval;
let minInterval;

const Store = require('electron-store');

const store = new Store();


let rendererWindows = [];

function createMainWindow(){
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, './assets/icon/icon.ico'),
    title: 'Pomodoro Timer',
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  rendererWindows.push(mainWindow);

  // Open the DevTools in development mode
  // if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
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
    // mainWindow.setAlwaysOnTop(true, 'floating', 1);
  });

  ipcMain.on('call-from-main', (event, arg) => {
    // console.log(arg, 'call-from-main'); // Do something with the data received
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
}

function createPopupWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // const display = screen.getPrimaryDisplay();
  // const { width, height } = display.bounds;
  popupWindow = new BrowserWindow({
    // width,
    // height,
    width: 800,
    height: 600,
    parent: mainWindow, // Set the main window as the parent
    modal: true, // Make the popup modal (blocks main window interaction)
    show: false, // Initially, don't show the window
    // frame: false,
    // transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  popupWindow.webContents.openDevTools();
  // Load the popup HTML file
  popupWindow.loadFile('popup.html');

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

function createModalWindow() {
  modalWindow = new BrowserWindow({
    parent: mainWindow, // Make the main window the parent of the modal
    modal: true,
    width: 400,
    height: 300,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  modalWindow.loadFile('about-us.html'); // Create a separate HTML file for the modal content

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
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingWindow.loadFile('settings-tab.html'); // Create a separate HTML file for the modal content
  settingWindow.webContents.openDevTools();
  // Listen for a close request from the modal
  ipcMain.on('close-modal', () => {
    settingWindow.close();
  });

  settingWindow.on('closed', () => {
    settingWindow = null;
  });
}

app.on('ready', () => {
  setting = store.get('setting');

  createMainWindow();

  ipcMain.on('interval-clear', (event, remainingTime) => {
    console.log('interval-clear',remainingTime)
    clearInterval(countdownInterval);
    clearInterval(minInterval);
  })
  // Create a system tray icon
  const iconPath = path.join(__dirname, './assets/icon/icon.ico');
  tray = new Tray(iconPath);

  // Set the countdown time to 30 minutes from now
  let countDownDate = new Date().getTime() + setting.breakFrequency * 60 * 1000;

  // Update the countdown every 1 second
  let minutes, seconds = 0;
  const breakTime = setting.breakLength;
  const breakTimeMoment = moment(breakTime, 'HH:mm:ss');
  const inWorkingHours = setting.breakFrequency;

  let nextBreak = "";

  countdownInterval = setInterval(function() {

    // Get the current time
    let now = new Date().getTime();

    // Find the distance between now and the countdown time
    let distance = countDownDate - now;

    // Time calculations for minutes and seconds
    minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result
    console.log(minutes + "m " + seconds + "s ");

    store.set('minutes', minutes);

    // If the countdown is finished, write some text and clear the interval
    if (distance < 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  let contextMenu = null
  minInterval = setInterval(function() {
    console.log('mmmm')
    let minsLeft = store.get('minutes');
    if (minsLeft !== undefined) {
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
          createModalWindow(); // Open the modal when the menu item is clicked
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        role: 'quit',
      },
    ]);

    if (seconds === 0) {
      clearInterval(minInterval);
    }

    tray.setContextMenu(contextMenu);
  }, 1000)

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
  createModalWindow();
});
*/

function menuWithTimerInfo(){

}