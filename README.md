# Telemedecine

A full-stack telemedicine platform that lets patients book appointments with doctors and consult with them online through live video calls, right from the browser.

Built with React on the frontend and Node/Express + MongoDB on the backend, with real-time video powered by PeerJS and Socket.IO.

## What it does

- **Patients** can search doctors by name or specialty, book appointments, pay online, join video consultations, and keep a personal medical folder.
- **Doctors** manage their availability, review bookings, access their patients' medical folders during a consultation, and get their profile approved by an admin before going live.
- **Admins** oversee the platform: manage patients, doctors, and bookings, and track platform activity through an analytics dashboard.
- **Video consultations** run in a dedicated room per booking, with mic/camera controls and a peer-to-peer connection — no third-party video SDK needed.

## Tech stack

**Frontend**
- React 18 + Vite
- React Router
- Tailwind CSS + MUI
- Socket.IO client & PeerJS for real-time video
- Chart.js for analytics
- Stripe for payments

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- Socket.IO + PeerServer for signaling
- JWT authentication, bcrypt for password hashing
- Stripe for payments, SendGrid/Nodemailer for emails

## Project structure

```
Telemedecine/
├── frontend/     # React + Vite client
└── backend/      # Express API + Socket.IO server
```

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Stripe account (for payments)
- SendGrid account or SMTP credentials (for emails)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with your own values:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
CLIENT_SITE_URL=http://localhost:5173
```

```bash
npm run start-dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_BASE_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Roadmap

- [ ] Doctor availability calendar
- [ ] In-app chat during consultations
- [ ] Push notifications for upcoming appointments
- [ ] Prescription generation and download

## License

All rights reserved. This project and its source code are the property of the author. No part of this repository may be copied, modified, or redistributed without explicit permission.

© 2026 Safwen. All rights reserved.