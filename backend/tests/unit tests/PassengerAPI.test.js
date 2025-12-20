const assert = require('assert');

describe('PassengerAPI (unit)', function() {
  it('should load the module', function() {
    const api = require('../../APIs/PassengerAPI/PassengerAPI');
    assert.ok(api);
  });
});
