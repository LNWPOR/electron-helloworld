const { app, BrowserWindow, ipcMain } = require('electron');
const log = require('electron-log');

if (require('electron-squirrel-startup')) return;

// if (handleSquirrelEvent()) {
//   // squirrel event handled and app will exit in 1000ms, so don't do anything else
//   return;
// }

// function handleSquirrelEvent() {
//   if (process.argv.length === 1) {
//     return false;
//   }

//   const squirrelEvent = process.argv[1];
//   switch (squirrelEvent) {
//     case '--squirrel-install':
//     case '--squirrel-updated':
//     case '--squirrel-uninstall':
//       setTimeout(app.quit, 1000);
//       return true;

//     case '--squirrel-obsolete':
//       app.quit();
//       return true;
//   }
// }

if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
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

const { autoUpdater, dialog } = require('electron');
const squirrelUrl = 'http://127.0.0.1:8060';

// const startAutoUpdater = squirrelUrl => {
// The Squirrel application will watch the provided URL
autoUpdater.setFeedURL(`${squirrelUrl}`);

// Display a success message on successful update
autoUpdater.addListener(
  'update-downloaded',
  (event, releaseNotes, releaseName) => {
    sendStatusToWindow(`The release ${releaseName} has been downloaded`);
    dialog.showMessageBox({
      message: `The release ${releaseName} has been downloaded`
    });
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  }
);

// Display an error message on update error
autoUpdater.addListener('error', error => {
  sendStatusToWindow('Auto updater error: ' + error);
  dialog.showMessageBox({ message: 'Auto updater error: ' + error });
});

autoUpdater.addListener('download-progress', progressObj => {
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

// };

app.on('ready', function() {
  // Add this condition to avoid error when running your application locally
  // if (process.env.NODE_ENV !== "dev") {
  // sendStatusToWindow('text');
  autoUpdater.checkForUpdates();
  // startAutoUpdater(squirrelUrl);
  // };
});

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

ipcMain.on('test', () => {
  sendStatusToWindow('gggggggg');
});
