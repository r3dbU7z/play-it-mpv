var utils = require('sdk/window/utils'),
  active = utils.getMostRecentBrowserWindow(),
  getForm = require('./get_formats.js').getForm,
  simplePrefs = require('sdk/simple-prefs'),
  importMain = require('./main.js');
/*
TODO:
  Fix "TypeError: can't access dead object"
*/
exports.modClick = function() {

  var clickListener = function(event) {
    if (event.altKey && (event.button == 0 || event.button == 2)) {
      var link = event.target;
      while (link && link.localName != 'a')
        link = link.parentNode;
      if (link) {
        if (event.altKey && event.button == 0) {
          importMain.playMedia({ url: link.href, format: false });
        } else if (event.altKey && event.button == 2) {
          getForm(link.href);
        }
      }
    }
  };
  function onPrefChange() {
    if (simplePrefs.prefs.altClick) {
      active.addEventListener('click', clickListener, false);

    } else {
      active.removeEventListener('click', clickListener, false);
    }
  }
  onPrefChange('altClick');
  simplePrefs.on('altClick', onPrefChange);
};