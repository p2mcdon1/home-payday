# 927 Payroll

User earnings tracking application with adult and kid interfaces.

## Features

- **Adult Interface:**
  - Manage kids (create, view, update)
  - Add earnings to kid accounts
  - Deduct money from kid accounts
  - Process payments
  - View all transactions

- **Kid Interface:**
  - View current balance
  - View transaction history
  - See kid profile information

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React, React Router
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** PostgreSQL with triggers for automatic balance updates

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up PostgreSQL database:**
   - Create a new database named `home_payday`
   - Update `server/.env` with your database credentials

3. **Configure environment variables:**
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` with your database credentials and JWT secret.

4. **Start the application:**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 3001) and frontend (port 3000).

### Default Adult Account

- **Name:** adult
- **Password:** adult123

**Important:** Change the default adult password in production!

## Project Structure

```
home-payday/
├── server/
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── schema.sql       # Database schema
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   └── utils/       # Utilities
│   └── public/
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Adult Routes (require adult role)
- `GET /api/adult/kids` - Get all kids
- `POST /api/adult/kids` - Create kid
- `GET /api/adult/kids/:id` - Get kid details
- `GET /api/adult/transactions` - Get all transactions

### Kid Routes (require authentication)
- `GET /api/kid/profile` - Get kid's profile
- `GET /api/kid/balance` - Get current balance
- `GET /api/kid/transactions` - Get transaction history

## Database Schema

- **users:** User accounts for authentication and profile information
- **transactions:** All earnings, deductions, and payments

The database automatically updates user balances when transactions are created using PostgreSQL triggers.

## Development

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:3000`
- Frontend is configured to proxy API requests to the backend

## License

ISC
