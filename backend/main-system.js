const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const saltRounds = 10;
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});