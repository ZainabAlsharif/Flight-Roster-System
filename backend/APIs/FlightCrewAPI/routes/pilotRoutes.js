const express = require('express');
const router = express.Router();

// We'll get the database connection from your main server
// For now, we'll assume db is passed or required differently

// GET all pilots with languages
router.get('/', (req, res) => {
    const db = req.app.get('db'); // Get db from app context
    
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
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    });
});

// GET pilot by ID
router.get('/:id', (req, res) => {
    const pilotId = req.params.id;
    const db = req.app.get('db');
    
    const pilotQuery = `
        SELECT p.*, vt.VehicleTypeCode, vt.SeatCount, vt.SeatingPlan
        FROM Pilot p
        JOIN VehicleType vt ON p.VehicleTypeCode = vt.VehicleTypeCode
        WHERE p.PilotId = ?
    `;
    
    const languagesQuery = `
        SELECT l.LanguageCode, l.LanguageName
        FROM PilotLanguage pl
        JOIN Language l ON pl.LanguageCode = l.LanguageCode
        WHERE pl.PilotId = ?
    `;
    
    db.get(pilotQuery, [pilotId], (err, pilot) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!pilot) {
            return res.status(404).json({ error: 'Pilot not found' });
        }
        
        db.all(languagesQuery, [pilotId], (err, languages) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({
                success: true,
                data: {
                    ...pilot,
                    languages: languages
                }
            });
        });
    });
});

// GET pilots by vehicle type
router.get('/vehicle/:vehicleType', (req, res) => {
    const vehicleType = req.params.vehicleType;
    const db = req.app.get('db');
    
    const query = `
        SELECT p.*, 
               GROUP_CONCAT(l.LanguageName) as languages
        FROM Pilot p
        LEFT JOIN PilotLanguage pl ON p.PilotId = pl.PilotId
        LEFT JOIN Language l ON pl.LanguageCode = l.LanguageCode
        WHERE p.VehicleTypeCode = ?
        GROUP BY p.PilotId
    `;
    
    db.all(query, [vehicleType], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    });
});

// GET available pilots for flight criteria
router.get('/available/search', (req, res) => {
    const { distance, vehicleType } = req.query;
    const db = req.app.get('db');
    
    if (!distance || !vehicleType) {
        return res.status(400).json({
            error: 'Missing required parameters: distance and vehicleType'
        });
    }
    
    const query = `
        SELECT p.*, 
               GROUP_CONCAT(l.LanguageName) as languages
        FROM Pilot p
        LEFT JOIN PilotLanguage pl ON p.PilotId = pl.PilotId
        LEFT JOIN Language l ON pl.LanguageCode = l.LanguageCode
        WHERE p.VehicleTypeCode = ? AND p.AllowedRangeKm >= ?
        GROUP BY p.PilotId
    `;
    
    db.all(query, [vehicleType, parseInt(distance)], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            criteria: {
                maxDistance: distance,
                vehicleType: vehicleType
            }
        });
    });
});

module.exports = router;