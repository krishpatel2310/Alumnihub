import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Users, Briefcase, Calendar } from 'lucide-react';
import { authService } from '@/services/ApiServices';
import '../../styles/register.css';

const JOB_TITLES = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 
  'SRE', 'QA Engineer', 'UI/UX Designer', 'Other'
];

const yearsRange = () => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current + 6; y >= 1970; y--) arr.push(y);
  return arr;
};

interface LocationState {
  role?: 'alumni' | 'student';
}

export const Register = () => {
  const [role, setRole] = useState<'alumni' | 'student'>('alumni');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location?.state as LocationState;
    if (state?.role) {
      setRole(state.role);
    }
  }, [location]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Alumni specific
  const [graduationYear, setGraduationYear] = useState('');
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState(JOB_TITLES[0]);
  const [experienceYears, setExperienceYears] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  // Student specific
  const [expectedGradYear, setExpectedGradYear] = useState('');
  const [cpi, setCpi] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const years = useMemo(() => yearsRange(), []);

  const passChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password && password === confirmPassword
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Valid email is required';
    if (!passChecks.length || !passChecks.upper || !passChecks.lower || !passChecks.number) {
      e.password = 'Password must be at least 8 characters with upper/lowercase and a number';
    }
    if (!passChecks.match) e.confirmPassword = 'Passwords do not match';

    if (role === 'alumni') {
      if (!graduationYear) e.graduationYear = 'Graduation year required';
      if (!degreeFile) e.degreeFile = 'Degree certificate PDF is required';
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

  const handleDegreeFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files && ev.target.files[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, degreeFile: 'Only PDF allowed' }));
        setDegreeFile(null);
      } else if (f.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, degreeFile: 'File too large (max 5MB)' }));
        setDegreeFile(null);
      } else {
        setErrors(prev => ({ ...prev, degreeFile: '' }));
        setDegreeFile(f);
      }
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSuccess('');
    if (!validate()) return;

    setIsSubmitting(true);

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

    try {
      await authService.register(payload);
      
      setSuccess('Registration submitted successfully! Your account will be activated after verification.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please try again.';
      setErrors({ submit: apiMessage });
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="feature-badge feature-network">
              <Users className="w-4 h-4" /> Network
            </div>
            <div className="feature-badge feature-jobs">
              <Briefcase className="w-4 h-4" /> Jobs
            </div>
            <div className="feature-badge feature-events">
              <Calendar className="w-4 h-4" /> Events
            </div>
          </div>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="register-form-section">
        <Card className="register-card border-0 shadow-lg">
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          {errors.submit && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
            </Alert>
          )}
          
          <CardHeader className="register-header">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="register-form space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role *</Label>
                  <Select value={role} onValueChange={(value: 'alumni' | 'student') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Preferred Display Name (optional)</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="e.g., Rahul S."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>

              {/* Conditional Fields based on Role */}
              {role === 'alumni' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year *</Label>
                      <Select value={graduationYear} onValueChange={setGraduationYear}>
                        <SelectTrigger className={errors.graduationYear ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.graduationYear && <p className="text-sm text-red-500">{errors.graduationYear}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Select value={jobTitle} onValueChange={setJobTitle}>
                        <SelectTrigger className={errors.jobTitle ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TITLES.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Years of Experience *</Label>
                      <Input
                        type="number"
                        id="experienceYears"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g., 3"
                        min="0"
                        max="60"
                        className={errors.experienceYears ? 'border-red-500' : ''}
                      />
                      {errors.experienceYears && <p className="text-sm text-red-500">{errors.experienceYears}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="degreeFile">Degree Certificate (PDF)</Label>
                      <Input
                        type="file"
                        id="degreeFile"
                        accept="application/pdf"
                        onChange={handleDegreeFile}
                        className={errors.degreeFile ? 'border-red-500' : ''}
                      />
                      {errors.degreeFile && <p className="text-sm text-red-500">{errors.degreeFile}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile *</Label>
                      <Input
                        type="url"
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className={errors.linkedin ? 'border-red-500' : ''}
                      />
                      {errors.linkedin && <p className="text-sm text-red-500">{errors.linkedin}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub Profile (optional)</Label>
                      <Input
                        type="url"
                        id="github"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedGradYear">Expected Graduation Year *</Label>
                      <Select value={expectedGradYear} onValueChange={setExpectedGradYear}>
                        <SelectTrigger className={errors.expectedGradYear ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.expectedGradYear && <p className="text-sm text-red-500">{errors.expectedGradYear}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpi">Current CPI / CGPA *</Label>
                      <Input
                        type="number"
                        id="cpi"
                        value={cpi}
                        onChange={(e) => setCpi(e.target.value)}
                        placeholder="e.g., 8.5"
                        min="0"
                        max="10"
                        step="0.1"
                        className={errors.cpi ? 'border-red-500' : ''}
                      />
                      {errors.cpi && <p className="text-sm text-red-500">{errors.cpi}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin-student">LinkedIn Profile *</Label>
                      <Input
                        type="url"
                        id="linkedin-student"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className={errors.linkedin ? 'border-red-500' : ''}
                      />
                      {errors.linkedin && <p className="text-sm text-red-500">{errors.linkedin}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github-student">GitHub Profile (optional)</Label>
                      <Input
                        type="url"
                        id="github-student"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </div>

              {/* Terms Note */}
              <p className="text-xs text-center text-muted-foreground">
                By registering you agree to our{' '}
                <a href="#terms" className="underline hover:text-primary">Terms of Service</a>
                {' '}and{' '}
                <a href="#privacy" className="underline hover:text-primary">Privacy Policy</a>.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
