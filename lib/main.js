var simplePrefs = require('sdk/simple-prefs'),
  modClick = require('./modif_click.js').modClick;
// Show notification
var sendMessage = function (message, flag) {
  var showMessage = require('./get_formats.js').showMessage;
  showMessage(message, flag);
};
// Get filename from fullpath
var getFilename = function(filePath) {
  var fileExp = new RegExp(/[^\\/]+(?=\.[\w]+$)|[^\\/]+$/);
  var filename = fileExp.exec(filePath)[0];
  return filename;
};
var pathValidation = {
  // MPV name validation
  player() {
    var pref = simplePrefs.prefs.player;
    if (pref === undefined || getFilename(pref.toString()) !== 'mpv') {
      sendMessage('MPV not found, please check path in add-on settings.');
      return true;
    }
  },
  // Youtube-dl name validation
  youtubedl() {
    var pref = simplePrefs.prefs.youtubedl;
    if (pref === undefined || getFilename(pref.toString()) !== 'youtube-dl') {
      sendMessage('Youtube-dl not found, please check path in add-on settings.');
      return true;
    }
  }
};
exports.pathValidation = pathValidation;
// Watch path-events 
simplePrefs.on('player', pathValidation.player);
simplePrefs.on('youtubedl', pathValidation.youtubedl);
// Show wrong-path warning on start add-on
if (pathValidation.player() || pathValidation.youtubedl()) {
  sendMessage('Play-it-MPV paths misconfiguration, mission failure!');
}
// Mouse alt-click modificator
modClick();
// Start mpv instance
exports.playMedia = function({url, format}) {
  format = format || false;
  // Check mpv path
  if(pathValidation.player()) {
    return;
  }
  const process = require('sdk/system/child_process'),
    playerPath = simplePrefs.prefs.player.toString(),
    getParams = require('./get_params.js').getParams;
  // Get parameters for MPV
  var args = getParams({url: url, format: format});
  args.push(url);
  // Show start notification
  sendMessage('MPV is started. Trying to play media, wait for a response from the server.', true);
  // Run MPV
  var player = process.spawn(playerPath, args);
  // Try to panic!
  player.stdout.on('data', data => {
    var stdout = data;
    if (~stdout.toString().toLowerCase().indexOf('failed')) { // Catch "Failed to recognize file format."
      sendMessage(`Oops: ${stdout}`);
      player.stdout.off('data');
    }
  });
};