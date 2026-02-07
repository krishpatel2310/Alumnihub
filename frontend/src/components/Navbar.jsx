import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ showAuthButtons = true }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">AlumniHub</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/jobs">Jobs</Link></li>
          <li><Link to="/donate ">Donate</Link></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        {showAuthButtons && (
          <div className="nav-buttons">
            <Link to="/login">
              <button className="btn-login">Login</button>
            </Link>
            <Link to="/register">
              <button className="btn-register">Register</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
