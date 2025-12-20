const assert = require('assert');
const attendantRoutes = require('../../APIs/CabinCrewAPI/routes/attendantRoutes');

describe('attendantRoutes (unit)', function() {
  it('should export a function', function() {
    assert.strictEqual(typeof attendantRoutes, 'function');
  });
});
