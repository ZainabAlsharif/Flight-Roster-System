const assert = require('assert');
const sinon = require('sinon');
const PilotController = require('../../APIs/FlightCrewAPI/controllers/pilotController');
const PilotModel = require('../../APIs/FlightCrewAPI/models/pilotModel');

describe('PilotController (unit)', function() {
  let dbMock, pilotModelStub, controller, req, res;

  beforeEach(function() {
    dbMock = {};
    pilotModelStub = sinon.createStubInstance(PilotModel);
    controller = new PilotController(dbMock);
    controller.pilotModel = pilotModelStub;
    req = { params: {}, query: {} };
    res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
  });

  it('getAllPilots returns pilots array', async function() {
    const fakePilots = [{ PilotId: 1, name: 'John' }];
    pilotModelStub.getAllPilots.resolves(fakePilots);
    await controller.getAllPilots(req, res);
    sinon.assert.calledWith(res.json, sinon.match({ success: true, data: fakePilots, count: 1 }));
  });

  it('getPilotById returns pilot if found', async function() {
    req.params.id = 1;
    const fakePilot = { PilotId: 1, name: 'John' };
    pilotModelStub.getPilotById.resolves(fakePilot);
    pilotModelStub.getPilotLanguages.resolves(['English']);
    await controller.getPilotById(req, res);
    sinon.assert.calledWith(res.json, sinon.match({ success: true, data: sinon.match.object }));
  });

  it('getPilotById returns 404 if not found', async function() {
    req.params.id = 2;
    pilotModelStub.getPilotById.resolves(null);
    await controller.getPilotById(req, res);
    sinon.assert.calledWith(res.status, 404);
    sinon.assert.calledWith(res.json, sinon.match({ error: 'Pilot not found' }));
  });
});
