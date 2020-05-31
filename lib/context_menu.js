var data  = require('sdk/self').data,
  simplePrefs = require('sdk/simple-prefs'),
  cm = require('sdk/context-menu'),
  self = require('sdk/self'),
  importMain = require('./main.js'),
  getParams = require('./get_params.js'),
  getFormats = require('./get_formats.js');
// Cm.Presets
// Presets for Youtube
var yNames = ['Best quality', 'Audio', '144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'],
  ySets = ['best', 'bestaudio', '144', '240', '360', '480', '720', '1080', '1440', '2160'],
  yPresets = [yNames, ySets];
// Presets for Ytb-stream
var yStrNames = ['Best quality', '144p', '240p', '360p', '480p', '720p', '1080p'],
  yStrSets = ['best', '91', '92', '93', '94', '95', '96'],
  yStrPresets = [yStrNames, yStrSets];
// Presets for Twitch-stream
var twNames = ['Best quality', 'Audio', '160p', '360p', '480p', '720p', '720p 60fps', '900p', '900p 60fps', '1080p', '1080p 60fps'],
  twSets = ['best', 'audio_only', '160p', '360p', '480p', '720p', '720p60', '900p', '900p60', '1080p', '1080p60'],
  twPresets = [twNames, twSets];
// Icon image
var iconPath = './img/icon_button.png';
// Context-menu point
var getFormatsPoint = cm.Item({
  label: 'Get media format',
  image: self.data.url(iconPath),
  context: cm.SelectorContext('a[href], body'),
  contentScript: 'self.on("click", function(node, data) {' +
                 '  var url = node.href;' +
                 '  if (!node.href) {' +
                 '    url = window.location.href;' +
                 '  }' +
                 '  self.postMessage(url);' +
                 '});',
  onMessage: function(url) {
    getFormats.getForm(url); // Call getFormats()
  }
});
// Set icons in quality presets c-menu
var setIconPoint = function(nameMenu, ytdlFormat) {
  var i,
    set = false,
    items = nameMenu.items;

  for (i = items.length; i--;) {
    if (items[i].data === ytdlFormat) {
      items[i].image = self.data.url(iconPath);
      nameMenu.label = `Quality: [ ${items[i].label} ]`;
      set = true;
    } else {
      items[i].image = data.url('');
    }
  }
  if(!set) {
    ytdlFormat = `${ytdlFormat}p`;
    var customScreenSize = cm.Item({ label: ytdlFormat, data: ytdlFormat, image: self.data.url(iconPath) });
    nameMenu.addItem(cm.Separator());
    nameMenu.addItem(customScreenSize);
    nameMenu.label = `Quality: [ ${ytdlFormat} ]`;
  }
};
var setMenuPoints = {
  youtube(params) {
    setIconPoint(ctMenu.menuYoutube, params);
  },
  youtubeStream(params) { setIconPoint(ctMenu.menuYoutubeStream, params); },
  twitch(params) {
    setIconPoint(ctMenu.menuTwitch, params);
  }
};
exports.setMenuPoints = setMenuPoints;
// Add the list presets of quality
var setCmPresets = function(nameMenu, qPresets) {
  var  i;
  for (i = qPresets[0].length; i--;) {
    var qItem = cm.Item({ label: qPresets[0][i], data: qPresets[1][i] }); // Presets = [ItemName, preSet]
    nameMenu.addItem(qItem);
  }
};
// URL PredicateContext validation
var checkUrl = {
  youtube(data) {
    return (~data.linkURL.indexOf('youtube.com') || ~data.linkURL.indexOf('youtu.be'));
  },
  twitch(data) {
    return (~data.linkURL.indexOf('twitch.tv'));
  }
};
// ContentScript for context-menu
var contScript = 'self.on("click", function(node, data){self.postMessage([node.href, data]);})';
/* C-menu points:

  Play Item,
  Audio Item,
  Separator, --
  Get Formats item,
  Separator, --
  Youtube Menu, ->
  Youtube Stream Menu, ->
  Twitch Menu, ->
  Play text selection

*/
var ctMenu = {
  // Play media with default set.
  pointPlayMedia: cm.Item({
    label: 'Play video with MPV',
    contentScript: contScript,
    context: cm.SelectorContext('a[href]'),
    image: self.data.url(iconPath),
    onMessage(data) {
      importMain.playMedia({ url: data[0] });
    }
  }),
  // Play only audio
  pointPlayAudio: cm.Item({
    label: 'Play audio with MPV',
    contentScript: contScript,
    context: cm.SelectorContext('a[href]'),
    image: self.data.url(iconPath),
    onMessage(data) {
      importMain.playMedia({ url: data[0], format: 'bestaudio' });
    }
  }),
  separator0: cm.Separator(),
  // Get Formats Point in ctMenu array
  getFormatsItem: getFormatsPoint,
  separator1: cm.Separator(),
  // Set bitrate and watch youtube
  menuYoutube: cm.Menu({
    label: 'Set Youtube quality',
    image: self.data.url(iconPath),
    context: [cm.PredicateContext(checkUrl.youtube), cm.SelectorContext('a[href]')],
    contentScript: contScript,
    onMessage(data) {
      importMain.playMedia({ url: data[0], format: getParams.strParams.youtube(data[1]) });
    }
  }),
  // Set bitrate and watch youtube stream
  menuYoutubeStream: cm.Menu({
    label: 'Set Youtube stream quality',
    image: self.data.url(iconPath),
    context: [cm.PredicateContext(checkUrl.youtube), cm.SelectorContext('a[href]')],
    contentScript: contScript,
    onMessage(data) {
      importMain.playMedia({ url: data[0], format: getParams.strParams.youtubeStream(data[1]) });
    }
  }),
  // Set bitrate and watch twitch-stream
  menuTwitch: cm.Menu({
    label: 'Set Twitch stream quality',
    image: self.data.url(iconPath),
    context: [cm.PredicateContext(checkUrl.twitch), cm.SelectorContext('a[href]')],
    contentScript: contScript,
    onMessage(data) {
      importMain.playMedia({ url: data[0], format: getParams.strParams.twitch(data[1]) });
    }
  })
};
// Open selection text as URL and try play it.
var pointPlaySelection = cm.Item({
  label: 'Play selecton with MPV',
  context: cm.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
             '  var text = window.getSelection().toString();' +
             '  self.postMessage(text)' +
             '});',
  image: self.data.url(iconPath),
  onMessage(text) {
    importMain.playMedia({ url: text, format: false });
  }
});

