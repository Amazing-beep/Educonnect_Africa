# EduConnect Africa - Student Project

EduConnect Africa is a simple web application designed to connect high school graduates with mentors for short, 15-30 minute guidance sessions. This project is built as a student-level implementation using Node.js, Express, and SQLite.

## Features
- **Authentication:** Register and login for Students, Mentors, and Admins.
- **Student Dashboard:** Browse approved mentors, book sessions, and view booking status.
- **Mentor Dashboard:** Set availability, view booking requests, and confirm/cancel sessions.
- **Admin Dashboard:** Manage users and approve mentor accounts.
- **Simulated Notifications:** Booking updates are logged to the server console.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite (File-based)
- **Frontend:** HTML, CSS (Vanilla JS)
- **Templating:** EJS

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Application:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`.

## Demo Credentials

### Admin
- **Email:** `admin@educonnect.africa`
- **Password:** `admin123`

### Student (Example)
- **Email:** `student@example.com`
- **Password:** `password123` (Register first)

### Mentor (Example)
- **Email:** `mentor@example.com`
- **Password:** `password123` (Register first, then approve via Admin)

## Project Structure
- `server.js`: Main application logic and routes.
- `database.js`: SQLite database setup and schema.
- `views/`: HTML templates for different pages.
- `public/`: Static assets (CSS).
- `educonnect.db`: SQLite database file (generated on first run).
