// Main Cabin Crew API module
const express = require('express');
const attendantRoutes = require('./routes/attendantRoutes');

class CabinCrewAPI {
    constructor(db) {
        this.router = express.Router();
        this.db = db;
        this.setupRoutes();
    }

    setupRoutes() {
        // Mount attendant routes
        this.router.use('/attendants', attendantRoutes(this.db));
    }

    getRouter() {
        return this.router;
    }
}

module.exports = CabinCrewAPI;