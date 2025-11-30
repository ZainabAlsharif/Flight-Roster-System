const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001; //port for flight info api

// Middleware
app.use(cors()); //allows frontend to communicate with the flight info api
app.use(express.json());

//connecting to roster db
const dbPath = path.join(__dirname, '../database/roster.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('ERROR: Could not find database at:', dbPath);
        console.error(err.message);
    } else {
        console.log(`Connected to database at: ${dbPath}`);
        db.run('PRAGMA foreign_keys = ON');
    }
});

// GET /api/flights
//search flights with optional filters (Date, Source, Destination)
//returns flight info joined with airport names and vehicle details
app.get('/api/flights', (req, res) => {
    const { date, source, dest } = req.query;

    // Base Query: Join Flight with Airport (twice) and VehicleType
    let sql = `
        SELECT 
            f.FlightNumber,
            f.FlightDateTime,
            f.DurationMinutes,
            f.DistanceKm,
            f.SharedFlightNumber,
            f.SharedCompanyName,
            f.ConnectingFlightNumber,
            
            -- Source Airport Details
            src.AirportName as SourceAirportName, 
            src.City as SourceCity, 
            src.Country as SourceCountry,
            
            -- Destination Airport Details
            dst.AirportName as DestAirportName, 
            dst.City as DestCity, 
            dst.Country as DestCountry,
            
            -- Vehicle Details
            vt.VehicleTypeCode,
            vt.SeatCount, 
            vt.StandardMenu
        FROM Flight f
        JOIN Airport src ON f.SourceAirportCode = src.AirportCode
        JOIN Airport dst ON f.DestinationAirportCode = dst.AirportCode
        JOIN VehicleType vt ON f.VehicleTypeCode = vt.VehicleTypeCode
        WHERE 1=1
    `;

    const params = [];

    // 1. Filter by Date (Partial match for 'YYYY-MM-DD')
    if (date) {
        sql += ` AND f.FlightDateTime LIKE ?`;
        params.push(`${date}%`);
    }

    // 2. Filter by Source Airport Code (e.g., 'IST')
    if (source) {
        sql += ` AND f.SourceAirportCode = ?`;
        params.push(source);
    }

    // 3. Filter by Destination Airport Code (e.g., 'LHR')
    if (dest) {
        sql += ` AND f.DestinationAirportCode = ?`;
        params.push(dest);
    }

    // Execute
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json({ count: rows.length, flights: rows });
    });
});

//GET /api/flights/:flightNumber
//get detailed info for a single flight (useful for the plane view)
app.get('/api/flights/:flightNumber', (req, res) => {
    const flightNumber = req.params.flightNumber;

    const sql = `
        SELECT 
            f.*,
            src.AirportName as SourceAirportName, src.City as SourceCity, src.Country as SourceCountry,
            dst.AirportName as DestAirportName, dst.City as DestCity, dst.Country as DestCountry,
            vt.SeatCount, vt.SeatingPlan, vt.StandardMenu
        FROM Flight f
        JOIN Airport src ON f.SourceAirportCode = src.AirportCode
        JOIN Airport dst ON f.DestinationAirportCode = dst.AirportCode
        JOIN VehicleType vt ON f.VehicleTypeCode = vt.VehicleTypeCode
        WHERE f.FlightNumber = ?
    `;

    db.get(sql, [flightNumber], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Flight not found" });
            return;
        }
        res.json(row);
    });
});

// GET /api/airports
//populate dropdown lists in the frontend
app.get('/api/airports', (req, res) => {
    const sql = `SELECT AirportCode, AirportName, City, Country FROM Airport ORDER BY City`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/vehicles
//helper to see available plane types
app.get('/api/vehicles', (req, res) => {
    const sql = `SELECT * FROM VehicleType`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Flight Information API running on http://localhost:${PORT}`);
    console.log(`Connected to database: roster.db`);
});