import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'email') {
      if (!value) {
        error = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Please enter a valid email address';
      }
    }
    
    if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    setTouched({ email: true, password: true });
    
    if (!emailError && !passwordError) {
      // Handle login logic here
      console.log('Login attempt:', formData);
      // TODO: Connect to backend API
    }
  };

  const isFormValid = formData.email && formData.password && !errors.email && !errors.password;

  return (
    <div className="login-page">
      {/* Left Section - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <Link to="/" className="branding-logo">AlumniHub</Link>
          <h1 className="branding-title">Connect. Collaborate. Grow.</h1>
          <p className="branding-description">
            Join thousands of alumni and students connecting through our platform. 
            Access exclusive job opportunities, attend events, and build meaningful 
            relationships that shape your future.
          </p>
          <div className="branding-features">
            <div className="feature-badge">🤝 Network</div>
            <div className="feature-badge">💼 Jobs</div>
            <div className="feature-badge">🎉 Events</div>
          </div>
        </div>
        {/* Decorative Background Elements */}
        <div className="circle-decoration circle-1"></div>
        <div className="circle-decoration circle-2"></div>
        <div className="circle-decoration circle-3"></div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-form-section">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Welcome Back 👋</h1>
            <p className="login-subtitle">Login to continue to AlumniHub</p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {touched.email && errors.email && (
                <span id="email-error" className="error-message" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${touched.password && errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {touched.password && errors.password && (
                <span id="password-error" className="error-message" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={!isFormValid}
            >
              Login
            </button>

            {/* Divider */}
            <div className="divider">
              <span className="divider-text">OR</span>
            </div>

            {/* Social Login Buttons (UI Only) */}
            <div className="social-login">
              <button type="button" className="btn-social btn-google">
                <span className="social-icon">🔍</span>
                Continue with Google
              </button>
              <button type="button" className="btn-social btn-linkedin">
                <span className="social-icon">💼</span>
                Continue with LinkedIn
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
