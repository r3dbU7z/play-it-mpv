![Node.js CI](https://github.com/r3dbU7z/play-it-mpv/workflows/Node.js%20CI/badge.svg)

# Natively play video streams in Firefox
```diff
-=This addon is written by me for learning javascript. Try don't laugh at the code, PLS=-
```
![play-it-mpv_menu](http://image.ibb.co/kwt6ec/play_it_mpv_context_menu_crop.png)
![play-it-mpv_get_formats_panel](http://image.ibb.co/nxdWec/play_it_mpv_get_format_panel_crop.png)

This is firefox browser extension that gives the user the ability to play video streams for [multiple](http://rg3.github.io/youtube-dl/supportedsites.html) websites using [youtube-dl](http://youtube-dl.org) and a native media player of choice (which supports youtube-dl of course). Here's is the list of all the [supported sites](http://rg3.github.io/youtube-dl/supportedsites.html). The default configuration uses [mpv](http://mpv.io/) media player.
   
## Installing

### Build
1. Download [play-it-mpv.xpi](https://github.com/r3dbU7z/play-it-mpv/releases) file.
2. Open the `play-it-mpv.xpi` file with Firefox. It is recommended to use Firefox Developer Edition(no digital signature error, **this add-on is NOT signed**)
3. Or use the load through `about: debugging` tab.

### Build it manually
1. Download the source.
2. Download the [Add-on SDK](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation).
3. Run `jpm xpi` inside the `project` directory.
4. Open the `play-it-mpv.xpi` file with Firefox.

### Requirements

* MPV Player - download page: [https://mpv.io/installation/](https://mpv.io/installation/) 

* Youtube-dl Downloader - download page: [https://rg3.github.io/youtube-dl/download.html](https://rg3.github.io/youtube-dl/download.html)

### WARNING

This add-on doesn't work in Firefox 57 (Quantum and newer), since the add-on uses the old SDK API not compatible with WebExtensions.

### Add-ons with FF57 support

1. [external-video](https://addons.mozilla.org/en-US/firefox/addon/external-video/) -- by @vayan [GitHub](https://github.com/vayan/external-video)
2. [ff2mpv](https://addons.mozilla.org/en-US/firefox/addon/ff2mpv/) -- by @woodruffw [GitHub](https://github.com/woodruffw/ff2mpv)
3. [yt2p](https://addons.mozilla.org/en-US/firefox/addon/yt2p/) -- by @sumzary [GitHub](https://github.com/Sumzary/yt2p)
4. And etc. (see also google.com)

### Inspired by
Original mpv-youtube-dl-binding repository by @antoniy: [GitHub](https://github.com/antoniy/mpv-youtube-dl-binding) 

See also [WIKI-fork](https://github.com/r3dbU7z/play-it-mpv/wiki)
