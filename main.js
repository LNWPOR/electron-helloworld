const { app, BrowserWindow } = require('electron');
const log = require('electron-log');

if (require('electron-squirrel-startup')) return;

if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
    case '--squirrel-uninstall':
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }
}

let win;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
}

app.on('ready', createWindow);

const electron = require('electron');
const squirrelUrl = 'http://127.0.0.1:8060';

const startAutoUpdater = squirrelUrl => {
  sendStatusToWindow('startAutoUpdater');

  // The Squirrel application will watch the provided URL
  electron.autoUpdater.setFeedURL(`${squirrelUrl}`);

  // Display a success message on successful update
  electron.autoUpdater.addListener(
    'update-downloaded',
    (event, releaseNotes, releaseName) => {
      sendStatusToWindow(`The release ${releaseName} has been downloaded`);
      electron.dialog.showMessageBox({
        message: `The release ${releaseName} has been downloaded`
      });
      electron.autoUpdater.quitAndInstall();
    }
  );

  // Display an error message on update error
  electron.autoUpdater.addListener('error', error => {
    sendStatusToWindow('Auto updater error: ' + error);
    electron.dialog.showMessageBox({ message: 'Auto updater error: ' + error });
  });

  electron.autoUpdater.addListener('download-progress', progressObj => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message =
      log_message +
      ' (' +
      progressObj.transferred +
      '/' +
      progressObj.total +
      ')';
    sendStatusToWindow(log_message);
  });

  // tell squirrel to check for updates
  electron.autoUpdater.checkForUpdates();
};

app.on('ready', function() {
  // Add this condition to avoid error when running your application locally

  // if (process.env.NODE_ENV !== "dev") {
  sendStatusToWindow('text');
  startAutoUpdater(squirrelUrl);
  // };
});

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
