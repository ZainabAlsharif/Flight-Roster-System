const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const session = require("express-session");
const app = express();
const saltRounds = 10;
const PORT = 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "cmpe331-flytech-secret",   
  resave: false,
  saveUninitialized: false,
}));
// static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Database connection
const dbPath = path.join(__dirname, 'database', 'roster.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database at', dbPath);
    }
});

app.locals.db = db;

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}
// Helper: builds the complete roster payload for a flight 
// (flight + passengers + crew) so multiple routes can reuse it
async function buildRosterResponse(flightNumber) {
  // 1) Load flight + airports + vehicle
  const flight = await dbGet(
    `
    SELECT
      f.FlightNumber,
      f.FlightDateTime,
      f.DurationMinutes,
      f.DistanceKm,
      f.SourceAirportCode,
      sa.AirportName AS SourceAirportName,
      sa.City AS SourceCity,
      sa.Country AS SourceCountry,
      f.DestinationAirportCode,
      da.AirportName AS DestinationAirportName,
      da.City AS DestinationCity,
      da.Country AS DestinationCountry,
      f.VehicleTypeCode,
      vt.SeatCount,
      vt.SeatingPlan,
      vt.StandardMenu,
      f.SharedFlightNumber,
      f.SharedCompanyName,
      f.ConnectingFlightNumber
    FROM Flight f
    JOIN Airport sa ON sa.AirportCode = f.SourceAirportCode
    JOIN Airport da ON da.AirportCode = f.DestinationAirportCode
    JOIN VehicleType vt ON vt.VehicleTypeCode = f.VehicleTypeCode
    WHERE f.FlightNumber = ?
    `,
    [flightNumber]
  );

  if (!flight) return null;

  // 2) Load passengers
  const passengers = await dbAll(
    `
    SELECT
      p.PassengerId,
      p.Name,
      p.Age,
      p.Gender,
      p.Nationality,
      p.SeatType,
      p.SeatNumber,
      p.ParentPassengerId,
      parent.Name AS ParentName
    FROM Passenger p
    LEFT JOIN Passenger parent ON parent.PassengerId = p.ParentPassengerId
    WHERE p.FlightNumber = ?
    ORDER BY
      CASE WHEN p.SeatType = 'Business' THEN 0 ELSE 1 END,
      p.SeatNumber
    `,
    [flightNumber]
  );

  // 2b) Add children per passenger
  for (let p of passengers) {
    p.children = await dbAll(
      `
      SELECT PassengerId, Name
      FROM Passenger
      WHERE ParentPassengerId = ? AND FlightNumber = ?
      `,
      [p.PassengerId, flightNumber]
    );
  }

  // 3) Load roster row
  const rosterRow = await dbGet(
    `
    SELECT RosterId, GeneratedAt, RosterJson
    FROM Roster
    WHERE FlightNumber = ?
    ORDER BY RosterId DESC
    LIMIT 1
    `,
    [flightNumber]
  );

  let roster = null;
  let pilotIds = [];
  let attendantIds = [];

  if (rosterRow) {
    roster = {
      rosterId: rosterRow.RosterId,
      generatedAt: rosterRow.GeneratedAt
    };

    let parsed = {};
    try {
    parsed = JSON.parse(rosterRow.RosterJson || "{}");
    } catch (e) {
    parsed = {};
    }
    pilotIds = parsed.pilots || [];
    attendantIds = parsed.attendants || [];
  }

  // 4) Load pilots
  let pilots = [];
  if (pilotIds.length) {
    const placeholders = pilotIds.map(() => "?").join(",");
    pilots = await dbAll(
      `SELECT PilotId, Name, Age, Gender, Nationality, VehicleTypeCode, AllowedRangeKm, SeniorityLevel
      FROM Pilot
      WHERE PilotId IN (${placeholders})`,
      pilotIds
    );

    // Attach spoken languages per pilot
    for (const pilot of pilots) {
      const langs = await dbAll(
        `SELECT l.LanguageCode AS code, l.LanguageName AS name
         FROM PilotLanguage pl
         JOIN Language l ON l.LanguageCode = pl.LanguageCode
         WHERE pl.PilotId = ?`,
        [pilot.PilotId]
      );
      pilot.languages = langs;
    }
  }

  // 5) Load attendants
  let attendants = [];
  if (attendantIds.length) {
    const placeholders = attendantIds.map(() => "?").join(",");
    attendants = await dbAll(
      `SELECT AttendantId, Name, Age, Gender, Nationality, AttendantType
      FROM Attendant
      WHERE AttendantId IN (${placeholders})`,
      attendantIds
    );

    // Attach spoken languages and dishes per attendant
    for (const attendant of attendants) {
      const langs = await dbAll(
        `SELECT l.LanguageCode AS code, l.LanguageName AS name
         FROM AttendantLanguage al
         JOIN Language l ON l.LanguageCode = al.LanguageCode
         WHERE al.AttendantId = ?`,
        [attendant.AttendantId]
      );

      const dishes = await dbAll(
        `SELECT d.DishId AS id, d.DishName AS name
         FROM ChefDish cd
         JOIN Dish d ON d.DishId = cd.DishId
         WHERE cd.AttendantId = ?`,
        [attendant.AttendantId]
      );

      attendant.languages = langs;
      attendant.dishes = dishes;
    }
  }

  // 6) FINAL unified object
  return { flight, roster, pilots, attendants, passengers };
}
const staffUsers = {
    'pilot_abdulsallam': 'pilot1',
    'pilot_aya': 'pilot2',
    'pilot_karim': 'pilot3',
    'pilot_selin': 'pilot4',
    'attendant_hassan': 'attendant5',
    'attendant_merve': 'attendant6',
    'attendant_fatima': 'attendant7',
};

