const AttendantModel = require('../models/attendantModel');

class AttendantController {
    constructor(db) {
        this.attendantModel = new AttendantModel(db);
    }

    // Get all attendants with full details
    async getAllAttendants(req, res) {
        try {
            const attendants = await this.attendantModel.getAllAttendants();
            res.json({
                success: true,
                data: attendants,
                count: attendants.length
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get attendant by ID with all related data
    async getAttendantById(req, res) {
        try {
            const attendantId = req.params.id;
            const attendant = await this.attendantModel.getAttendantById(attendantId);
            
            if (!attendant) {
                return res.status(404).json({
                    error: 'Attendant not found'
                });
            }

            // Get all related data
            const [languages, vehicles, dishes] = await Promise.all([
                this.attendantModel.getAttendantLanguages(attendantId),
                this.attendantModel.getAttendantVehicles(attendantId),
                this.attendantModel.getAttendantDishes(attendantId)
            ]);

            res.json({
                success: true,
                data: {
                    ...attendant,
                    languages: languages,
                    vehicleTypes: vehicles,
                    dishes: dishes
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get attendants by type (chief, regular, chef)
    async getAttendantsByType(req, res) {
        try {
            const attendantType = req.params.type;
            const attendants = await this.attendantModel.getAttendantsByType(attendantType);
            
            res.json({
                success: true,
                data: attendants,
                count: attendants.length,
                attendantType: attendantType
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get attendants by vehicle type
    async getAttendantsByVehicleType(req, res) {
        try {
            const vehicleType = req.params.vehicleType;
            const attendants = await this.attendantModel.getAttendantsByVehicleType(vehicleType);
            
            res.json({
                success: true,
                data: attendants,
                count: attendants.length,
                vehicleType: vehicleType
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get chefs by dish
    async getChefsByDish(req, res) {
        try {
            const dishId = req.params.dishId;
            const chefs = await this.attendantModel.getChefsByDish(dishId);
            
            res.json({
                success: true,
                data: chefs,
                count: chefs.length,
                dishId: dishId
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get all dishes
    async getAllDishes(req, res) {
        try {
            // Since we don't have a Dish model yet, we'll query directly
            const db = req.app.get('db');
            const query = `SELECT * FROM Dish`;
            
            db.all(query, [], (err, dishes) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Database error',
                        details: err.message
                    });
                }
                
                res.json({
                    success: true,
                    data: dishes,
                    count: dishes.length
                });
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }

    // Get available attendants for flight criteria
    async getAvailableAttendants(req, res) {
        try {
            const { vehicleType, languages, attendantType } = req.query;
            
            let query = `
                SELECT a.*, 
                       GROUP_CONCAT(DISTINCT l.LanguageName) as languages,
                       GROUP_CONCAT(DISTINCT vt.VehicleTypeCode) as vehicleTypes
                FROM Attendant a
                LEFT JOIN AttendantLanguage al ON a.AttendantId = al.AttendantId
                LEFT JOIN Language l ON al.LanguageCode = l.LanguageCode
                LEFT JOIN AttendantVehicle av ON a.AttendantId = av.AttendantId
                LEFT JOIN VehicleType vt ON av.VehicleTypeCode = vt.VehicleTypeCode
                WHERE 1=1
            `;
            
            const params = [];
            
            if (vehicleType) {
                query += ` AND vt.VehicleTypeCode = ?`;
                params.push(vehicleType);
            }
            
            if (attendantType) {
                query += ` AND a.AttendantType = ?`;
                params.push(attendantType);
            }
            
            query += ` GROUP BY a.AttendantId`;
            
            const db = req.app.get('db');
            db.all(query, params, (err, attendants) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Database error',
                        details: err.message
                    });
                }
                
                // Filter by languages if specified
                let filteredAttendants = attendants;
                if (languages) {
                    const requiredLanguages = languages.split(',');
                    filteredAttendants = attendants.filter(attendant => {
                        const attendantLangs = attendant.languages ? attendant.languages.split(',') : [];
                        return requiredLanguages.every(lang => attendantLangs.includes(lang));
                    });
                }
                
                res.json({
                    success: true,
                    data: filteredAttendants,
                    count: filteredAttendants.length,
                    criteria: {
                        vehicleType: vehicleType,
                        languages: languages,
                        attendantType: attendantType
                    }
                });
            });
            
        } catch (error) {
            res.status(500).json({
                error: 'Database error',
                details: error.message
            });
        }
    }
}

module.exports = AttendantController;