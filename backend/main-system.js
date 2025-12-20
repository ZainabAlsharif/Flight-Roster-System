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

//middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  name: "flytech.sid",
  secret: "cmpe331-flytech-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,   // IMPORTANT for localhost
    path: "/"
  }
}));

//static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

//database connection
const dbPath = path.join(__dirname, 'database', 'roster.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database at', dbPath);
    }
});
db.configure("busyTimeout", 5000);

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
      `SELECT PilotId, Name, Age, Gender, Nationality, VehicleTypeCode, AllowedRangeKm, SeniorityLevel, PilotSeatNumber
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
      `SELECT AttendantId, Name, Age, Gender, Nationality, AttendantType, AttendantSeatNumber
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
    'admin': 'admin123',
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
                'SELECT UserId, Password, Role FROM SystemUser WHERE UserId = ?',
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
            req.session.userRole = user.Role;
            req.session.save(() => {
            //redirect based on user role (staff or admin)
            if (user.Role === 'admin') {
                return res.redirect('/admin-home');
            } else {
                return res.redirect('/assigned-flight-list');
            } });
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

// Show admin home page (GET)
app.get('/admin-home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin-home.html'));
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
    // userId can be 0 -> don't use !req.session.userId
    if (req.session.userId === undefined || req.session.userId === null) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const row = await dbGet(
      `SELECT UserId, Username, Role FROM SystemUser WHERE UserId = ?`,
      [req.session.userId]
    );

    if (!row) return res.status(404).json({ error: "User not found" });

    res.json({ userId: row.UserId, name: row.Username, role: row.Role });
  } catch (err) {
    console.error("GET /api/me failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: create flight (with gate/terminal/capacity)
app.post("/api/admin/flights", requireAdmin, async (req, res) => {
  const {
    flightNumber,
    flightDateTime,
    durationMinutes,
    distanceKm,
    sourceAirportCode,
    destinationAirportCode,
    vehicleTypeCode,
    sharedFlightNumber,
    sharedCompanyName,
    connectingFlightNumber,
    gate,
    terminal,
    capacity
  } = req.body;

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO Flight (
          FlightNumber,
          FlightDateTime,
          DurationMinutes,
          DistanceKm,
          SourceAirportCode,
          DestinationAirportCode,
          VehicleTypeCode,
          SharedFlightNumber,
          SharedCompanyName,
          ConnectingFlightNumber,
          Gate,
          Terminal,
          Capacity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          flightNumber,
          flightDateTime,
          durationMinutes,
          distanceKm,
          sourceAirportCode,
          destinationAirportCode,
          vehicleTypeCode,
          sharedFlightNumber || null,
          sharedCompanyName || null,
          connectingFlightNumber || null,
          gate || null,
          terminal || null,
          capacity ?? null
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });

    res.json({ message: "Flight created successfully" });
  } catch (err) {
    console.error("Create flight error:", err);
    res.status(500).json({ error: "Failed to create flight" });
  }
});

