# EduConnect Africa - MVP

EduConnect Africa is a web application designed to connect high school graduates with mentors for 15-30 minute guidance sessions. Built with Node.js, Express, and SQLite, this upgraded MVP features mentor profiling, availability scheduling, robust booking flows, and a modern responsive UI.

## Features Added
- **Mentor Profiles:** Mentors can add Bios, University names, and Fields of Study.
- **Search & Filter:** Students can search mentors by keywords or fields.
- **Availability Management:** Mentors set specific active slots, which vanish once booked.
- **Cancellations:** Users cancelling sessions will free up the slot automatically.
- **Admin Dashboard:** Displays aggregate mock stats for active mentors, bookings, and users.
- **UI/UX Modernization:** Mobile-responsive deep blue and pink accent theme with custom CSS.
- **Simulated Notifications:** Email notifications are simulated in the Node console.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite (File-based local DB)
- **Frontend:** HTML, Custom CSS layout (Flexbox/Grid), embedded JS
- **Templating:** EJS

## Local Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Application:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`.

## Deployment Instructions

This application is ready to deploy to cloud providers like **Render** or **Vercel** with minimal setup.

### Heroku / Render deployment
1. Push this repository to GitHub.
2. Connect your GitHub account to Render.
3. Create a **New Web Service**, selecting this repository.
4. Render will automatically detect Node.js.
5. Setup the Build Command: `npm install`
6. Setup the Start Command: `npm start`
7. Click Deploy. *Note: SQLite will be ephemeral on free instances in Render unless attached to a persistent disk.*

### Vercel Deployment
To deploy full-stack Express apps easily to Vercel, you can simply use the Vercel CLI or Dashboard. Ensure you configure it properly to route Express APIs, though Render/Railway are typically better suited for raw Node+SQLite applications than serverless platforms like Vercel.

## Demo Credentials

- **Admin Account:** `admin@educonnect.africa` / `admin123`
- Register manually as a Mentor or Student to test workflows.

