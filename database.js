const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'educonnect.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('student', 'mentor', 'admin')) NOT NULL,
        bio TEXT,
        university TEXT,
        field_of_study TEXT,
        profile_image TEXT
    )`);

    // Migrations for existing DB users table
    db.run('ALTER TABLE users ADD COLUMN bio TEXT', () => {});
    db.run('ALTER TABLE users ADD COLUMN university TEXT', () => {});
    db.run('ALTER TABLE users ADD COLUMN field_of_study TEXT', () => {});
    db.run('ALTER TABLE users ADD COLUMN profile_image TEXT', () => {});

    // Availability Table
    db.run(`CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentor_id INTEGER,
        available_date TEXT NOT NULL,
        available_time TEXT NOT NULL,
        is_booked BOOLEAN DEFAULT 0,
        FOREIGN KEY (mentor_id) REFERENCES users(id)
    )`);

    // Migrations for existing DB availability table
    db.run('ALTER TABLE availability ADD COLUMN is_booked BOOLEAN DEFAULT 0', () => {});

    // Sessions Table
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        mentor_id INTEGER,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER DEFAULT 30,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (mentor_id) REFERENCES users(id)
    )`);

    // Create Admin User if not exists
    const adminEmail = 'admin@educonnect.africa';
    db.get('SELECT * FROM users WHERE email = ?', [adminEmail], (err, row) => {
        if (!row) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
                ['System Admin', adminEmail, hashedPassword, 'admin']);
            console.log('Admin user created: admin@educonnect.africa / admin123');
        }
    });
});

module.exports = db;
