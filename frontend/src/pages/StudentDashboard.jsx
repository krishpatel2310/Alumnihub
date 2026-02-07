import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import "../styles/AlumniDashboard.css";

const StudentDashboard = () => {
  const userName = localStorage.getItem('userName') || 'Guest';
  const userDepartment = localStorage.getItem('userDepartment') || 'Computer Science';

  // Refs for scroll animations (reuse same motion pattern as AlumniDashboard)
  const heroRef = useRef(null);
  const metricsRef = useRef(null);
  const contentRef = useRef(null);
  const insightsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const metricsInView = useInView(metricsRef, { once: true, margin: '-50px' });
  const contentInView = useInView(contentRef, { once: true, margin: '-50px' });
  const insightsInView = useInView(insightsRef, { once: true, margin: '-50px' });

  useEffect(() => {
    console.log('StudentDashboard loaded');
  }, []);

  // Student-focused key metrics (same card style & behavior as AlumniDashboard)
  const metrics = [
    { label: 'Jobs Available', value: 42, icon: '💼', subtext: 'Matching your profile', isPrimary: true, trend: 'up' },
    { label: 'Alumni Connections', value: 18, icon: '👥', subtext: 'Suggested mentors', isPrimary: false, trend: 'up' },
    { label: 'Events Registered', value: 3, icon: '📅', subtext: 'This month', isPrimary: false, trend: 'neutral' },
    { label: 'Mentorship Requests', value: 2, icon: '🎓', subtext: 'Awaiting response', isPrimary: false, trend: 'up' },
  ];

  // Recommended jobs & internships (left column)
  const recommendedOpportunities = [
    { id: 1, title: 'Software Engineering Intern', company: 'Tech Corp', type: 'Internship', match: 'High match', posted: '2 days ago' },
    { id: 2, title: 'Junior Frontend Developer', company: 'Innovate Inc', type: 'Job', match: 'Recommended', posted: '4 days ago' },
    { id: 3, title: 'Data Analyst Intern', company: 'Data Labs', type: 'Internship', match: 'Good match', posted: '1 week ago' },
  ];

  // Upcoming career events (left column)
  const upcomingCareerEvents = [
    { id: 1, title: 'Campus Career Fair', date: 'Mar 12, 2024', location: 'Main Auditorium', focus: 'Multi-industry' },
    { id: 2, title: 'Tech Resume Workshop', date: 'Mar 18, 2024', location: 'Career Center', focus: 'Resume & LinkedIn' },
    { id: 3, title: 'Alumni Networking Night', date: 'Mar 25, 2024', location: 'Alumni Center', focus: 'Networking' },
  ];

  // Student-focused recent activity timeline (right column)
  const recentActivity = [
    { id: 1, type: 'job', text: 'Applied for Software Engineering Intern at Tech Corp', time: '1 hour ago', icon: '💼' },
    { id: 2, type: 'message', text: 'Received message from alumni mentor Priya Sharma', time: '3 hours ago', icon: '✉️' },
    { id: 3, type: 'event', text: 'Registered for Campus Career Fair', time: 'Yesterday', icon: '📅' },
    { id: 4, type: 'mentorship', text: 'Mentorship request approved by Rahul Verma', time: '3 days ago', icon: '🎓' },
  ];

  // Messages & mentorship requests (right column)
  const messagesAndMentorship = [
    { id: 1, text: 'New message from mentor Priya Sharma', time: '30 min ago', unread: true },
    { id: 2, text: 'Your mentorship request to Rahul Verma was approved', time: '2 hours ago', unread: true },
    { id: 3, text: 'Reminder: Mock interview session tomorrow', time: '1 day ago', unread: false },
  ];

  // Engagement / insights data (reuse same chart styling)
  const engagementData = [
    { label: 'Applications', value: 40, color: 'var(--dusk-blue)' },
    { label: 'Events', value: 30, color: 'var(--dusty-denim)' },
    { label: 'Messages', value: 20, color: 'var(--prussian-blue)' },
    { label: 'Mentorship', value: 10, color: 'var(--alabaster-grey)' },
  ];

  const dominantSegment = engagementData.reduce((max, item) =>
    item.value > max.value ? item : max
  );

  const weeklyActivity = [
    { day: 'Mon', value: 6 },
    { day: 'Tue', value: 9 },
    { day: 'Wed', value: 7 },
    { day: 'Thu', value: 11 },
    { day: 'Fri', value: 10 },
    { day: 'Sat', value: 4 },
    { day: 'Sun', value: 3 },
  ];

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Reuse animation variants from AlumniDashboard
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

      {/* HERO SECTION - Same layout & styling as AlumniDashboard */}
      <motion.section
        ref={heroRef}
        className="dashboard-hero"
        initial="hidden"
        animate={heroInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <div className="hero-content-wrapper">
          <motion.div className="hero-left" variants={heroVariants}>
            <h1 className="hero-title">Welcome back, {userName}</h1>
            <p className="hero-subtitle">Student • {userDepartment}</p>
            <motion.div className="hero-cta-wrapper" variants={ctaVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/jobs" className="hero-cta-primary">
                  Explore Opportunities
                  <motion.span
                    className="cta-arrow"
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
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

      {/* STATS CARDS - Same structure & hover as AlumniDashboard */}
      <motion.section
        ref={metricsRef}
        className="metrics-section"
        initial="hidden"
        animate={metricsInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <motion.div
              className={`metric-card ${metric.isPrimary ? 'metric-primary' : ''}`}
              key={metric.label}
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
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

      {/* MAIN CONTENT GRID - Same two-column layout */}
      <motion.section
        ref={contentRef}
        className="main-content-section"
        initial="hidden"
        animate={contentInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <div className="content-container">
          {/* LEFT COLUMN: Recommended Jobs & Internships, Upcoming Career Events */}
          <div className="content-left">
            {/* Recommended Jobs & Internships */}
            <motion.div
              className="content-card jobs-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon jobs-icon">💼</div>
                  <h3 className="card-title">Recommended Jobs & Internships</h3>
                </div>
                <Link to="/jobs" className="card-link-button">
                  View all
                  <span className="link-arrow">→</span>
                </Link>
              </div>
              <div className="card-content">
                {recommendedOpportunities.map((opportunity) => (
                  <motion.div
                    className="job-item"
                    key={opportunity.id}
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                  >
                    <div className="job-icon">💼</div>
                    <div className="job-details">
                      <h4 className="job-title">{opportunity.title}</h4>
                      <div className="job-meta">
                        <span className="job-company">{opportunity.company}</span>
                        <span className="job-separator">•</span>
                        <span className="job-posted">{opportunity.posted}</span>
                        <span className="job-separator">•</span>
                        <span className="job-applicants">{opportunity.type}</span>
                        <span className="job-separator">•</span>
                        <span className="job-applicants">{opportunity.match}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Career Events */}
            <motion.div
              className="content-card events-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon events-icon">📅</div>
                  <h3 className="card-title">Upcoming Career Events</h3>
                </div>
                <Link to="/events" className="card-link-button">
                  View all
                  <span className="link-arrow">→</span>
                </Link>
              </div>
              <div className="card-content">
                {upcomingCareerEvents.map((event) => (
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
                        <span className="event-attendees">{event.focus}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Messages & Mentorship Requests, Recent Activity (timeline) */}
          <div className="content-right">
            {/* Messages & Mentorship Requests (reusing notifications card styles) */}
            <motion.div
              className="content-card notifications-card"
              variants={itemVariants}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-icon notifications-icon">✉️</div>
                  <h3 className="card-title">Messages & Mentorship Requests</h3>
                </div>
                <span className="notification-badge">
                  {messagesAndMentorship.filter((item) => item.unread).length}
                </span>
              </div>
              <div className="card-content">
                {messagesAndMentorship.map((item) => (
                  <motion.div
                    className={`notification-item ${item.unread ? 'unread' : ''}`}
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ x: 2 }}
                  >
                    <p className="notification-text">{item.text}</p>
                    <span className="notification-time">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ACTIVITY TIMELINE - student-focused but same component pattern */}
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
                    const opacity = 1 - index * 0.12;
                    return (
                      <motion.div
                        className={`activity-item ${
                          index < recentActivity.length - 1 ? 'has-connector' : ''
                        }`}
                        key={activity.id}
                        variants={itemVariants}
                        style={{ opacity }}
                        whileHover={{
                          opacity: Math.min(opacity + 0.15, 1),
                          transition: { duration: 0.2 },
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
          </div>
        </div>
      </motion.section>

      {/* INSIGHTS SECTION - same visual language as AlumniDashboard */}
      <motion.section
        ref={insightsRef}
        className="insights-section"
        initial="hidden"
        animate={insightsInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <div className="insights-container">
          <motion.h3 className="insights-title" variants={itemVariants}>
            Progress & Engagement
          </motion.h3>

          <div className="charts-grid">
            {/* Engagement Donut Chart */}
            <motion.div
              className="chart-card"
              variants={itemVariants}
            >
              <h4 className="chart-title">Activity Distribution</h4>
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
                    className={`donut-segment ${
                      engagementData[0].label === dominantSegment.label
                        ? 'donut-dominant'
                        : 'donut-dimmed'
                    }`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[0].color}
                    strokeWidth="20"
                    strokeDasharray={`${40 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                  <motion.circle
                    className={`donut-segment ${
                      engagementData[1].label === dominantSegment.label
                        ? 'donut-dominant'
                        : 'donut-dimmed'
                    }`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[1].color}
                    strokeWidth="20"
                    strokeDasharray={`${30 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset={`-${40 * 5.026}`}
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                  <motion.circle
                    className={`donut-segment ${
                      engagementData[2].label === dominantSegment.label
                        ? 'donut-dominant'
                        : 'donut-dimmed'
                    }`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[2].color}
                    strokeWidth="20"
                    strokeDasharray={`${20 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset={`-${70 * 5.026}`}
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                  <motion.circle
                    className={`donut-segment ${
                      engagementData[3].label === dominantSegment.label
                        ? 'donut-dominant'
                        : 'donut-dimmed'
                    }`}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={engagementData[3].color}
                    strokeWidth="20"
                    strokeDasharray={`${10 * 5.026} ${100 * 5.026}`}
                    strokeDashoffset={`-${90 * 5.026}`}
                    transform="rotate(-90 100 100)"
                    initial={{ pathLength: 0 }}
                    animate={insightsInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  <text x="100" y="100" textAnchor="middle" className="donut-text">
                    <tspan x="100" dy="-5" className="donut-value">
                      {dominantSegment.value}%
                    </tspan>
                    <tspan x="100" dy="20" className="donut-label">
                      {dominantSegment.label}
                    </tspan>
                  </text>
                </svg>
                <div className="donut-legend">
                  {engagementData.map((item) => (
                    <div
                      className={`legend-item ${
                        item.label === dominantSegment.label ? 'legend-dominant' : ''
                      }`}
                      key={item.label}
                    >
                      <div
                        className="legend-color"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="legend-label">
                        {item.label}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="chart-caption">
                  Your activity is strongest in{' '}
                  <strong>{dominantSegment.label.toLowerCase()}</strong>, representing{' '}
                  {dominantSegment.value}% of your overall engagement.
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
                    const maxValue = Math.max(...weeklyActivity.map((d) => d.value));
                    const height = (day.value / maxValue) * 100;
                    const isPeak = day.value === maxValue;
                    return (
                      <motion.div
                        className={`bar-group ${isPeak ? 'bar-peak' : ''}`}
                        key={day.day}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={
                          insightsInView
                            ? { opacity: 1, scaleY: 1 }
                            : { opacity: 0, scaleY: 0 }
                        }
                        transition={{
                          duration: 0.5,
                          delay: 0.1 * index,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        <div className="bar-wrapper">
                          <div
                            className={`bar ${isPeak ? 'bar-peak-bar' : ''}`}
                            style={{
                              height: `${height}%`,
                              backgroundColor: isPeak
                                ? 'var(--dusk-blue)'
                                : 'var(--dusty-denim)',
                              opacity: isPeak ? 1 : 0.75,
                            }}
                          >
                            <span className="bar-value">{day.value}</span>
                          </div>
                        </div>
                        <span
                          className={`bar-label ${
                            isPeak ? 'bar-label-peak' : ''
                          }`}
                        >
                          {day.day}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="chart-caption">
                  Peak study and career activity on{' '}
                  <strong>
                    {
                      weeklyActivity.find(
                        (d) => d.value === Math.max(...weeklyActivity.map((x) => x.value))
                      )?.day
                    }
                  </strong>{' '}
                  with{' '}
                  {Math.max(...weeklyActivity.map((d) => d.value))} key interactions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default StudentDashboard;