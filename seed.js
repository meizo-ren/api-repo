const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // 1. Create the users table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  // 2. Insert a test user
  const email = 'iptrack@sample.com';
  const password = 'passwordip123'; // In a real app, you would hash this!

  db.run(
    `INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`,
    [email, password],
    (err) => {
      if (err) {
        console.error("Error seeding user:", err.message);
      } else {
        console.log(`Seeding successful! You can now login with: ${email} / ${password}`);
      }
    }
  );
});

db.close();