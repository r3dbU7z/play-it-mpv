
var simplePrefs = require('sdk/simple-prefs'),
  querystring = require('sdk/querystring'),
  setMenuPoints = require('./context_menu.js').setMenuPoints;

var ytdl = {
  Youtube: null,
  YtbStream: null,
  Twitch: null,
  default: null
};
// Store format settings
var strParams = {
  youtube(params) {
    setMenuPoints.youtube(params);
    return ytdl.Youtube = (params === 'best') ? 'best' : (params === 'bestaudio') ? 'bestaudio' : `bestvideo[height<=${params}]+bestaudio`;
  },
  youtubeStream(params) {
    setMenuPoints.youtubeStream(params);
    return ytdl.YtbStream = (params === 'best') ? 'best' : params;
  },
  twitch(params) {
    setMenuPoints.twitch(params);
    return ytdl.Twitch = (params === 'audio_only') ? 'bestaudio' : (params === 'best') ? 'best' : params;
  },
  default(params) {
    ytdl.default = (params === 'best') ? 'best' : `bestvideo[height<=${params}]+bestaudio`;
  }
};
exports.strParams = strParams;
// Set and store preferred quality params
function onPrefChange() {
  var defQuality;
  var raw = simplePrefs.prefs.preferredQuality;
  defQuality = raw.toString();
  strParams.youtube(defQuality);
  strParams.twitch(`${defQuality}p`);
  strParams.default(defQuality);
}
onPrefChange('preferredQuality');
simplePrefs.on('preferredQuality', onPrefChange);
// Subjoin additional player parameters
function splitParams(params) {

  if (simplePrefs.prefs.params) {
    params += ` ${simplePrefs.prefs.params}`;
  }
  return params.split(' ');
}
// Parsing the arguments, from url and qual. set.; and return them
exports.getParams = function({url, format}) {
  format = format || false;
  var params;
  if (format === false) {
    params = `--ytdl-format=${ytdl.default}`; // Use preferred q. for all sites
  } else {
    params = `--ytdl-format=${format}`;
  }
  var args = splitParams(params);
  // URL is Twitch link
  if (~url.indexOf('twitch.tv')) {
    // Use format arg. OR stored quality
    var twArg = (format) ? format : ytdl.Twitch;
    params = `--ytdl-format=${twArg}`;
    var re = '--pause';
    params += ` ${simplePrefs.prefs.params.replace(re, '')}`; // Remove 'pause'-parameter if exist
    args = params.split(' ');
  }
  // URL is youtube link
  if (~url.indexOf('youtube.com') || ~url.indexOf('youtu.be')) {
    // Get Youtube params
    // var skipManifest = '--ytdl-raw-options=youtube-skip-dash-manifest=' // just faster
    var ytArg = (format) ? format : ytdl.Youtube;
    // params = `--ytdl-format=${ytArg} ${skipManifest}`; // FIX [ytdl_hook] error
    params = `--ytdl-raw-options=format=${ytArg}`;
    args = splitParams(params);
    // Get time-code and set time to start
    var qs = querystring.parse(url.split('?')[1]);

    if (parseInt(qs['t']) > 0) {
      var str = qs.t.replace(/([h|m])/g, ':'); // for long video(&t=01h02m03s)
      args.push(`--start=${str.replace(/s/g, '')}`); // remove 's' - seconds
    }
    // Playlist section
    if (simplePrefs.prefs.ytStartPlAtIndex) {
      // Parses url params to an object returning object like:
      // {"v":"g04s2u30NfQ","index":"3","list":"PL58H4uS5fMRzmMC_SfMelnCoHgB8COa5r"}
      if (qs['list'] && !qs['index']) { // set playlist index
        qs['index'] = 1;
      }

      if (qs['list'] && qs['index']) { // we have the playlist and the video index
        // args could be: ["--video-unscaled=yes","--ytdl-raw-options=format=best"]
        // so checking for ytdl-raw-options
        var ytdlRawOptionsIndex = -1,
          i; // iterator
        for (i = args.length; i--;) {

          if (~args[i].indexOf('ytdl-raw-options')) {
            ytdlRawOptionsIndex = i;
            break;
          }
        }
        // Change ytdl-raw-options
        args[ytdlRawOptionsIndex] += `,yes-playlist=,playlist-start=${qs['index']}`;
      }
    }
  }
  return args;
};