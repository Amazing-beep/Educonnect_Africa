# EduConnect Africa

EduConnect Africa is a lightweight web application designed to bridge the gap between fast-paced high school graduates and expert mentors through 15-30 minute guidance sessions. Built as a minimum viable product (MVP), it provides a seamless platform for scheduling, managing profiles, and coordinating mentorship opportunities.

## System Actors
- **Student**: Can search for mentors, view profiles, and book 15-30 minute guidance sessions.
- **Mentor**: Can customize their profile, set up availability slots, and manage incoming session requests.
- **Admin**: Can view platform aggregate statistics (total users, mentors, and bookings) and oversee the system.

## Key Features (SRS Alignment)
- **FR1 - User Authentication**: Secure login and registration flows using bcrypt for password hashing.
- **FR2 - Profile Management**: Mentors and students can update their bios, universities, fields of study, and upload profile images.
- **FR3 - Availability System**: Mentors can dictate specific open time slots for bookings.
- **FR4 - Session Booking Engine**: Students can seamlessly book available slots (automatically preventing double-booking).
- **FR5 - Notifications**: Simulated email notifications for booking confirmations and cancellations.
- **FR6 - Mentor Discovery**: Students can search for mentors by name, university, or field of study.
- **FR7 - Dashboard Management**: Dedicated dashboards for Students, Mentors, and Admins to manage sessions and platform data.

## Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** SQLite (Local file-based database for simplicity)
- **Frontend:** HTML, Custom CSS layout (Flexbox/Grid), embedded vanilla JS
- **Templating:** EJS

---

## Setup Instructions

Follow these exact steps to run the application locally on your machine.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Educonnect_Africa-4
   ```

2. **Install dependencies:**
   Make sure Node.js is installed on your machine. Run the following command to download all necessary packages:
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - **`PORT`** (Optional): Define the port for the web server to listen on (defaults to 3000).
   - **Email Notifications** (Optional): If you plan to use real email notifications instead of the simulated console logs, copy the provided `.env.example` file to `.env` and fill in your SMTP credentials:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the Database:**
   *Note: The SQLite database (`educonnect.db`) is automatically created and seeded when the server starts. You do not need to run any manual database migrations.*

5. **Run the application:**
   ```bash
   npm start
   ```

6. **Open in browser:**
   Open your preferred web browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

### Notes on file storage:
The application uses the `/public/uploads` directory to store uploaded user profile pictures. This folder is generated automatically when the server runs, but make sure the application has write permissions to that directory.

---

## Links & Documentation
- [https://youtu.be/aq-IFJS3STE](#) [*Demo Video*]
- [https://docs.google.com/document/d/1PVB3ZrEETLAlLugVIKRTPVTsheRyEm3HjX_p5-7UPk0/edit?usp=sharing](#) [*SRS Document*]

## Demo Credentials
- **Admin Account**: `admin@educonnect.africa` / `admin123`
- *To simulate student or mentor flows, simply register a new account from the homepage.*
