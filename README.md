# CrixChange

CrixChange is a full-stack web application for fantasy trading based on IPL cricket matches. Users can register, verify their email, login, trade team stocks, view analytics, and manage their portfolio.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Frontend Usage](#frontend-usage)
- [Backend Usage](#backend-usage)
- [Dependencies](#dependencies)
- [License](#license)

---

## Features

- User registration, login, logout, password reset
- Email verification (with styled email template)
- JWT authentication with token blacklisting
- Trading dashboard for IPL teams
- Real-time price charts and order book simulation
- Portfolio and analytics pages
- Leaderboard
- Dark/light theme toggle
- Responsive design

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS, Framer Motion, Chart.js, Lucide Icons
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, Refresh Tokens, Token Blacklisting
- **Email:** Nodemailer (custom HTML templates)
- **Other:** dotenv, bcryptjs, crypto, react-hot-toast

---

## Project Structure

```
project/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   └── public/
├── README.md
```

---





## API Endpoints

### Auth

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout (blacklists token)
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password
- `POST /api/auth/forgot-password` — Forgot password
- `PUT /api/auth/reset-password/:token` — Reset password
- `GET /api/auth/verify-email/:token` — Verify email
- `POST /api/auth/resend-verification` — Resend verification email
- `POST /api/auth/refresh-token` — Refresh JWT

### Trading

- `GET /api/teams` — Get IPL teams
- `GET /api/matches/:id` — Get match data
- `POST /api/orders` — Place order

---

## Frontend Usage

- Register and verify your email.
- Login to access dashboard, trading, portfolio, analytics, leaderboard.
- Trade IPL team stocks, view charts, and manage your portfolio.
- Toggle dark/light theme.
- Responsive for desktop and mobile.

---

## Backend Usage

- RESTful API with JWT authentication.
- Token blacklisting for secure logout.
- Email verification and password reset flows.
- MongoDB models for users, wallets, blacklisted tokens, etc.

---

## Dependencies

### Backend

- express
- mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- nodemailer
- crypto
- cors
- morgan

### Frontend

- react
- react-dom
- react-router-dom
- redux, @reduxjs/toolkit, react-redux
- tailwindcss
- framer-motion
- chart.js, react-chartjs-2
- lucide-react
- react-hot-toast
- axios

---

#

## Author

pidadh dinesh


