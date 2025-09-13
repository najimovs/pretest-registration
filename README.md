# IELTS Registration System

A complete IELTS registration and management system with separate applications for users and administrators.

## Project Structure

```
registration/
├── backend/                    # Express.js API Server
│   ├── config/                # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── server.js             # Main server file
│
├── user-panel/                # User Interface
│   ├── assets/               # Images, fonts, etc.
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript files
│   ├── pages/                # HTML pages
│   ├── package.json
│   ├── vite.config.js
│   └── index.html            # Main entry point
│
├── admin-panel/               # Admin Interface
│   ├── src/
│   │   ├── css/              # Admin stylesheets
│   │   ├── js/               # Admin JavaScript
│   │   └── pages/            # Admin HTML pages
│   ├── assets/               # Admin assets
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html            # Redirect to src/pages/index.html
│   └── login.html            # Redirect to src/pages/login.html
│
├── package.json               # Root package.json with scripts
└── .gitignore
```

## Applications

### 1. Backend API
- **Technology**: Node.js, Express.js, MongoDB
- **Port**: 8000
- **Features**:
  - User registration and authentication
  - Test scheduling
  - Admin endpoints
  - CORS enabled for frontend connections

### 2. User Panel
- **Technology**: HTML, CSS, JavaScript, Vite
- **Port**: 5173 (dev server)
- **Features**:
  - User registration and login
  - Test scheduling
  - Profile management
  - Responsive design

### 3. Admin Panel
- **Technology**: HTML, CSS, JavaScript, Vite
- **Port**: 5174 (dev server)
- **Features**:
  - View all registrations
  - Export data to Excel/Word
  - Admin dashboard
  - Clean organized structure

## Getting Started

### Install Dependencies
```bash
npm run install-all
```

### Start Development Servers

#### Start all applications:
```bash
npm start
```

#### Or start individually:
```bash
# Backend API
npm run backend

# User Panel
npm run user-panel

# Admin Panel
npm run admin
```

### Environment Variables

Create `.env` file in the `backend/` directory:
```
MONGODB_URI=mongodb://localhost:27017/ielts_registration
JWT_SECRET=your_secret_key
PORT=3000
```

## API Endpoints

### User Routes
- `POST /api/registrations/register` - User registration
- `POST /api/registrations/login` - User login
- `GET /api/registrations/profile/:id` - Get user profile
- `PUT /api/registrations/profile/:id` - Update profile

### Admin Routes
- `GET /api/registrations/all` - Get all registrations
- `POST /api/registrations/admin/login` - Admin login

## Development

- Backend runs on `http://localhost:8000`
- User Panel runs on `http://localhost:3000`
- Admin Panel runs on `http://localhost:3002`

The applications are configured to work together with proper CORS settings and API endpoints.