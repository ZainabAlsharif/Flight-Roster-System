// Main Flight Crew API module
const express = require('express');
const pilotRoutes = require('./routes/pilotRoutes');

class FlightCrewAPI {
    constructor(db) {
        this.router = express.Router();
        this.db = db;
        this.setupRoutes();
    }

    setupRoutes() {
        // Mount pilot routes
        this.router.use('/pilots', pilotRoutes);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = FlightCrewAPI;