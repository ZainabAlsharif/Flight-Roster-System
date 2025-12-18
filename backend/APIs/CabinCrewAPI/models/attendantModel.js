// Attendant data model and database operations
class AttendantModel {
    constructor(db) {
        this.db = db;
    }

    // Get all attendants with their languages and vehicle types
    getAllAttendants() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, 
                       GROUP_CONCAT(DISTINCT l.LanguageName) as languages,
                       GROUP_CONCAT(DISTINCT vt.VehicleTypeCode) as vehicleTypes,
                       GROUP_CONCAT(DISTINCT d.DishName) as dishes
                FROM Attendant a
                LEFT JOIN AttendantLanguage al ON a.AttendantId = al.AttendantId
                LEFT JOIN Language l ON al.LanguageCode = l.LanguageCode
                LEFT JOIN AttendantVehicle av ON a.AttendantId = av.AttendantId
                LEFT JOIN VehicleType vt ON av.VehicleTypeCode = vt.VehicleTypeCode
                LEFT JOIN ChefDish cd ON a.AttendantId = cd.AttendantId
                LEFT JOIN Dish d ON cd.DishId = d.DishId
                GROUP BY a.AttendantId
            `;
            
            this.db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendant by ID
    getAttendantById(attendantId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*
                FROM Attendant a
                WHERE a.AttendantId = ?
            `;
            
            this.db.get(query, [attendantId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get attendant languages
    getAttendantLanguages(attendantId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT l.LanguageCode, l.LanguageName
                FROM AttendantLanguage al
                JOIN Language l ON al.LanguageCode = l.LanguageCode
                WHERE al.AttendantId = ?
            `;
            
            this.db.all(query, [attendantId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendant vehicle types
    getAttendantVehicles(attendantId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT vt.VehicleTypeCode, vt.SeatCount, vt.SeatingPlan
                FROM AttendantVehicle av
                JOIN VehicleType vt ON av.VehicleTypeCode = vt.VehicleTypeCode
                WHERE av.AttendantId = ?
            `;
            
            this.db.all(query, [attendantId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendant dishes (for chefs)
    getAttendantDishes(attendantId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT d.DishId, d.DishName
                FROM ChefDish cd
                JOIN Dish d ON cd.DishId = d.DishId
                WHERE cd.AttendantId = ?
            `;
            
            this.db.all(query, [attendantId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendants by type (chief, regular, chef)
    getAttendantsByType(attendantType) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, 
                       GROUP_CONCAT(DISTINCT l.LanguageName) as languages
                FROM Attendant a
                LEFT JOIN AttendantLanguage al ON a.AttendantId = al.AttendantId
                LEFT JOIN Language l ON al.LanguageCode = l.LanguageCode
                WHERE a.AttendantType = ?
                GROUP BY a.AttendantId
            `;
            
            this.db.all(query, [attendantType], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendants by vehicle type
    getAttendantsByVehicleType(vehicleType) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, 
                       GROUP_CONCAT(DISTINCT l.LanguageName) as languages
                FROM Attendant a
                JOIN AttendantVehicle av ON a.AttendantId = av.AttendantId
                LEFT JOIN AttendantLanguage al ON a.AttendantId = al.AttendantId
                LEFT JOIN Language l ON al.LanguageCode = l.LanguageCode
                WHERE av.VehicleTypeCode = ?
                GROUP BY a.AttendantId
            `;
            
            this.db.all(query, [vehicleType], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get chefs by dish they can prepare
    getChefsByDish(dishId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, 
                       GROUP_CONCAT(DISTINCT l.LanguageName) as languages
                FROM Attendant a
                JOIN ChefDish cd ON a.AttendantId = cd.AttendantId
                LEFT JOIN AttendantLanguage al ON a.AttendantId = al.AttendantId
                LEFT JOIN Language l ON al.LanguageCode = l.LanguageCode
                WHERE cd.DishId = ? AND a.AttendantType = 'chef'
                GROUP BY a.AttendantId
            `;
            
            this.db.all(query, [dishId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = AttendantModel;