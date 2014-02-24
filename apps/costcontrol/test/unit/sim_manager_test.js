/* global MockAllNetworkInterfaces, MockNavigatorSettings, SimManager,
          MockNavigatorMozMobileConnections */

'use strict';

requireApp('costcontrol/test/unit/mock_all_network_interfaces.js');
requireApp('system/shared/test/unit/mocks/mock_navigator_moz_settings.js');
requireApp('system/shared/test/unit/mocks/mock_navigator_moz_icc_manager.js');
requireApp(
  'system/shared/test/unit/mocks/mock_navigator_moz_mobile_connections.js');
requireApp('costcontrol/js/sim_manager.js');

var realMozSettings,
    realMozMobileConnections,
    realMozIccManager;

if (!window.navigator.mozSettings) {
  window.navigator.mozSettings = null;
}

if (!window.navigator.mozMobileConnections) {
  window.navigator.mozMobileConnections = null;
}

if (!window.navigator.mozIccManager) {
  window.navigator.mozIccManager = null;
}

suite('Cost Control SimManager >', function() {

  suiteSetup(function() {
    realMozSettings = navigator.mozSettings;
    window.navigator.mozSettings = MockNavigatorSettings;

    realMozIccManager = navigator.mozIccManager;
    window.navigator.mozIccManager = window.MockNavigatorMozIccManager;

    realMozMobileConnections = navigator.mozMobileConnections;
    window.navigator.mozMobileConnections = MockNavigatorMozMobileConnections;
  });

  suiteTeardown(function() {
    window.navigator.mozSettings = realMozSettings;
    window.navigator.mozMobileConnections = realMozMobileConnections;
    window.navigator.mozIccManager = realMozIccManager;
  });
  setup(function() {
    SimManager.dataSim.loaded = false;
    SimManager.dataSim.iccId = null;
  });

  function createLockRequestFails() {
    return function() {
      return {
        set: null,
        get: function() {
          var request = {};
          setTimeout(function() {
            request.error = { name: 'error' };
            request.onerror && request.onerror();
          }, 0);
          return request;
        }
      };
    };
  }

  test('loadDataSimIcc() works ok without settings', function(done) {
    MockNavigatorMozMobileConnections[0] = {
      iccId: MockAllNetworkInterfaces[1].id
    };
    SimManager.loadDataSimIcc(
      function() {
        assert.isTrue(SimManager.dataSim.loaded);
        assert.equal(SimManager.dataSim.iccId,
                     MockAllNetworkInterfaces[1].id);
        done();
      }
    );
  });

  test('loadDataSimIcc() fails noICC', function(done) {
    MockNavigatorSettings.mSettings['ril.data.defaultServiceId'] = 0;
    MockNavigatorMozMobileConnections[0] = {
      iccId: null
    };
    SimManager.loadDataSimIcc(function() { },
      function _onError() {
        assert.isFalse(SimManager.dataSim.loaded);
        assert.isNull(SimManager.dataSim.iccId);
        done();
      }
    );
  });

  test('loadDataSimIcc() works correctly', function(done) {
    MockNavigatorSettings.mSettings['ril.data.defaultServiceId'] = 0;
    MockNavigatorMozMobileConnections[0] = {
      iccId: MockAllNetworkInterfaces[1].id
    };
    SimManager.loadDataSimIcc(
      function() {
        assert.isTrue(SimManager.dataSim.loaded);
        assert.equal(SimManager.dataSim.iccId,
                     MockAllNetworkInterfaces[1].id);
        done();
      }
    );
  });

  test('loadDataSimIcc() works ok when settings request fails', function(done) {
    sinon.stub(navigator.mozSettings, 'createLock', createLockRequestFails());
    MockNavigatorMozMobileConnections[0] = {
      iccId: MockAllNetworkInterfaces[1].id
    };
    SimManager.loadDataSimIcc(function _onSuccess() {
      assert.isTrue(SimManager.dataSim.loaded);
      assert.equal(SimManager.dataSim.iccId,
                   MockAllNetworkInterfaces[1].id);
      navigator.mozSettings.createLock.restore();
      done();
    });
  });

  test('loadDataSimIcc() all fails', function(done) {
    sinon.stub(navigator.mozSettings, 'createLock', createLockRequestFails());
    MockNavigatorMozMobileConnections[0] = {
      iccId: null
    };

    SimManager.loadDataSimIcc(function() { },
      function _onError() {
        assert.isFalse(SimManager.dataSim.loaded);
        navigator.mozSettings.createLock.restore();
        done();
      }
    );
  });
});


