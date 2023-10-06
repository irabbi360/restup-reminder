const { app, BrowserWindow,ipcMain, Menu, Tray } = require('electron');
const path = require('node:path');

let mainWindow;
let tray;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, './assets/icon/icon.ico'),
    title: 'Pomodoro Timer',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Listen for a message from the renderer process
  ipcMain.on('timer-start', (event, message) => {
    console.log('Message from renderer process:', message);
    // mainWindow.minimize();
    // Send a response back to the renderer process
    event.reply('message-from-main', 'Hello from the main process!');
  });
  // Listen for a message from the renderer process
  ipcMain.on('timer-stop', (event, message) => {
    mainWindow.restore();
    console.log('From renderer process:', message);
    // mainWindow.setAlwaysOnTop(true, 'floating', 1);
  });

  // Create a system tray icon
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
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
    { type: 'separator' },
    {
      label: 'Quit',
      role: 'quit',
    },
  ]);
  tray.setToolTip('Break Timer');
  tray.setContextMenu(contextMenu);

});
app.setAppUserModelId("Timer");