/* exported SimManager */

'use strict';

var SimManager = (function() {

  var serviceSettingMap = {
    'data' : 'ril.data.defaultServiceId',
    'telephony' : 'ril.telephony.defaultServiceId',
    'message' : 'ril.sms.defaultServiceId'
  };

  var serviceIcc = {};

  Object.keys(serviceSettingMap).forEach(function _init(serviceId) {
    serviceIcc[serviceId] = {
      loaded : false,
      icc : null,
      iccId : null
    };
  });

  function _loadDataSIMIcc(onsuccess, onerror) {
    _loadServiceSIMIcc('data', onsuccess, onerror);
  }

  function _loadTelephonySIMIcc(onsuccess, onerror) {
    _loadServiceSIMIcc('telephony', onsuccess, onerror);
  }

  function _loadMessageSIMIcc(onsuccess, onerror) {
    _loadServiceSIMIcc('message', onsuccess, onerror);
  }

  function _loadAll(onsuccess, onerror) {
    // TODO think if it's necessary and efficient
  }

  function _loadServiceSIMIcc(serviceId, onsuccess, onerror) {
    var mobileConnections = navigator.mozMobileConnections,
        iccManager = window.navigator.mozIccManager,
        settings = window.navigator.mozSettings;
    var slotId = 0;
    var req = settings &&
              settings.createLock().get(serviceSettingMap[serviceId]);

    req.onsuccess = function _onsuccesSlotId() {
      slotId = req.result[serviceSettingMap[serviceId]] || 0;
      var mobileConnection = mobileConnections[slotId];
      var iccId = mobileConnection.iccId || null;
      if (!iccId) {
        console.error('The slot ' + slotId + ', configured as the ' +
                      serviceId + ' slot, is empty');
        if (onerror) {
          onerror();
        }
        return;
      }
      serviceIcc[serviceId].iccId = iccId;
      serviceIcc[serviceId].loaded = true;
      serviceIcc[serviceId].icc = iccManager.getIccById(iccId);

      if (onsuccess) {
        onsuccess(iccId);
      }
    };

    req.onerror = function _onerrorSlotId() {
      console.warn(serviceSettingMap[serviceId] + ' does not exists');
      var iccId = null;

      // Load the fist slot with iccId
      for (var i = 0; i < mobileConnections.length && !iccId; i++) {
        if (mobileConnections[i]) {
          iccId = mobileConnections[i].iccId;
        }
      }
      if (!iccId) {
        console.error('No SIM in the device');
        if (onerror) {
          onerror();
        }
        return;
      }

      serviceIcc[serviceId].iccId = iccId;
      serviceIcc[serviceId].loaded = true;
      serviceIcc[serviceId].icc = iccManager.getIccById(iccId);
      if (onsuccess) {
        onsuccess(iccId);
      }
    };
  }

  return {
    // data info
    dataSim : serviceIcc.data,
    loadDataSimIcc: _loadDataSIMIcc,
    // telephony info
    telephonySim: serviceIcc.telephony,
    loadTelephonySimIcc: _loadTelephonySIMIcc,
    // message info
    messageSim: serviceIcc.message,
    loadMessageSimIcc: _loadMessageSIMIcc,
    loadAll: _loadAll
  };
})();

