const assert = require('assert');
const sinon = require('sinon');
const AttendantController = require('../../APIs/CabinCrewAPI/controllers/attendantController');
const AttendantModel = require('../../APIs/CabinCrewAPI/models/attendantModel');

describe('AttendantController (unit)', function() {
  let dbMock, attendantModelStub, controller, req, res;

  beforeEach(function() {
    dbMock = {};
    attendantModelStub = sinon.createStubInstance(AttendantModel);
    controller = new AttendantController(dbMock);
    controller.attendantModel = attendantModelStub;
    req = { params: {}, query: {} };
    res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
  });

  it('getAllAttendants returns attendants array', async function() {
    const fakeAttendants = [{ AttendantId: 1, name: 'Jane' }];
    attendantModelStub.getAllAttendants.resolves(fakeAttendants);
    await controller.getAllAttendants(req, res);
    sinon.assert.calledWith(res.json, sinon.match({ success: true, data: fakeAttendants, count: 1 }));
  });

  it('getAttendantById returns attendant if found', async function() {
    req.params.id = 1;
    const fakeAttendant = { AttendantId: 1, name: 'Jane' };
    attendantModelStub.getAttendantById.resolves(fakeAttendant);
    attendantModelStub.getAttendantLanguages.resolves(['English']);
    attendantModelStub.getAttendantVehicles.resolves(['Car']);
    attendantModelStub.getAttendantDishes.resolves(['Pasta']);
    await controller.getAttendantById(req, res);
    sinon.assert.calledWith(res.json, sinon.match({ success: true, data: sinon.match.object }));
  });

  it('getAttendantById returns 404 if not found', async function() {
    req.params.id = 2;
    attendantModelStub.getAttendantById.resolves(null);
    await controller.getAttendantById(req, res);
    sinon.assert.calledWith(res.status, 404);
    sinon.assert.calledWith(res.json, sinon.match({ error: 'Attendant not found' }));
  });
});
