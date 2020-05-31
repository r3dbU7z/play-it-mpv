var self = require('sdk/self'),
  tabs = require('sdk/tabs'),
  simplePrefs = require('sdk/simple-prefs'),
  importMain = require('./main.js'),
  strParams = require('./get_params.js').strParams;
// Panel requirements
var { ToggleButton } = require('sdk/ui/button/toggle'),
  panels = require('sdk/panel');
// Icon image
var iconPath = './img/icon_button.png',
  loadingPath = self.data.load('./img/loading.svg');
// The universal button for Open With mpv
var button = ToggleButton({
  id: 'open-mpv',
  label: 'MPV Get Formats',
  icon: iconPath,
  onChange: openPanel
});

function openPanel(state) {
  // Check button
  if (state.checked) {
    getFormats(tabs.activeTab.url);
    panel.show({
      position: button
    });
  }
}
// A gernic panel where all content is showed for Open With mpv
// Uses ./js/global.js to build the menus.
var panel = panels.Panel({
  contentURL: './panel/global.html',
  width: 250,
  height: 97,
  onHide: closePanel,
  contentScriptFile: self.data.url('./js/global.js'),
  contentScriptOptions: {
    loadingPath: loadingPath
  }
});
//
function closePanel() {
  // Close button
  button.state('window', {
    checked: false
  });
}
// Listen for click events
panel.port.on('format-selected', function(payload) {
  var url = payload[0],
    selArray = payload[1],
    arraySp = selArray.split(/\s+/);
  var format = arraySp[3];

  if (~arraySp.indexOf('Default')) {
    arraySp[0] = arraySp[3] = format = 'best'; // play with best quality a.k.a default
  }

  if (~url.indexOf('youtube.com') || ~url.indexOf('youtu.be')) { // URL is youtube link
    var str = arraySp[0];
    var re = /([0-9]*)x/; // remove lenght screen size >1920x<1080
    var screenSize = str.replace(re, '');

    if (~selArray.indexOf('audio')) { screenSize = 'bestaudio'; }
    strParams.youtube(screenSize);
    format = arraySp[3];

    if (~selArray.indexOf('video only')) { // add audio-track for youtube if sel. format without audio
      format = format.concat('+bestaudio');
    }
  }

  if (~url.indexOf('twitch.tv')) {
    strParams.twitch(format); // store tw quality set.
  }
  // Call playMedia() from main.js
  importMain.playMedia({url: url, format: format});
  panel.hide();
});

var showPanelNotification = function(message, flag) {
  flag = flag || false; // NOT loading by default
  panel.width = 250;
  panel.height = 120;
  panel.port.emit('status', message);
  panel.port.emit('loading', flag);
};
// Run youtube-dl instance and parsing formats table
var getFormats = function(url) {
  // Check youtube-dl path
  if (importMain.pathValidation.youtubedl()) {
    return;
  }
  var ytdlPath = simplePrefs.prefs.youtubedl.toString();
  const process = require('sdk/system/child_process');

  showPanelNotification('Trying to get media formats...', true);
  var youtubedl = null,
    fullData = '';

  var cUrl;
  if (~url.indexOf('youtube.com') || ~url.indexOf('youtu.be')) {
    cUrl = url.split('&')[0];
  } else {
    cUrl = url;
  }
  // Create child instance
  // Spawn a seperate child to validate in youtubedl
  youtubedl = process.spawn(ytdlPath, ['--list-formats', cUrl]);
  // As the format info comes in, grab the data
  youtubedl.stdout.on('data', function(data) {
    fullData = data;
  });
  // When format capture is finished, send emit
  youtubedl.on('exit', function() {
    // Show panel again if it was closed
    panel.show({
      position: button
    });
    if (!~fullData.search('format code')){ // find the beginning of the qual. table
      showPanelNotification('No Videos Found');
    } else {
      var fullDataArray = fullData.split('\n');
      var i;
      for (i = fullDataArray.length; i--;) {
        var arrayElement = fullDataArray[i];

        if (arrayElement[0] === 'format code') {
          var beginFormatArray = i;
        }
      }
      var formatArray = fullDataArray.slice(beginFormatArray, fullDataArray.length - 1);

      for (i = formatArray.length; i--;) {
        var re = /,/;
        var cStr = formatArray[i].replace(re, '');
        re = 'audio only';
        cStr = formatArray[i].replace(re, 'audio-only');
        var subString = cStr.split(/\s+/);
        //                    [screen-size, extension, [720p], format_code]
        subString.splice(0, 4, subString[2], '\t', subString[1], '\t', subString[3], '\t', subString[0], '\t');
        formatArray[i] = subString.join(' ');
      }
      formatArray[1] = 'Default'; // add 'Default' button on panel
      formatArray[0] = '[Resolution] | [Extension] | [Screen size] | [Format code] | [Note]';
      panel.width = 650;
      panel.height = (formatArray.length + 3) * 18; // resize panel for correct hight
      panel.port.emit('loading', false);
      panel.port.emit('status', 'Select Media Quality');
      panel.port.emit('quality', [url, formatArray]);
    }
  });
};
exports.getForm = function(url) {
  getFormats(url);
  panel.show({
    position: button
  });
};
exports.showMessage = function(message, flag) {
  panel.hide();
  showPanelNotification(message, flag);
  panel.show({
    position: button
  });
};