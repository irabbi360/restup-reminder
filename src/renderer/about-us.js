const {ipcRenderer, shell } = require('electron');

document.addEventListener('DOMContentLoaded', () => {

    /*document.title = `${env.APP_NAME}`;
    document.getElementById('app-name').textContent = `${env.APP_NAME}`;
    document.getElementById('app-version').textContent = `${env.APP_VERSION}`;
    document.getElementById('app-url').textContent = `${env.APP_WEB_URL}`;
*/
    /*
    const closeBtn = document.getElementById('closeBtn');*/

    const websiteBtn = document.getElementById('devWebsite');

    websiteBtn.addEventListener('click', () => {
        shell.openExternal('https://github.com/irabbi360');
        setTimeout(() => {
            ipcRenderer.send('close-modal');
        }, 500)
    });

});