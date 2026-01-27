# Home Payday

Employee earnings tracking application with admin and user interfaces.

## Features

- **Admin Interface:**
  - Manage employees (create, view, update)
  - Add earnings to employee accounts
  - Deduct money from employee accounts
  - Process payments
  - View all transactions

- **User Interface:**
  - View current balance
  - View transaction history
  - See employee profile information

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

### Default Admin Account

- **Email:** admin@payday.com
- **Password:** admin123

**Important:** Change the default admin password in production!

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

### Admin Routes (require admin role)
- `GET /api/admin/employees` - Get all employees
- `POST /api/admin/employees` - Create employee
- `GET /api/admin/employees/:id` - Get employee details
- `PUT /api/admin/employees/:id` - Update employee
- `POST /api/admin/employees/:id/earn` - Add earnings
- `POST /api/admin/employees/:id/deduct` - Deduct money
- `POST /api/admin/employees/:id/payment` - Process payment
- `GET /api/admin/transactions` - Get all transactions

### User Routes (require authentication)
- `GET /api/user/profile` - Get user's employee profile
- `GET /api/user/balance` - Get current balance
- `GET /api/user/transactions` - Get transaction history

## Database Schema

- **users:** User accounts for authentication
- **employees:** Employee profiles linked to users
- **transactions:** All earnings, deductions, and payments

The database automatically updates employee balances when transactions are created using PostgreSQL triggers.

## Development

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:3000`
- Frontend is configured to proxy API requests to the backend

## License

ISC
