const assert = require('assert');
const sinon = require('sinon');
const PilotModel = require('../../APIs/FlightCrewAPI/models/pilotModel');

describe('PilotModel (unit)', function() {
  let dbMock, model;

  beforeEach(function() {
    dbMock = {
      all: sinon.stub(),
      get: sinon.stub()
    };
    model = new PilotModel(dbMock);
  });

  it('getAllPilots resolves with pilots array', async function() {
    const fakeRows = [{ PilotId: 1, name: 'John' }];
    dbMock.all.yields(null, fakeRows);
    const result = await model.getAllPilots();
    sinon.assert.match(result, fakeRows);
  });

  it('getPilotById resolves with pilot object', async function() {
    const fakeRow = { PilotId: 1, name: 'John' };
    dbMock.get.yields(null, fakeRow);
    const result = await model.getPilotById(1);
    sinon.assert.match(result, fakeRow);
  });

  it('getPilotLanguages resolves with languages array', async function() {
    const fakeRows = [{ LanguageCode: 'EN', LanguageName: 'English' }];
    dbMock.all.yields(null, fakeRows);
    const result = await model.getPilotLanguages(1);
    sinon.assert.match(result, fakeRows);
  });
});
