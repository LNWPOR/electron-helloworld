let version = require('electron').remote.app.getVersion();

document.getElementById('version').innerText = version;

const { ipcRenderer } = require('electron');
ipcRenderer.on('message', function(event, text) {
  var container = document.getElementById('messages');
  var message = document.createElement('div');
  message.innerHTML = text;
  container.appendChild(message);
});

// (function() {
//   ipcRenderer.send('test');
//   ipcRenderer.send('test');
//   ipcRenderer.send('test');
//   ipcRenderer.send('test');
// })();
