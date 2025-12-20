const assert = require('assert');
const CabinCrewAPI = require('../../APIs/CabinCrewAPI/cabinCrewAPI');

describe('CabinCrewAPI (unit)', function() {
  it('should construct and have getRouter', function() {
    const api = new CabinCrewAPI({});
    assert.ok(api.getRouter);
    assert.strictEqual(typeof api.getRouter, 'function');
  });
});
