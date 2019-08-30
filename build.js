var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release/package/electron-helloworld-win32-x64',
    outputDirectory: './release/installer',
    authors: 'Me',
    exe: 'electron-helloworld.exe',
    description: 'electron-helloworld'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
