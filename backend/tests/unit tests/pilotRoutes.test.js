const assert = require('assert');
const pilotRoutes = require('../../APIs/FlightCrewAPI/routes/pilotRoutes');

describe('pilotRoutes (unit)', function() {
  it('should export a function', function() {
    assert.strictEqual(typeof pilotRoutes, 'function');
  });
});
