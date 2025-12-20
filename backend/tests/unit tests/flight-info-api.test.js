const assert = require('assert');

describe('flight-info-api (unit)', function() {
  it('should load the module', function() {
    const api = require('../../APIs/flight-info-api');
    assert.ok(api);
  });
});
