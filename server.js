const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'educonnect_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Set View Engine (Simple HTML with some logic)
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Helper Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const approved = role === 'student' ? 1 : 0; // Students are auto-approved, mentors need admin approval

    db.run('INSERT INTO users (name, email, password, role, approved) VALUES (?, ?, ?, ?, ?)', 
        [name, email, hashedPassword, role, approved], (err) => {
        if (err) {
            return res.render('register', { error: 'Email already exists' });
        }
        res.redirect('/login');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    const user = req.session.user;
    if (user.role === 'student') {
        // Fetch mentors and student's sessions
        db.all('SELECT * FROM users WHERE role = "mentor" AND approved = 1', (err, mentors) => {
            db.all('SELECT s.*, u.name as mentor_name FROM sessions s JOIN users u ON s.mentor_id = u.id WHERE s.student_id = ?', [user.id], (err, sessions) => {
                res.render('student_dashboard', { user, mentors, sessions });
            });
        });
    } else if (user.role === 'mentor') {
        // Fetch mentor's availability and sessions
        db.all('SELECT * FROM availability WHERE mentor_id = ?', [user.id], (err, availability) => {
            db.all('SELECT s.*, u.name as student_name FROM sessions s JOIN users u ON s.student_id = u.id WHERE s.mentor_id = ?', [user.id], (err, sessions) => {
                res.render('mentor_dashboard', { user, availability, sessions });
            });
        });
    } else if (user.role === 'admin') {
        // Fetch all users for admin
        db.all('SELECT * FROM users', (err, users) => {
            res.render('admin_dashboard', { user, users });
        });
    }
});

// Student: Book Session
app.post('/book-session', isAuthenticated, (req, res) => {
    const { mentor_id, date, time } = req.body;
    const student_id = req.session.user.id;
    db.run('INSERT INTO sessions (student_id, mentor_id, date, time) VALUES (?, ?, ?, ?)', 
        [student_id, mentor_id, date, time], (err) => {
        console.log(`Notification: New booking request for Mentor ID ${mentor_id} from Student ID ${student_id}`);
        res.redirect('/dashboard');
    });
});

// Mentor: Set Availability
app.post('/set-availability', isAuthenticated, (req, res) => {
    const { date, time } = req.body;
    const mentor_id = req.session.user.id;
    db.run('INSERT INTO availability (mentor_id, available_date, available_time) VALUES (?, ?, ?)', 
        [mentor_id, date, time], (err) => {
        res.redirect('/dashboard');
    });
});

// Mentor: Confirm/Cancel Session
app.post('/update-session', isAuthenticated, (req, res) => {
    const { session_id, status } = req.body;
    db.run('UPDATE sessions SET status = ? WHERE id = ?', [status, session_id], (err) => {
        console.log(`Notification: Session ID ${session_id} status updated to ${status}`);
        res.redirect('/dashboard');
    });
});

// Admin: Approve Mentor
app.post('/approve-mentor', isAuthenticated, (req, res) => {
    const { user_id } = req.body;
    db.run('UPDATE users SET approved = 1 WHERE id = ?', [user_id], (err) => {
        res.redirect('/dashboard');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