function requireAdmin(req, res, next) {
  // IMPORTANT: userId can be 0, so don't use !req.session.userId
  if (req.session.userId === undefined || req.session.userId === null) {
    return res.status(401).json({ error: "Not logged in" });
  }

  if (String(req.session.userId) !== "0") {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
}


// ================= AUTO ASSIGN ROSTER (ADMIN ONLY) =================
app.post("/api/admin/flights/:flightNumber/auto-assign", requireAdmin,async (req, res) => {
  try {
    // admin check
    //if (!req.session.userId || req.session.userRole.toLowerCase() !== "admin") {
    //  return res.status(403).json({ error: "Admin access only" });
   // }
   
    const { flightNumber } = req.params;

    // 1) Load flight
    const flight = await dbGet(
      `SELECT FlightNumber, DistanceKm, VehicleTypeCode, Capacity
       FROM Flight
       WHERE FlightNumber = ?`,
      [flightNumber]
    );

    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    // 2) Select pilots (2 pilots)
    const pilots = await dbAll(
      `
      SELECT PilotId
      FROM Pilot
      WHERE VehicleTypeCode = ?
        AND AllowedRangeKm >= ?
      ORDER BY SeniorityLevel DESC
      LIMIT 2
      `,
      [flight.VehicleTypeCode, flight.DistanceKm]
    );

    if (pilots.length < 2) {
      return res.status(400).json({ error: "Not enough pilots available" });
    }

    const pilotIds = pilots.map(p => p.PilotId);

    // 3) Select attendants (1 per 50 seats)
    const attendantsNeeded = Math.ceil((flight.Capacity || 0) / 50);

    const attendants = await dbAll(
      `
      SELECT AttendantId
      FROM Attendant
      LIMIT ?
      `,
      [attendantsNeeded]
    );

    if (attendants.length < attendantsNeeded) {
      return res.status(400).json({ error: "Not enough attendants available" });
    }

    const attendantIds = attendants.map(a => a.AttendantId);
// 4) Build roster json
const rosterJson = JSON.stringify({
  pilots: pilotIds,
  attendants: attendantIds
});

// 5) Save roster (update latest if exists, else insert)
const existing = await dbGet(
  `SELECT RosterId FROM Roster WHERE FlightNumber = ? ORDER BY RosterId DESC LIMIT 1`,
  [flightNumber]
);

if (existing) {
  await new Promise((resolve, reject) => {
    db.run(
      `UPDATE Roster
       SET GeneratedAt = datetime('now'),
           RosterJson = ?
       WHERE RosterId = ?`,
      [rosterJson, existing.RosterId],
      (err) => (err ? reject(err) : resolve())
    );
  });
} else {
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Roster (FlightNumber, GeneratedAt, RosterJson)
       VALUES (?, datetime('now'), ?)`,
      [flightNumber, rosterJson],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

res.json({
  message: "Auto assignment completed",
  pilots: pilotIds,
  attendants: attendantIds
});


  } catch (err) {
    console.error("Auto assign failed:", err);
    res.status(500).json({ error: "Auto assignment failed" });
  }
});

// ================= MANUAL ASSIGN ROSTER (ADMIN ONLY) =================
// Body: { "pilots": [1001,1002], "attendants": [2001,2002] }
app.post("/api/admin/flights/:flightNumber/manual-assign", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const { pilots, attendants } = req.body;

    if (!Array.isArray(pilots) || pilots.length !== 2) {
      return res.status(400).json({ error: "pilots must be an array of exactly 2 pilot IDs" });
    }
    if (!Array.isArray(attendants)) {
      return res.status(400).json({ error: "attendants must be an array" });
    }

    // ensure flight exists
    const flight = await dbGet(`SELECT FlightNumber FROM Flight WHERE FlightNumber = ?`, [flightNumber]);
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    // validate pilots exist
    const pilotRows = await dbAll(
      `SELECT PilotId FROM Pilot WHERE PilotId IN (${pilots.map(() => "?").join(",")})`,
      pilots
    );
    if (pilotRows.length !== pilots.length) {
      return res.status(400).json({ error: "One or more pilot IDs are invalid" });
    }

    // validate attendants exist (if any)
    if (attendants.length > 0) {
      const attRows = await dbAll(
        `SELECT AttendantId FROM Attendant WHERE AttendantId IN (${attendants.map(() => "?").join(",")})`,
        attendants
      );
      if (attRows.length !== attendants.length) {
        return res.status(400).json({ error: "One or more attendant IDs are invalid" });
      }
    }

    const rosterJson = JSON.stringify({ pilots, attendants });

    // update latest roster if exists, else insert
    const existing = await dbGet(
      `SELECT RosterId FROM Roster WHERE FlightNumber = ? ORDER BY RosterId DESC LIMIT 1`,
      [flightNumber]
    );

    if (existing) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE Roster
           SET GeneratedAt = datetime('now'),
               RosterJson = ?
           WHERE RosterId = ?`,
          [rosterJson, existing.RosterId],
          (err) => (err ? reject(err) : resolve())
        );
      });
    } else {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO Roster (FlightNumber, GeneratedAt, RosterJson)
           VALUES (?, datetime('now'), ?)`,
          [flightNumber, rosterJson],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    res.json({ message: "Manual assignment completed", pilots, attendants });
  } catch (err) {
    console.error("Manual assign failed:", err);
    res.status(500).json({ error: "Manual assignment failed" });
  }
});

// ADMIN: get assignment options for a flight (pilots/attendants + flight info)
app.get("/api/admin/flights/:flightNumber/assignment-options", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const flight = await dbGet(
      `SELECT FlightNumber, DistanceKm, VehicleTypeCode, Capacity
       FROM Flight WHERE FlightNumber = ?`,
      [flightNumber]
    );
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    const pilots = await dbAll(
      `SELECT PilotId, Name, VehicleTypeCode, AllowedRangeKm, SeniorityLevel
       FROM Pilot
       WHERE VehicleTypeCode = ?
         AND AllowedRangeKm >= ?
       ORDER BY SeniorityLevel DESC`,
      [flight.VehicleTypeCode, flight.DistanceKm]
    );

    const attendants = await dbAll(
      `SELECT AttendantId, Name, AttendantType
       FROM Attendant
       ORDER BY AttendantType, Name`
    );

    res.json({
      flight,
      rules: {
        pilotsRequired: 2,
        attendantsNeeded: Math.ceil((flight.Capacity || 0) / 50)
      },
      pilots,
      attendants
    });
  } catch (err) {
    console.error("Assignment options failed:", err);
    res.status(500).json({ error: "Assignment options failed" });
  }
});
// ADMIN: list passengers for a flight
app.get("/api/admin/flights/:flightNumber/passengers", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const flight = await dbGet(`SELECT FlightNumber FROM Flight WHERE FlightNumber = ?`, [flightNumber]);
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    const passengers = await dbAll(
      `SELECT PassengerId, TicketID, Name, Age, Gender, Nationality, SeatType, SeatNumber, ParentPassengerId
       FROM Passenger
       WHERE FlightNumber = ?
       ORDER BY
         CASE WHEN SeatType = 'Business' THEN 0 ELSE 1 END,
         SeatNumber`,
      [flightNumber]
    );

    res.json({ flightNumber, passengers });
  } catch (err) {
    console.error("Passengers list failed:", err);
    res.status(500).json({ error: "Passengers list failed" });
  }
});
// ADMIN: add passenger to a flight
app.post("/api/admin/flights/:flightNumber/passengers", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const {
      ticketId,
      name,
      age,
      gender,
      nationality,
      seatType,
      seatNumber,
      parentPassengerId
    } = req.body;

    // basic validation
    if (!ticketId || !name || !age || !gender || !nationality || !seatType || !seatNumber) {
      return res.status(400).json({ error: "Missing required passenger fields" });
    }

    // flight exists?
    const flight = await dbGet(`SELECT FlightNumber FROM Flight WHERE FlightNumber = ?`, [flightNumber]);
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    // seat already taken on same flight?
    const seatTaken = await dbGet(
      `SELECT 1 FROM Passenger WHERE FlightNumber = ? AND SeatNumber = ?`,
      [flightNumber, seatNumber]
    );
    if (seatTaken) return res.status(400).json({ error: "Seat already taken" });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Passenger
         (TicketID, Name, Age, Gender, Nationality, SeatType, SeatNumber, ParentPassengerId, FlightNumber)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketId,
          name,
          age,
          gender,
          nationality,
          seatType,
          seatNumber,
          parentPassengerId || null,
          flightNumber
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });

    res.json({ message: "Passenger added", flightNumber, ticketId });
  } catch (err) {
    console.error("Add passenger failed:", err);
    res.status(500).json({ error: "Add passenger failed" });
  }
});
// ADMIN: full flight manage payload (options + current roster + passengers)
app.get("/api/admin/flights/:flightNumber/manage", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const flight = await dbGet(
      `SELECT FlightNumber, FlightDateTime, DistanceKm, VehicleTypeCode, Capacity
       FROM Flight WHERE FlightNumber = ?`,
      [flightNumber]
    );
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    // current roster (latest)
    const rosterRow = await dbGet(
      `SELECT RosterId, GeneratedAt, RosterJson
       FROM Roster
       WHERE FlightNumber = ?
       ORDER BY RosterId DESC
       LIMIT 1`,
      [flightNumber]
    );

    let current = { rosterId: null, generatedAt: null, pilots: [], attendants: [] };
    if (rosterRow) {
      let parsed = {};
      try { parsed = JSON.parse(rosterRow.RosterJson || "{}"); } catch { parsed = {}; }
      current = {
        rosterId: rosterRow.RosterId,
        generatedAt: rosterRow.GeneratedAt,
        pilots: parsed.pilots || [],
        attendants: parsed.attendants || []
      };
    }

    // options
    const pilots = await dbAll(
      `SELECT PilotId, Name, VehicleTypeCode, AllowedRangeKm, SeniorityLevel
       FROM Pilot
       WHERE VehicleTypeCode = ?
         AND AllowedRangeKm >= ?
       ORDER BY SeniorityLevel DESC`,
      [flight.VehicleTypeCode, flight.DistanceKm]
    );

    const attendants = await dbAll(
      `SELECT AttendantId, Name, AttendantType
       FROM Attendant
       ORDER BY AttendantType, Name`
    );

    // passengers
    const passengers = await dbAll(
      `SELECT PassengerId, TicketID, Name, Age, Gender, Nationality, SeatType, SeatNumber, ParentPassengerId
       FROM Passenger
       WHERE FlightNumber = ?
       ORDER BY
         CASE WHEN SeatType = 'Business' THEN 0 ELSE 1 END,
         SeatNumber`,
      [flightNumber]
    );

    res.json({
      flight,
      rules: {
        pilotsRequired: 2,
        attendantsNeeded: Math.ceil((flight.Capacity || 0) / 50)
      },
      currentRoster: current,
      options: { pilots, attendants },
      passengers
    });
  } catch (err) {
    console.error("Manage payload failed:", err);
    res.status(500).json({ error: "Manage payload failed" });
  }
});
// ADMIN: list all flights (for admin pages)
app.get("/api/admin/flights", requireAdmin, async (req, res) => {
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
        f.Capacity,
        f.Gate,
        f.Terminal
      FROM Flight f
      JOIN Airport sa ON sa.AirportCode = f.SourceAirportCode
      JOIN Airport da ON da.AirportCode = f.DestinationAirportCode
      ORDER BY f.FlightDateTime
    `);

    res.json(rows);
  } catch (err) {
    console.error("Admin flights list failed:", err);
    res.status(500).json({ error: "Admin flights list failed" });
  }
});
// ADMIN: get one flight details
app.get("/api/admin/flights/:flightNumber", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const flight = await dbGet(
      `
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
        f.Capacity,
        f.Gate,
        f.Terminal,
        f.SharedFlightNumber,
        f.SharedCompanyName,
        f.ConnectingFlightNumber
      FROM Flight f
      JOIN Airport sa ON sa.AirportCode = f.SourceAirportCode
      JOIN Airport da ON da.AirportCode = f.DestinationAirportCode
      WHERE f.FlightNumber = ?
      `,
      [flightNumber]
    );

    if (!flight) return res.status(404).json({ error: "Flight not found" });

    res.json(flight);
  } catch (err) {
    console.error("Get flight failed:", err);
    res.status(500).json({ error: "Get flight failed" });
  }
});
// ADMIN: update flight details
app.put("/api/admin/flights/:flightNumber", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const {
      flightDateTime,
      durationMinutes,
      distanceKm,
      sourceAirportCode,
      destinationAirportCode,
      vehicleTypeCode,
      gate,
      terminal,
      capacity,
      sharedFlightNumber,
      sharedCompanyName,
      connectingFlightNumber
    } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE Flight
        SET
          FlightDateTime = ?,
          DurationMinutes = ?,
          DistanceKm = ?,
          SourceAirportCode = ?,
          DestinationAirportCode = ?,
          VehicleTypeCode = ?,
          Gate = ?,
          Terminal = ?,
          Capacity = ?,
          SharedFlightNumber = ?,
          SharedCompanyName = ?,
          ConnectingFlightNumber = ?
        WHERE FlightNumber = ?
        `,
        [
          flightDateTime,
          durationMinutes,
          distanceKm,
          sourceAirportCode,
          destinationAirportCode,
          vehicleTypeCode,
          gate || null,
          terminal || null,
          capacity ?? null,
          sharedFlightNumber || null,
          sharedCompanyName || null,
          connectingFlightNumber || null,
          flightNumber
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });

    res.json({ message: "Flight updated successfully" });
  } catch (err) {
    console.error("Update flight failed:", err);
    res.status(500).json({ error: "Update flight failed" });
  }
});

app.delete("/api/admin/flights/:flightNumber", requireAdmin, async (req, res) => {
  try {
    const { flightNumber } = req.params;

    // delete roster(s) first to avoid FK problems (if any)
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM Roster WHERE FlightNumber = ?`, [flightNumber], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // delete passengers
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM Passenger WHERE FlightNumber = ?`, [flightNumber], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // delete flight
    const result = await new Promise((resolve, reject) => {
      db.run(`DELETE FROM Flight WHERE FlightNumber = ?`, [flightNumber], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: "Flight not found" });
    }

    res.json({ message: "Flight deleted successfully" });
  } catch (err) {
    console.error("Delete flight failed:", err);
    res.status(500).json({ error: "Delete flight failed" });
  }
});

// API login (for Postman/PowerShell): no redirect, returns JSON and saves session
app.post("/api/login", async (req, res) => {
  const { staffId, password } = req.body;

  if (!staffId || !password) {
    return res.status(400).json({ error: "Staff ID and password are required" });
  }

  try {
    const user = await dbGet(
      "SELECT UserId, Password, Role FROM SystemUser WHERE UserId = ?",
      [staffId]
    );

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.UserId;
    req.session.userRole = user.Role;

    // IMPORTANT: force session to be saved before responding
    req.session.save(() => {
      res.json({ message: "Logged in", userId: user.UserId, role: user.Role });
    });
  } catch (err) {
    console.error("API login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}
module.exports = app;
