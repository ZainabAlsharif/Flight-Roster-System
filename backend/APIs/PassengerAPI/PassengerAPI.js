const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002; // port for passenger info API

// Middleware
app.use(cors()); // allows frontend to communicate with the passenger info API
app.use(express.json()); // for parsing JSON bodies

// Connecting to roster db (use the same database or a new one if needed)
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

// GET /api/passengers
// Get all passengers with optional filters (e.g., FlightNumber, name, ticketID)
app.get('/api/passengers', (req, res) => {
    const { flightNumber, name, ticketID } = req.query;

    let sql = `
        SELECT 
            p.PassengerID,
            p.TicketID,
            p.Name,
            p.Age,
            p.Gender,
            p.Nationality,
            p.SeatType,
            p.SeatNumber,
            p.FlightNumber,
            p.ParentPassengerID
        FROM Passenger p
        WHERE 1=1
    `;

    const params = [];

    // Filter by FlightNumber
    if (flightNumber) {
        sql += ` AND p.FlightNumber = ?`;
        params.push(flightNumber);
    }

    // Filter by TicketID (exact match)
    if (ticketID) {
        sql += ` AND p.TicketID = ?`;
        params.push(ticketID);
    }

    // Filter by Name (partial match)
    if (name) {
        sql += ` AND p.Name LIKE ?`;
        params.push(`%${name}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json({ count: rows.length, passengers: rows });
    });
});

// GET /api/passengers/:id
// Get a single passenger by their ID
app.get('/api/passengers/:id', (req, res) => {
    const passengerID = req.params.id;

    const sql = `
        SELECT 
            p.PassengerID,
            p.TicketID,
            p.Name,
            p.Age,
            p.Gender,
            p.Nationality,
            p.SeatType,
            p.SeatNumber,
            p.FlightNumber,
            p.ParentPassengerID
        FROM Passenger p
        WHERE p.PassengerID = ?
    `;

    db.get(sql, [passengerID], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Passenger not found" });
            return;
        }
        res.json(row);
    });
});

// GET /api/passengers/ticket/:ticketID
// Get a single passenger by their Ticket ID
app.get('/api/passengers/ticket/:ticketID', (req, res) => {
    const ticketID = req.params.ticketID;

    const sql = `
        SELECT 
            p.PassengerID,
            p.TicketID,
            p.Name,
            p.Age,
            p.Gender,
            p.Nationality,
            p.SeatType,
            p.SeatNumber,
            p.FlightNumber,
            p.ParentPassengerID
        FROM Passenger p
        WHERE p.TicketID = ?
    `;

    db.get(sql, [ticketID], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Passenger not found" });
            return;
        }
        res.json(row);
    });
});

// POST /api/passengers
// Add a new passenger
app.post('/api/passengers', (req, res) => {
    const { ticketID, name, age, gender, nationality, seatType, seatNumber, flightNumber, parentPassengerID } = req.body;

    const sql = `
        INSERT INTO Passenger (TicketID, Name, Age, Gender, Nationality, SeatType, SeatNumber, FlightNumber, ParentPassengerID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [ticketID, name, age, gender, nationality, seatType, seatNumber, flightNumber, parentPassengerID], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Passenger added', passengerID: this.lastID });
    });
});

// DELETE /api/passengers/:id
// Delete a passenger by ID
app.delete('/api/passengers/:id', (req, res) => {
    const passengerID = req.params.id;

    const sql = `DELETE FROM Passenger WHERE PassengerID = ?`;

    db.run(sql, [passengerID], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Passenger not found' });
            return;
        }
        res.json({ message: 'Passenger deleted' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Passenger Information API running on http://localhost:${PORT}/api/passengers`);
});
