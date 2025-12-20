//unit test for backend/main-system.js
const assert = require('assert');

describe('Main System (unit)', function() {
  it('should have a valid module', function() {
    const mainSystem = require('../../main-system');
    assert.ok(mainSystem);
  });
});
