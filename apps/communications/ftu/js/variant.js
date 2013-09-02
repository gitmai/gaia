'use strict';

var VariantManager = {
  init: function vm_init() {

    if (!IccHelper.enabled)
      return;
    // Check if the iccInfo is available
    this.mcc_mnc = this.getMccMnc();
    if (this.mcc_mnc) {
      this.iccHandler();
    } else {
      this.boundIccHandler = this.iccHandler.bind(this);
      IccHelper.addEventListener('iccinfochange', this.boundIccHandler);
    }
  },

  getVariantSettings: function settings_getVariantSettings(callback) {
    var self = this;
    this.readVariantFile(
      '/ftu/js/variants/' + self.mcc_mnc + '.json',
      function getVariantSettings(data) {
        if (data) {
          self._variantCustomization = data;
          if (callback)
            callback(self._variantCustomization);
        }
      }
    );
  },

  readVariantFile: function settings_readVariantFile(file, callback) {
    var URI = file;
    if (!callback)
      return;

    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', URI, false); // sync
    xhr.send();

    if (xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
    } else {
      console.error('Failed to fetch file: ' + file, xhr.statusText);
      callback();
    }
  },

  iccHandler: function vm_iccHandler() {
    this.mcc_mnc = this.getMccMnc();
    var self = this;
    if (this.mcc_mnc) {
      IccHelper.removeEventListener('iccinfochange', this.boundIccHandler);
      // Load the variant customizers, and the variant json file
      LazyLoader.load(['/ftu/js/wallpaper_customizer.js'],
        function() {
          self.getVariantSettings();
          if (self._variantCustomization) {
            self.dispatchCustomizationEvents(self._variantCustomization);
            return true;
          }
      });
    }
    return false;
  },

  //  For each variant setting dispatch a customization event
  dispatchCustomizationEvents: function vm_dispatchEvents(variantCustomization)
  {
    for (var setting in variantCustomization) {
      if (variantCustomization.hasOwnProperty(setting)) {
        // Create custom event
        var customizationEvent = new CustomEvent('customization', {
          detail: {
            name: setting,
            value: variantCustomization[setting]
          }
        });
            //dispatch the Event
        setTimeout(window.dispatchEvent, 0, customizationEvent);

      }
    }
  },

  getMccMnc: function getMccMnc() {
    var mcc = IccHelper.iccInfo.mcc;
    var mnc = IccHelper.iccInfo.mnc;
    if ((mcc !== undefined) && (mcc !== null) &&
        (mnc !== undefined) && (mnc !== null)) {
      return this.normalizeCode(mcc) + '-' + this.normalizeCode(mnc);
    }
  },

  // Given a number returns a three characters string padding with zeroes
  // to the left until the desired length (3) is reached
  normalizeCode: function normalizeCode(aCode) {
    var ncode = '' + aCode;
    while (ncode.length < 3) {
      ncode = '0' + ncode;
    }
    return ncode;
  }
};

VariantManager.init();
