const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./database');
const multer = require('multer');
const fs = require('fs');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

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

app.post('/register', upload.single('profile_image'), (req, res) => {
    const { name, email, password, role, bio, university, field_of_study } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const profile_image = req.file ? '/uploads/' + req.file.filename : null;

    db.run('INSERT INTO users (name, email, password, role, bio, university, field_of_study, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [name, email, hashedPassword, role, bio || null, university || null, field_of_study || null, profile_image], (err) => {
        if (err) {
            return res.render('register', { error: 'Email already exists or invalid data' });
        }
        res.redirect('/login');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/mentor/:id', isAuthenticated, (req, res) => {
    const mentorId = req.params.id;
    db.get('SELECT id, name, email, bio, university, field_of_study, profile_image FROM users WHERE id = ? AND role = "mentor"', [mentorId], (err, mentor) => {
        if (!mentor) return res.redirect('/dashboard');
        
        db.all('SELECT * FROM availability WHERE mentor_id = ? AND is_booked = 0', [mentorId], (err, availability) => {
            res.render('mentor_profile', { user: req.session.user, mentor, availability });
        });
    });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    const user = req.session.user;
    if (user.role === 'student') {
        let query = 'SELECT * FROM users WHERE role = "mentor"';
        let params = [];
        if (req.query.search) {
            query += ' AND (name LIKE ? OR field_of_study LIKE ? OR university LIKE ?)';
            const searchTerm = `%${req.query.search}%`;
            params = [searchTerm, searchTerm, searchTerm];
        }

        // Fetch mentors and student's sessions
        db.all(query, params, (err, mentors) => {
            db.all('SELECT s.*, u.name as mentor_name FROM sessions s JOIN users u ON s.mentor_id = u.id WHERE s.student_id = ?', [user.id], (err, sessions) => {
                res.render('student_dashboard', { user, mentors, sessions, search: req.query.search || '', msg: req.query.msg });
            });
        });
    } else if (user.role === 'mentor') {
        // Fetch mentor's availability and sessions
        db.all('SELECT * FROM availability WHERE mentor_id = ? ORDER BY available_date ASC, available_time ASC', [user.id], (err, availability) => {
            db.all('SELECT s.*, u.name as student_name FROM sessions s JOIN users u ON s.student_id = u.id WHERE s.mentor_id = ?', [user.id], (err, sessions) => {
                res.render('mentor_dashboard', { user, availability, sessions, msg: req.query.msg });
            });
        });
    } else if (user.role === 'admin') {
        // Fetch all users for admin
        db.all('SELECT * FROM users', (err, users) => {
            db.get('SELECT COUNT(*) as total_mentors FROM users WHERE role="mentor"', [], (err, mentorCount) => {
                db.get('SELECT COUNT(*) as total_bookings FROM sessions', [], (err, bookingCount) => {
                    db.get('SELECT COUNT(*) as active_users FROM users', [], (err, userCount) => {
                        res.render('admin_dashboard', { 
                            user, users, 
                            stats: {
                                mentors: mentorCount ? mentorCount.total_mentors : 0,
                                bookings: bookingCount ? bookingCount.total_bookings : 0,
                                activeUsers: userCount ? userCount.active_users : 0
                            }
                        });
                    });
                });
            });
        });
    }
});

// Student: Book Session
app.post('/book-session', isAuthenticated, (req, res) => {
    const { mentor_id, slot } = req.body;
    const student_id = req.session.user.id;
    
    db.get('SELECT * FROM availability WHERE id = ? AND is_booked = 0', [slot], (err, av_slot) => {
        if (!av_slot) {
            // Either booked or invalid slot
            return res.redirect('/mentor/' + mentor_id + '?msg=error_booked');
        }

        db.run('INSERT INTO sessions (student_id, mentor_id, date, time) VALUES (?, ?, ?, ?)', 
            [student_id, mentor_id, av_slot.available_date, av_slot.available_time], function(err) {
            
            if (err) return res.redirect('/dashboard?msg=error_booking');
            
            // Mark slot as booked
            db.run('UPDATE availability SET is_booked = 1 WHERE id = ?', [slot], () => {
                console.log(`[EXTERNAL_SIMULATION] Email sent to student (ID: ${student_id}) and mentor (ID: ${mentor_id}) confirming new booking on ${av_slot.available_date} at ${av_slot.available_time}.`);
                res.redirect('/dashboard?msg=booking_success');
            });
        });
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
    db.run('UPDATE sessions SET status = ? WHERE id = ?', [status, session_id], function(err) {
        console.log(`[EXTERNAL_SIMULATION] Email sent regarding Session ID ${session_id} status updated to ${status}`);
        
        if (status === 'cancelled') {
            // Restore availability slot
            db.get('SELECT date, time, mentor_id FROM sessions WHERE id = ?', [session_id], (err, row) => {
                if (row) {
                    db.run('UPDATE availability SET is_booked = 0 WHERE mentor_id = ? AND available_date = ? AND available_time = ?', 
                        [row.mentor_id, row.date, row.time], () => {
                        res.redirect('/dashboard?msg=session_updated');
                    });
                } else {
                    res.redirect('/dashboard?msg=session_updated');
                }
            });
        } else {
            res.redirect('/dashboard?msg=session_updated');
        }
    });
});

// Admin approve mentor completely deleted here
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
