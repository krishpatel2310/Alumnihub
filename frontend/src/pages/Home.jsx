import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">AlumniHub</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/donate">Donate</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
          <div className="nav-buttons">
            <Link to="/login">
              <button className="btn-login">Login</button>
            </Link>
            <Link to="/register">
              <button className="btn-register">Register</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Connecting Alumni. Empowering Students.</h1>
          <p className="hero-subtitle">
            Join a thriving network where alumni and students connect, share opportunities, 
            attend exclusive events, and build meaningful relationships that last a lifetime.
          </p>
          <div className="hero-buttons">
            <button className="btn-cta btn-alumni">Join as Alumni</button>
            <button className="btn-cta btn-student">Join as Student</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose AlumniHub?</h2>
          <p className="section-subtitle">Everything you need to stay connected and grow professionally</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Alumni Networking</h3>
              <p>Connect with thousands of alumni across industries, share experiences, and build your professional network.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Job & Internship Opportunities</h3>
              <p>Access exclusive job postings and internship opportunities shared by alumni and partner companies.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎉</div>
              <h3>Events & Reunions</h3>
              <p>Never miss a reunion, workshop, or networking event. Stay updated with our event calendar.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💝</div>
              <h3>Donations & Support</h3>
              <p>Give back to your alma mater and support scholarships, infrastructure, and student initiatives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p>Create your account as an alumni or student with your college credentials.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Verified</h3>
              <p>Our admin team verifies your profile to ensure authenticity and security.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Connect & Participate</h3>
              <p>Start networking, apply for jobs, attend events, and give back to the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Total Alumni</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">3,500+</div>
              <div className="stat-label">Active Students</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">850+</div>
              <div className="stat-label">Jobs Posted</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">120+</div>
              <div className="stat-label">Events Conducted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Community Says</h2>
          <p className="section-subtitle">Real stories from alumni and students</p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "AlumniHub helped me connect with alumni working at top tech companies. 
                I landed my dream internship through a referral from this platform!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">R</div>
                <div>
                  <div className="author-name">Rahul Sharma</div>
                  <div className="author-role">Final Year Student, CSE</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "Reconnecting with my batchmates and juniors has been incredible. 
                This platform makes it so easy to give back and mentor the next generation."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">P</div>
                <div>
                  <div className="author-name">Priya Patel</div>
                  <div className="author-role">Alumni, Software Engineer at Google</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "The events organized through AlumniHub are fantastic. I attended a reunion 
                after 10 years and it felt like we never left campus!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div>
                  <div className="author-name">Arjun Mehta</div>
                  <div className="author-role">Alumni, Product Manager</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Join Our Growing Community?</h2>
          <p>Be part of a network that opens doors, creates opportunities, and builds lasting connections.</p>
          <button className="btn-cta-large">Get Started Today</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>AlumniHub</h3>
              <p>
                Connecting generations of students and alumni to build a stronger, 
                more collaborative community.
              </p>
              <p className="college-info">
                <strong>XYZ College of Engineering</strong><br />
                123 College Road, City - 123456<br />
                contact@alumnihub.edu
              </p>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#events">Events</a></li>
                <li><a href="#jobs">Jobs</a></li>
                <li><a href="#donate">Donate</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>For Alumni</h4>
              <ul>
                <li><a href="#register">Register</a></li>
                <li><a href="#profile">My Profile</a></li>
                <li><a href="#network">Network</a></li>
                <li><a href="#mentor">Become a Mentor</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>For Students</h4>
              <ul>
                <li><a href="#register">Sign Up</a></li>
                <li><a href="#jobs">Browse Jobs</a></li>
                <li><a href="#events">Upcoming Events</a></li>
                <li><a href="#mentorship">Find a Mentor</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="social-icons">
              <a href="#facebook" className="social-icon">📘</a>
              <a href="#twitter" className="social-icon">🐦</a>
              <a href="#linkedin" className="social-icon">💼</a>
              <a href="#instagram" className="social-icon">📷</a>
            </div>
            <p className="copyright">
              © 2025 AlumniHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
