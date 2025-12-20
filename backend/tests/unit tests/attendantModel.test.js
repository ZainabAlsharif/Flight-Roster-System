const assert = require('assert');
const sinon = require('sinon');
const AttendantModel = require('../../APIs/CabinCrewAPI/models/attendantModel');

describe('AttendantModel (unit)', function() {
  let dbMock, model;

  beforeEach(function() {
    dbMock = {
      all: sinon.stub(),
      get: sinon.stub()
    };
    model = new AttendantModel(dbMock);
  });

  it('getAllAttendants resolves with attendants array', async function() {
    const fakeRows = [{ AttendantId: 1, name: 'Jane' }];
    dbMock.all.yields(null, fakeRows);
    const result = await model.getAllAttendants();
    sinon.assert.match(result, fakeRows);
  });

  it('getAttendantById resolves with attendant object', async function() {
    const fakeRow = { AttendantId: 1, name: 'Jane' };
    dbMock.get.yields(null, fakeRow);
    const result = await model.getAttendantById(1);
    sinon.assert.match(result, fakeRow);
  });

  it('getAttendantLanguages resolves with languages array', async function() {
    const fakeRows = [{ LanguageCode: 'EN', LanguageName: 'English' }];
    dbMock.all.yields(null, fakeRows);
    const result = await model.getAttendantLanguages(1);
    sinon.assert.match(result, fakeRows);
  });
});
