import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import "../styles/AlumniDashboard.css";

const AlumniDashboard = () => {
  const userName = localStorage.getItem('userName') || 'Guest';
  const userRole = localStorage.getItem('userRole') || 'Alumni';
  const userDepartment = localStorage.getItem('userDepartment') || 'Computer Science';
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const metricsRef = useRef(null);
  const contentRef = useRef(null);
  const insightsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const metricsInView = useInView(metricsRef, { once: true, margin: '-50px' });
  const contentInView = useInView(contentRef, { once: true, margin: '-50px' });
  const insightsInView = useInView(insightsRef, { once: true, margin: '-50px' });
  
  useEffect(() => {
    console.log('AlumniDashboard loaded');
  }, []);

  // Mock data for metrics - Events is primary
  const metrics = [
    { label: 'Events', value: 12, icon: '📅', subtext: '+3 this week', isPrimary: true, trend: 'up' },
    { label: 'Jobs', value: 34, icon: '💼', subtext: '12 active', isPrimary: false, trend: 'neutral' },
    { label: 'Messages', value: 7, icon: '✉️', subtext: '2 unread', isPrimary: false, trend: 'up' },
    { label: 'Connections', value: 89, icon: '👥', subtext: '+5 this month', isPrimary: false, trend: 'up' },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Annual Alumni Meet 2024', date: 'Mar 15, 2024', location: 'Main Campus', attendees: 120 },
    { id: 2, title: 'Tech Innovation Summit', date: 'Mar 22, 2024', location: 'Tech Building', attendees: 85 },
    { id: 3, title: 'Networking Mixer', date: 'Mar 28, 2024', location: 'Alumni Center', attendees: 45 },
  ];

  // Mock data for recent job posts
  const recentJobs = [
    { id: 1, title: 'Senior Software Engineer', company: 'Tech Corp', posted: '2 days ago', applicants: 24 },
    { id: 2, title: 'Product Manager', company: 'Innovate Inc', posted: '5 days ago', applicants: 18 },
    { id: 3, title: 'Data Scientist', company: 'Data Labs', posted: '1 week ago', applicants: 32 },
  ];

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, type: 'event', text: 'Registered for Annual Alumni Meet', time: '2 hours ago', icon: '📅' },
    { id: 2, type: 'job', text: 'Posted new job: Senior Software Engineer', time: '2 days ago', icon: '💼' },
    { id: 3, type: 'message', text: 'Received message from John Doe', time: '3 days ago', icon: '✉️' },
    { id: 4, type: 'connection', text: 'Connected with Jane Smith', time: '5 days ago', icon: '👥' },
  ];

  // Mock data for notifications
  const notifications = [
    { id: 1, text: 'New event registration deadline approaching', time: '1 hour ago', unread: true },
    { id: 2, text: 'Your job post received 5 new applications', time: '3 hours ago', unread: true },
    { id: 3, text: 'New message from alumni network', time: '1 day ago', unread: false },
  ];

  // Mock data for engagement chart
  const engagementData = [
    { label: 'Events', value: 35, color: 'var(--dusk-blue)' },
    { label: 'Jobs', value: 25, color: 'var(--dusty-denim)' },
    { label: 'Messages', value: 20, color: 'var(--prussian-blue)' },
    { label: 'Network', value: 20, color: 'var(--alabaster-grey)' },
  ];

  // Find dominant segment
  const dominantSegment = engagementData.reduce((max, item) => 
    item.value > max.value ? item : max
  );

  // Mock data for weekly activity (bar chart data)
  const weeklyActivity = [
    { day: 'Mon', value: 12 },
    { day: 'Tue', value: 19 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 22 },
    { day: 'Fri', value: 18 },
    { day: 'Sat', value: 8 },
    { day: 'Sun', value: 5 },
  ];

  // Get user initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="alumni-dashboard">
      <Navbar showAuthButtons={false} />
      
      {/* Dashboard Hero Section */}
      <motion.section 
        ref={heroRef}
        className="dashboard-hero"
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="hero-content-wrapper">
          <motion.div className="hero-left" variants={heroVariants}>
            <h1 className="hero-title">Welcome back, {userName}</h1>
            <p className="hero-subtitle">{userRole} • {userDepartment}</p>
            <motion.div className="hero-cta-wrapper" variants={ctaVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/events" className="hero-cta-primary">
                  Explore Events
                  <motion.span 
                    className="cta-arrow"
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div className="hero-avatar" variants={heroVariants}>
            <div className="avatar-circle">
              {getInitials(userName)}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Key Metrics Section */}
      <motion.section 
        ref={metricsRef}
        className="metrics-section"
        initial="hidden"
        animate={metricsInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <motion.div 
              className={`metric-card ${metric.isPrimary ? 'metric-primary' : ''}`}
              key={metric.label}
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
            >
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-content">
                <div className="metric-value-wrapper">
                  <div className="metric-value">{metric.value}</div>
                  {metric.trend === 'up' && <span className="metric-trend">↗</span>}
                </div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-subtext">{metric.subtext}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <motion.section 
        ref={contentRef}
        className="main-content-section"
        initial="hidden"
        animate={contentInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="content-container">
          {/* Left Column (70%) */}
          <div className="content-left">
            {/* Upcoming Events */}
            <motion.div 
              className="content-card events-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon events-icon">📅</div>
                  <h3 className="card-title">Upcoming Events</h3>
                </div>
                <Link to="/events" className="card-link-button">
                  View all
                  <span className="link-arrow">→</span>
                </Link>
              </div>
              <div className="card-content">
                {upcomingEvents.map((event, index) => (
                  <motion.div 
                    className="event-item" 
                    key={event.id}
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                  >
                    <div className="event-icon">📅</div>
                    <div className="event-details">
                      <h4 className="event-title">{event.title}</h4>
                      <div className="event-meta">
                        <span className="event-date">{event.date}</span>
                        <span className="event-separator">•</span>
                        <span className="event-location">{event.location}</span>
                        <span className="event-separator">•</span>
                        <span className="event-attendees">{event.attendees} attending</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Job Posts */}
            <motion.div 
              className="content-card jobs-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon jobs-icon">💼</div>
                  <h3 className="card-title">Recent Job Posts</h3>
                </div>
                <Link to="/jobs" className="card-link-button">
                  View all
                  <span className="link-arrow">→</span>
                </Link>
              </div>
              <div className="card-content">
                {recentJobs.map((job, index) => (
                  <motion.div 
                    className="job-item" 
                    key={job.id}
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                  >
                    <div className="job-icon">💼</div>
                    <div className="job-details">
                      <h4 className="job-title">{job.title}</h4>
                      <div className="job-meta">
                        <span className="job-company">{job.company}</span>
                        <span className="job-separator">•</span>
                        <span className="job-posted">{job.posted}</span>
                        <span className="job-separator">•</span>
                        <span className="job-applicants">{job.applicants} applicants</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column (30%) */}
          <div className="content-right">
            {/* Recent Activity */}
            <motion.div 
              className="content-card activity-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon activity-icon">⚡</div>
                  <h3 className="card-title">Recent Activity</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="activity-timeline">
                  {recentActivity.map((activity, index) => {
                    const opacity = 1 - (index * 0.12);
                    return (
                    <motion.div 
                      className={`activity-item ${index < recentActivity.length - 1 ? 'has-connector' : ''}`}
                      key={activity.id}
                      variants={itemVariants}
                      style={{ opacity }}
                      whileHover={{ 
                        opacity: Math.min(opacity + 0.15, 1),
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="activity-icon-wrapper">
                        <div className="activity-icon">{activity.icon}</div>
                        {index < recentActivity.length - 1 && (
                          <div className="activity-connector"></div>
                        )}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.text}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div 
              className="content-card notifications-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon notifications-icon">🔔</div>
                  <h3 className="card-title">Notifications</h3>
                </div>
                <span className="notification-badge">{notifications.filter(n => n.unread).length}</span>
              </div>
              <div className="card-content">
                {notifications.map((notification) => (
                  <motion.div 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`} 
                    key={notification.id}
                    variants={itemVariants}
                    whileHover={{ x: 2 }}
                  >
                    <p className="notification-text">{notification.text}</p>
                    <span className="notification-time">{notification.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Insights Section */}
      <motion.section 
        ref={insightsRef}
        className="insights-section"
        initial="hidden"
        animate={insightsInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="insights-container">
          <motion.h3 className="insights-title" variants={itemVariants}>
            Engagement Insights
          </motion.h3>
          
          <div className="charts-grid">
            {/* Engagement Donut Chart */}
            <motion.div 
              className="chart-card"
              variants={itemVariants}
            >
              <h4 className="chart-title">Engagement Distribution</h4>
              <div className="donut-chart-container">
                <svg className="donut-chart" viewBox="0 0 200 200">
                  <circle
                    className="donut-ring"
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="var(--prussian-blue)"
                    strokeWidth="20"
                  />
                  <motion.circle
                    className={`donut-segment ${engagementData[0].label === dominantSegment.label ? 'donut-dominant' : 'donut-dimmed'}`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[0].color}
                    strokeWidth="20"
                    strokeDasharray={`${35 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                  <motion.circle
                    className={`donut-segment ${engagementData[1].label === dominantSegment.label ? 'donut-dominant' : 'donut-dimmed'}`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[1].color}
                    strokeWidth="20"
                    strokeDasharray={`${25 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset={`-${35 * 5.026}`}
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                  <motion.circle
                    className={`donut-segment ${engagementData[2].label === dominantSegment.label ? 'donut-dominant' : 'donut-dimmed'}`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[2].color}
                    strokeWidth="20"
                    strokeDasharray={`${20 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset={`-${60 * 5.026}`}
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                  <motion.circle
                    className={`donut-segment ${engagementData[3].label === dominantSegment.label ? 'donut-dominant' : 'donut-dimmed'}`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[3].color}
                    strokeWidth="20"
                    strokeDasharray={`${20 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset={`-${80 * 5.026}`}
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  <text x="100" y="100" textAnchor="middle" className="donut-text">
                    <tspan x="100" dy="-5" className="donut-value">{dominantSegment.value}%</tspan>
                    <tspan x="100" dy="20" className="donut-label">{dominantSegment.label}</tspan>
                  </text>
                </svg>
                <div className="donut-legend">
                  {engagementData.map((item, index) => (
                    <div 
                      className={`legend-item ${item.label === dominantSegment.label ? 'legend-dominant' : ''}`}
                      key={item.label}
                    >
                      <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                      <span className="legend-label">{item.label}: {item.value}%</span>
                    </div>
                  ))}
                </div>
                <p className="chart-caption">
                  Your engagement is strongest in <strong>{dominantSegment.label.toLowerCase()}</strong>, 
                  representing {dominantSegment.value}% of your total activity.
                </p>
              </div>
            </motion.div>

            {/* Weekly Activity Bar Chart */}
            <motion.div 
              className="chart-card"
              variants={itemVariants}
            >
              <h4 className="chart-title">Weekly Activity</h4>
              <div className="bar-chart-container">
                <div className="bar-chart">
                  {weeklyActivity.map((day, index) => {
                    const maxValue = Math.max(...weeklyActivity.map(d => d.value));
                    const height = (day.value / maxValue) * 100;
                    const isPeak = day.value === maxValue;
                    return (
                      <motion.div 
                        className={`bar-group ${isPeak ? 'bar-peak' : ''}`}
                        key={day.day}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={insightsInView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.1 * index,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        <div className="bar-wrapper">
                          <div
                            className={`bar ${isPeak ? 'bar-peak-bar' : ''}`}
                            style={{
                              height: `${height}%`,
                              backgroundColor: isPeak ? 'var(--dusk-blue)' : 'var(--dusty-denim)',
                              opacity: isPeak ? 1 : 0.75,
                            }}
                          >
                            <span className="bar-value">{day.value}</span>
                          </div>
                        </div>
                        <span className={`bar-label ${isPeak ? 'bar-label-peak' : ''}`}>{day.day}</span>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="chart-caption">
                  Peak activity on <strong>Thursday</strong> with {Math.max(...weeklyActivity.map(d => d.value))} interactions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AlumniDashboard;