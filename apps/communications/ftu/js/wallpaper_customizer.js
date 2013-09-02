'use strict';

var wallpaperCustomizer = {
  init: function wc_init() {
    var self = this;
  // Add customization listener for setting wallpaper
    window.addEventListener('customization', function updateWallpaper(event) {
      if (event.detail.name === 'wallpaper') {
        self.setWallpaper(event.detail.value);
      }
    });
  },

  setWallpaper: function wc_setWallpaper(blob) {
    if (blob) {
      navigator.mozSettings.createLock().set({
        'wallpaper.image': blob
      });
    }
  }

};
wallpaperCustomizer.init();