//hashing passwords
async function generateHashes() {
    for (const [username, password] of Object.entries(staffUsers)) {
        const hash = await bcrypt.hash(password, saltRounds);

        console.log(`Username: ${username}`)
        console.log(`Plain Password: ${password}`);
        console.log(`Hashed: ${hash}\n`);}
}
//generateHashes().catch(err => console.error('Error:', err));

//=============================================================================================================


// ROUTES

// show login page (GET)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// Handle Login (POST)
app.post('/', async (req, res) => {
    const { staffId, password } = req.body;

    if (!staffId || !password) {
        return res.status(400).send('Staff ID and password are required');
    }

    try {
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT UserId, Password FROM SystemUser WHERE UserId = ?',
                [staffId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.redirect('/');
        }

        const match = await bcrypt.compare(password, user.Password);

        if (match) {
            req.session.userId = user.UserId;
            return res.redirect('/assigned-flight-list');
        } else {
            return res.redirect('/');
        }

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal server error');
    }
});

// Show assigned flight list page (GET)
app.get('/assigned-flight-list', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'assigned-flight-list.html'));
});

// Passenger Flight Search (GET)
app.get('/passenger-flight-search', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'passenger-flight-search.html'));
});

// Extended View Page (GET)
app.get('/extended-view', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'extended-view.html'));

});

// Plane View Page (GET)
app.get('/plane-view', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'plane-view.html'));
});

// About Us Page (GET)
app.get('/about-us', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'about-us.html'));
});

// Passenger Flight Search (POST)
app.post('/passenger-flight-search', (req, res) => {
    const { ticketId } = req.body;

    const query = 'SELECT TicketID, FlightNumber FROM Passenger WHERE TicketID = ?';

    db.get(query, [ticketId], (err, row) => {
        if (err) {
            console.error('Search error:', err);
            return res.redirect('/passenger-flight-search');
        }

        if (row) {
            // Store ticket info in session for use on search result page
            req.session.ticketInfo = {
                ticketID: row.TicketID,
                flightNumber: row.FlightNumber
            };
          return res.redirect(`/flight-search-result?ticketId=${encodeURIComponent(row.TicketID)}`);
        } else {
            return res.redirect('/passenger-flight-search');
        }
    });
});

// Show flight search result page (GET)
app.get('/flight-search-result', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'flight-search-result.html'));
});

// Ticket lookup for flight-search-result page
app.get('/api/ticket/:ticketId', async (req, res) => {
  const { ticketId } = req.params;

  try {
    const row = await dbGet(
      `
      SELECT 
        p.PassengerId AS passengerId,
        p.TicketID AS ticketId,
        p.Name AS passengerName,
        p.SeatNumber AS seat,
        p.FlightNumber AS flight,
        p.ParentPassengerId AS parentPassengerId,
        f.FlightDateTime AS flightDateTime,
        f.DurationMinutes AS durationMinutes,
        f.DistanceKm AS distanceKm,
        f.SourceAirportCode AS sourceAirportCode,
        f.DestinationAirportCode AS destinationAirportCode,
        f.VehicleTypeCode AS vehicleTypeCode
      FROM Passenger p
      JOIN Flight f ON f.FlightNumber = p.FlightNumber
      WHERE p.TicketID = ?
      `,
      [ticketId]
    );

    if (!row) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.json(row);
  } catch (err) {
    console.error('GET /api/ticket failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Show tabular view page (GET)
app.get('/tabular-view', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'tabular-view.html'));
});

// Return flights that have rosters assigned
app.get("/api/assigned-flights", async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT
        f.FlightNumber,
        f.FlightDateTime,
        f.DurationMinutes,
        f.DistanceKm,
        f.SourceAirportCode,
        sa.City AS SourceCity,
        f.DestinationAirportCode,
        da.City AS DestinationCity,
        f.VehicleTypeCode,
        f.SharedFlightNumber,
        f.ConnectingFlightNumber
      FROM Flight f
      JOIN Airport sa ON sa.AirportCode = f.SourceAirportCode
      JOIN Airport da ON da.AirportCode = f.DestinationAirportCode
      WHERE EXISTS (
        SELECT 1 FROM Roster r WHERE r.FlightNumber = f.FlightNumber
      )
      ORDER BY f.FlightDateTime
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET /api/assigned-flights failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/roster/:flightNumber/export", async (req, res) => {
  try {
    const data = await buildRosterResponse(req.params.flightNumber);
    if (!data) return res.status(404).json({ error: "Flight not found" });

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="roster-${req.params.flightNumber}.json"`
    );

    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/roster/:flightNumber", async (req, res) => {
  try {
    const data = await buildRosterResponse(req.params.flightNumber);
    if (!data) return res.status(404).json({ error: "Flight not found" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Return currently logged-in user info
app.get("/api/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const row = await dbGet(
      `SELECT UserId, Username, Role FROM SystemUser WHERE UserId = ?`,
      [req.session.userId]
    );

    if (!row) return res.status(404).json({ error: "User not found" });

    // For "Staff Name", your DB currently has Username only.
    // We'll display Username as staff name.
    res.json({
      userId: row.UserId,
      name: row.Username,
      role: row.Role
    });
  } catch (err) {
    console.error("GET /api/me failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});