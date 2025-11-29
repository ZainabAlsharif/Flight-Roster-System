// Pilot data model and database operations
class PilotModel {
    constructor(db) {
        this.db = db;
    }

    // Get all pilots
    getAllPilots() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, 
                       GROUP_CONCAT(l.LanguageName) as languages,
                       vt.VehicleTypeCode, vt.SeatCount, vt.SeatingPlan
                FROM Pilot p
                LEFT JOIN PilotLanguage pl ON p.PilotId = pl.PilotId
                LEFT JOIN Language l ON pl.LanguageCode = l.LanguageCode
                LEFT JOIN VehicleType vt ON p.VehicleTypeCode = vt.VehicleTypeCode
                GROUP BY p.PilotId
            `;
            
            this.db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get pilot by ID
    getPilotById(pilotId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, vt.VehicleTypeCode, vt.SeatCount, vt.SeatingPlan
                FROM Pilot p
                JOIN VehicleType vt ON p.VehicleTypeCode = vt.VehicleTypeCode
                WHERE p.PilotId = ?
            `;
            
            this.db.get(query, [pilotId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get pilot languages
    getPilotLanguages(pilotId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT l.LanguageCode, l.LanguageName
                FROM PilotLanguage pl
                JOIN Language l ON pl.LanguageCode = l.LanguageCode
                WHERE pl.PilotId = ?
            `;
            
            this.db.all(query, [pilotId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get pilots by vehicle type
    getPilotsByVehicleType(vehicleType) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, 
                       GROUP_CONCAT(l.LanguageName) as languages
                FROM Pilot p
                LEFT JOIN PilotLanguage pl ON p.PilotId = pl.PilotId
                LEFT JOIN Language l ON pl.LanguageCode = l.LanguageCode
                WHERE p.VehicleTypeCode = ?
                GROUP BY p.PilotId
            `;
            
            this.db.all(query, [vehicleType], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get available pilots for flight criteria
    getAvailablePilots(distance, vehicleType) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, 
                       GROUP_CONCAT(l.LanguageName) as languages
                FROM Pilot p
                LEFT JOIN PilotLanguage pl ON p.PilotId = pl.PilotId
                LEFT JOIN Language l ON pl.LanguageCode = l.LanguageCode
                WHERE p.VehicleTypeCode = ? AND p.AllowedRangeKm >= ?
                GROUP BY p.PilotId
            `;
            
            this.db.all(query, [vehicleType, parseInt(distance)], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = PilotModel;