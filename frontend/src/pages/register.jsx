import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/register.css';

const JOB_TITLES = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'SRE', 'QA Engineer', 'UI/UX Designer', 'Other'
];

const yearsRange = () => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current + 6; y >= 1970; y--) arr.push(y);
  return arr;
};

const Register = () => {
  const [role, setRole] = useState('alumni');
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.role) {
      setRole(location.state.role);
    }
  }, [location]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Alumni specific
  const [graduationYear, setGraduationYear] = useState('');
  const [degreeFile, setDegreeFile] = useState(null);
  const [jobTitle, setJobTitle] = useState(JOB_TITLES[0]);
  const [experienceYears, setExperienceYears] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  // Student specific
  const [expectedGradYear, setExpectedGradYear] = useState('');
  const [cpi, setCpi] = useState('');

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const years = useMemo(() => yearsRange(), []);

  const passChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password && password === confirmPassword
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Valid email is required';
    if (!passChecks.length || !passChecks.upper || !passChecks.lower || !passChecks.number) {
      e.password = 'Password must be at least 8 characters with upper/lowercase and a number';
    }
    if (!passChecks.match) e.confirmPassword = 'Passwords do not match';

    if (role === 'alumni') {
      if (!graduationYear) e.graduationYear = 'Graduation year required';
      if (!jobTitle) e.jobTitle = 'Select a job title';
      if (!experienceYears) e.experienceYears = 'Years of experience required';
      if (!linkedin.trim()) e.linkedin = 'LinkedIn profile is required';
    } else {
      if (!expectedGradYear) e.expectedGradYear = 'Expected graduation year required';
      if (!cpi) e.cpi = 'Current CPI is required';
      if (!linkedin.trim()) e.linkedin = 'LinkedIn profile is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDegreeFile = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, degreeFile: 'Only PDF allowed' }));
        setDegreeFile(null);
      } else if (f.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, degreeFile: 'File too large (max 5MB)' }));
        setDegreeFile(null);
      } else {
        setErrors(prev => ({ ...prev, degreeFile: undefined }));
        setDegreeFile(f);
      }
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setSuccess('');
    if (!validate()) return;

    const payload = new FormData();
    payload.append('role', role);
    payload.append('fullName', fullName);
    payload.append('email', email);
    payload.append('password', password);
    payload.append('displayName', displayName);

    if (role === 'alumni') {
      payload.append('graduationYear', graduationYear);
      if (degreeFile) payload.append('degreeFile', degreeFile);
      payload.append('jobTitle', jobTitle);
      payload.append('experienceYears', experienceYears);
      payload.append('linkedin', linkedin);
      payload.append('github', github);
    } else {
      payload.append('expectedGradYear', expectedGradYear);
      payload.append('cpi', cpi);
      payload.append('linkedin', linkedin);
      payload.append('github', github);
    }

    console.log('Register payload:', {
      role, fullName, email, displayName, graduationYear, degreeFileName: degreeFile?.name, 
      jobTitle, experienceYears, linkedin, github, expectedGradYear, cpi
    });

    setSuccess('Registration submitted successfully! Your account will be activated after verification.');
  };

  return (
    <div className="register-page">
      {/* Left Branding Section */}
      <section className="register-branding">
        <div className="circle-decoration circle-1"></div>
        <div className="circle-decoration circle-2"></div>
        <div className="circle-decoration circle-3"></div>
        
        <div className="branding-content">
          <Link to="/" className="branding-logo">AlumniHub</Link>
          
          <h1 className="branding-title">Connect. Collaborate. Grow.</h1>
          <p className="branding-description">
          Create your account and unlock exclusive features. 
          Connect with alumni, access job opportunities, and build your professional network.
          </p>
          
          <div className="branding-features">
            <div className="feature-badge feature-network">🤝 Network</div>
            <div className="feature-badge feature-jobs">💼 Jobs</div>
            <div className="feature-badge feature-events">🎉 Events</div>
          </div>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="register-form-section">
        <div className="register-card">
          {success && <div className="success-msg" role="status">{success}</div>}
          
          <header className="register-header">
            <h2 className="register-title-form">Create Account</h2>
            <p className="register-subtitle">
              Fill in your details to get started
            </p>
          </header>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            {/* Basic Info */}
            <div className="field-row two">
              <div className="input-group">
                <label htmlFor="fullName" className="input-label">Full name *</label>
                <input
                  type="text"
                  id="fullName"
                  className={`input-control ${errors.fullName ? 'input-error' : ''}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
                {errors.fullName && <div className="input-error">{errors.fullName}</div>}
              </div>

              <div className="input-group">
                <label htmlFor="email" className="input-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  className={`input-control ${errors.email ? 'input-error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
                {errors.email && <div className="input-error">{errors.email}</div>}
              </div>
            </div>

            {/* Password Fields */}
            <div className="field-row two">
              <div className="input-group">
                <label htmlFor="password" className="input-label">Password *</label>
                <input
                  type="password"
                  id="password"
                  className={`input-control ${errors.password ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                />
                {errors.password && <div className="input-error">{errors.password}</div>}
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword" className="input-label">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`input-control ${errors.confirmPassword ? 'input-error' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  required
                />
                {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
              </div>
            </div>

            {/* Role Selection */}
            <div className="field-row two">
              <div className="input-group">
                <label htmlFor="role" className="input-label">Select Role *</label>
                <select
                  id="role"
                  className="input-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="alumni">Alumni</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="displayName" className="input-label">Preferred Display Name (optional)</label>
                <input
                  id="displayName"
                  type="text"
                  className="input-control"
                  placeholder="e.g., Rahul S."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            {/* Conditional Fields based on Role */}
            {role === 'alumni' ? (
              <>
                <div className="field-row two">
                  <div className="input-group">
                    <label htmlFor="graduationYear" className="input-label">Graduation Year *</label>
                    <select
                      id="graduationYear"
                      className={`input-control ${errors.graduationYear ? 'input-error' : ''}`}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                    >
                      <option value="">Select year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.graduationYear && <div className="input-error">{errors.graduationYear}</div>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="jobTitle" className="input-label">Job Title *</label>
                    <select
                      id="jobTitle"
                      className={`input-control ${errors.jobTitle ? 'input-error' : ''}`}
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    >
                      {JOB_TITLES.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                    {errors.jobTitle && <div className="input-error">{errors.jobTitle}</div>}
                  </div>
                </div>

                <div className="field-row two">
                  <div className="input-group">
                    <label htmlFor="experienceYears" className="input-label">Years of Experience *</label>
                    <input
                      type="number"
                      id="experienceYears"
                      className={`input-control ${errors.experienceYears ? 'input-error' : ''}`}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g., 3"
                      min="0"
                      max="60"
                    />
                    {errors.experienceYears && <div className="input-error">{errors.experienceYears}</div>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="degreeFile" className="input-label">Degree Certificate (PDF)</label>
                    <div className="file-input">
                      <input
                        type="file"
                        id="degreeFile"
                        className="input-control"
                        accept="application/pdf"
                        onChange={handleDegreeFile}
                      />
                    </div>
                    {errors.degreeFile && <div className="input-error">{errors.degreeFile}</div>}
                  </div>
                </div>

                <div className="field-row two">
                  <div className="input-group">
                    <label htmlFor="linkedin" className="input-label">LinkedIn Profile *</label>
                    <input
                      type="url"
                      id="linkedin"
                      className={`input-control ${errors.linkedin ? 'input-error' : ''}`}
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    {errors.linkedin && <div className="input-error">{errors.linkedin}</div>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="github" className="input-label">GitHub Profile (optional)</label>
                    <input
                      type="url"
                      id="github"
                      className="input-control"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="field-row two">
                  <div className="input-group">
                    <label htmlFor="expectedGradYear" className="input-label">Expected Graduation Year *</label>
                    <select
                      id="expectedGradYear"
                      className={`input-control ${errors.expectedGradYear ? 'input-error' : ''}`}
                      value={expectedGradYear}
                      onChange={(e) => setExpectedGradYear(e.target.value)}
                    >
                      <option value="">Select year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.expectedGradYear && <div className="input-error">{errors.expectedGradYear}</div>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="cpi" className="input-label">Current CPI / CGPA *</label>
                    <input
                      type="number"
                      id="cpi"
                      className={`input-control ${errors.cpi ? 'input-error' : ''}`}
                      value={cpi}
                      onChange={(e) => setCpi(e.target.value)}
                      placeholder="e.g., 8.5"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                    {errors.cpi && <div className="input-error">{errors.cpi}</div>}
                  </div>
                </div>

                <div className="field-row two">
                  <div className="input-group">
                    <label htmlFor="linkedin-student" className="input-label">LinkedIn Profile *</label>
                    <input
                      type="url"
                      id="linkedin-student"
                      className={`input-control ${errors.linkedin ? 'input-error' : ''}`}
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    {errors.linkedin && <div className="input-error">{errors.linkedin}</div>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="github-student" className="input-label">GitHub Profile (optional)</label>
                    <input
                      type="url"
                      id="github-student"
                      className="input-control"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-register-submit">
              Create Account
            </button>

            {/* Login Link */}
            <div className="link-row">
              <span className="muted">Already have an account? </span>
              <Link to="/login">Login here</Link>
            </div>

            {/* Terms Note */}
            <div className="small-note" style={{ textAlign: 'center', marginTop: '1rem' }}>
              By registering you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Register;