function addPresets() {
  setCmPresets(ctMenu.menuYoutube, yPresets); // add youtube stream presets
  setCmPresets(ctMenu.menuYoutubeStream, yStrPresets);
  setCmPresets(ctMenu.menuTwitch, twPresets); // add twitch stream presets
}
addPresets();
// Add array-points from menu obj by order
var fillMenuArray = menu => {
  var menuArray = [];
  Object.keys(menu).forEach(menuItem => {
    menuArray.push(menu[menuItem]);
  });
  return menuArray;
};
//
function CreateMenuItems(nameMenu) {
  this.label = 'MPV menu',
  this.image = self.data.url(iconPath),
  this.context = cm.SelectorContext('a[href]'),
  this.items = fillMenuArray(nameMenu);
}
// Show and hide c-menu
function onPrefChange() {
  // Create context menu
  var mainMenu = new cm.Menu(new CreateMenuItems(ctMenu));
  var parentMenu = mainMenu.parentMenu;
  parentMenu.addItem(pointPlaySelection);

  if (!simplePrefs.prefs.showContextMenu) {
    parentMenu.removeItem(pointPlaySelection);
    parentMenu.removeItem(mainMenu); // Remove mainMenu point
  }
}
onPrefChange('showContextMenu');
simplePrefs.on('showContextMenu', onPrefChange);