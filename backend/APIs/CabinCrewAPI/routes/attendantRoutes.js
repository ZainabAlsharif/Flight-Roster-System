const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const AttendantController = require('../controllers/attendantController');
    const attendantController = new AttendantController(db);

    // GET all attendants with full details
    router.get('/', (req, res) => attendantController.getAllAttendants(req, res));

    // GET attendant by ID with all related data
    router.get('/:id', (req, res) => attendantController.getAttendantById(req, res));

    // GET attendants by type (chief, regular, chef)
    router.get('/type/:type', (req, res) => attendantController.getAttendantsByType(req, res));

    // GET attendants by vehicle type
    router.get('/vehicle/:vehicleType', (req, res) => attendantController.getAttendantsByVehicleType(req, res));

    // GET chefs by dish they can prepare
    router.get('/chefs/dish/:dishId', (req, res) => attendantController.getChefsByDish(req, res));

    // GET all dishes
    router.get('/dishes/all', (req, res) => attendantController.getAllDishes(req, res));

    // GET available attendants for flight criteria
    router.get('/available/search', (req, res) => attendantController.getAvailableAttendants(req, res));

    return router;
};
