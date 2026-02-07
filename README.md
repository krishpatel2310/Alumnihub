# AlumniHub

A full-stack web application connecting alumni, students, and administrators for events, donations, and networking.

## 📁 Project Structure

```
alumnihub/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   └── config/         # Database and configuration files
│   │       └── db.js
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── package.json
│   └── readme.md
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── common/     # Shared components
│   │   │   ├── Admin/      # Admin-specific components
│   │   │   └── Donate/     # Donation components
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── events.jsx
│   │   │   ├── login.jsx
│   │   │   ├── register.jsx
│   │   │   ├── Donate.jsx
│   │   │   ├── AlumniDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── context/        # React Context (Auth, etc.)
│   │   ├── services/       # API service layer
│   │   ├── layout/         # Layout components
│   │   ├── styles/         # CSS files
│   │   └── assets/         # Images, fonts, etc.
│   ├── public/             # Static assets
│   ├── index.html          # Entry HTML
│   ├── package.json
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── eslint.config.js    # ESLint configuration
│
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
# Example:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/alumnihub
# JWT_SECRET=your_secret_key

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Query** - Server state management
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service

## 📋 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🔑 Key Features

- **User Authentication** - Login/Register for Students, Alumni, and Admins
- **Event Management** - Create, view, and RSVP to events
- **Donation System** - Alumni can donate, admins can track donations
- **Dashboards** - Role-based dashboards for different user types
- **Responsive Design** - Mobile-friendly interface

## 👥 User Roles

1. **Student** - Can view events, RSVP, and view donation campaigns
2. **Alumni** - Can create events, donate, and access alumni resources
3. **Admin** - Can approve events, manage donations, and oversee users

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes.

## 📧 Contact

For questions or suggestions, please reach out to the development team.

## Verification Test
Commit made by: krishpatel2310 (kp23104161@gmail.com)
Date: Sat Feb  7 15:03:49 IST 2026

---

## 🔐 Repository Verification

**New Repository:** https://github.com/krishpatel2310/Alumnihub
**Author:** krishpatel2310 (kp23104161@gmail.com)
**Verified:** February 07, 2026 at 15:30 IST

This commit verifies Git credentials for the new repository.
