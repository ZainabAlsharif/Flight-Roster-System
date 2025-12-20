const assert = require('assert');
const FlightCrewAPI = require('../../APIs/FlightCrewAPI/flightCrewAPI');

describe('FlightCrewAPI (unit)', function() {
  it('should construct and have getRouter', function() {
    const api = new FlightCrewAPI({});
    assert.ok(api.getRouter);
    assert.strictEqual(typeof api.getRouter, 'function');
  });
});
