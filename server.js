const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let db;

(async () => {
    // open Database Connection
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // create table and seed user automatically
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )
    `);

    const testUser = await db.get('SELECT * FROM users WHERE email = ?', ['iptrack@sample.com']);
    if (!testUser) {
        await db.run('INSERT INTO users (email, password) VALUES (?, ?)', ['iptrack@sample.com', 'passwordip123']);
        console.log("✅ User Seeder: Test user created!");
    }
})();

// login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (user) {
            res.json({ success: true, user: { email: user.email } });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(8000, () => console.log('🚀 API running on http://localhost:8000'));
