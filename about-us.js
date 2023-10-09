require('dotenv').config()
const { ipcRenderer } = require('electron');
let env = process.env

document.title = `${env.APP_NAME}`;
document.getElementById('app-name').textContent = `${env.APP_NAME}`;
document.getElementById('app-version').textContent = `${env.APP_VERSION}`;
document.getElementById('app-url').textContent = `${env.APP_WEB_URL}`;

const closeModalButton = document.getElementById('closeModalButton');
const closeBtn = document.getElementById('closeBtn');
closeModalButton.addEventListener('click', () => {
    // Send a message to the main process to close the modal
    ipcRenderer.send('close-modal');
});
closeBtn.addEventListener('click', () => {
    // Send a message to the main process to close the modal
    ipcRenderer.send('close-modal');
});
