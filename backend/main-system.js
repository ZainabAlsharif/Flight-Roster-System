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

// Path to frontend
let frontendPath = path.join(__dirname, '../frontend');
if (!fs.existsSync(frontendPath)) {
    frontendPath = path.join(__dirname, 'frontend');
}
console.log('Serving frontend from:', frontendPath);

// Stsqtic files
app.use(express.static(frontendPath, { index: false, extensions: ['html'] }));

// Database connection
const dbPath = path.join(__dirname, 'database', 'roster.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});
app.locals.db = db;

// Routes
app.get('/', (req, res) => {
    const loginFile = path.join(frontendPath, 'login.html');
    if (fs.existsSync(loginFile)) {
        res.sendFile(loginFile);
    } else {
        res.status(404).send('Error: login.html not found');
    }
});

//passwords for staff users
const testUsers = {
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
    for (const [username, password] of Object.entries(testUsers)) {
        const hash = await bcrypt.hash(password, saltRounds);

        console.log(`Username: ${username}`)
        console.log(`Plain Password: ${password}`);
        console.log(`Hashed: ${hash}\n`);}
}
//generateHashes().catch(err => console.error('Error:', err));

// Login Route
app.post('/login/assigned-flight-list', async (req, res) => {
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
            return res.status(401).send('Invalid Staff ID or password');
        }

        const match = await bcrypt.compare(password, user.Password);

        if (match) {
            // 4. Fix: Redirect to clean URL (no .html)
            res.redirect('/assigned-flight-list');
        } else {
            res.status(401).send('Invalid Staff ID or password');
        }

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});