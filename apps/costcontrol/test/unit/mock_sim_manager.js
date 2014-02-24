/* global MockAllNetworkInterfaces */
/* exported MockSimManager */
'use strict';

requireApp('costcontrol/test/unit/mock_all_network_interfaces.js');

var MockSimManager = function() {

  var fakeAllInterfaces = MockAllNetworkInterfaces;

  var defaultServiceInfo = {
    loaded : false,
    icc : null,
    iccId : null
  };

  return {
    dataSim : defaultServiceInfo,
    loadDataSimIcc: function(onsuccess, onerror) {
      var self = this;

      setTimeout(function() {
        self.dataSim.iccId = fakeAllInterfaces[1].id;
        if (typeof onsuccess === 'function') {
          onsuccess(self.dataSim.iccId);
        }
      }, 0);
    }
  };
};
