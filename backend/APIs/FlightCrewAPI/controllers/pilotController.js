const PilotModel = require('../models/pilotModel');

class PilotController {
    constructor(db) {
        this.pilotModel = new PilotModel(db);
    }

    // Get all pilots
    async getAllPilots(req, res) {
        try {
            const pilots = await this.pilotModel.getAllPilots();
            res.json({
                success: true,
                data: pilots,
                count: pilots.length
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get pilot by ID
    async getPilotById(req, res) {
        try {
            const pilotId = req.params.id;
            const pilot = await this.pilotModel.getPilotById(pilotId);
            
            if (!pilot) {
                return res.status(404).json({
                    error: 'Pilot not found'
                });
            }

            const languages = await this.pilotModel.getPilotLanguages(pilotId);
            
            res.json({
                success: true,
                data: {
                    ...pilot,
                    languages: languages
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get pilots by vehicle type
    async getPilotsByVehicleType(req, res) {
        try {
            const vehicleType = req.params.vehicleType;
            const pilots = await this.pilotModel.getPilotsByVehicleType(vehicleType);
            
            res.json({
                success: true,
                data: pilots,
                count: pilots.length
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get available pilots
    async getAvailablePilots(req, res) {
        try {
            const { distance, vehicleType } = req.query;
            
            if (!distance || !vehicleType) {
                return res.status(400).json({
                    error: 'Missing required parameters: distance and vehicleType'
                });
            }

            const pilots = await this.pilotModel.getAvailablePilots(distance, vehicleType);
            
            res.json({
                success: true,
                data: pilots,
                count: pilots.length,
                criteria: {
                    maxDistance: distance,
                    vehicleType: vehicleType
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }
}

module.exports = PilotController;