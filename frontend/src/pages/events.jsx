import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import '../styles/Events.css';

// ============================================
// DUMMY DATA
// ============================================
const DUMMY_EVENTS = [
  {
    id: 1,
    title: 'Tech Career Panel Discussion',
    date: '2026-01-15',
    location: 'Main Auditorium',
    description: 'Join successful alumni from top tech companies sharing their career journey and insights.',
    status: 'APPROVED',
    attendees: 45,
  },
  {
    id: 2,
    title: 'Annual Alumni Meetup 2026',
    date: '2026-02-20',
    location: 'University Campus',
    description: 'Reconnect with your batch mates and network with alumni across all years.',
    status: 'APPROVED',
    attendees: 120,
  },
  {
    id: 3,
    title: 'Startup Funding Workshop',
    date: '2026-01-25',
    location: 'Innovation Hub',
    description: 'Learn about funding strategies, pitch decks, and investor relations from successful founders.',
    status: 'PENDING',
    attendees: 0,
  },
  {
    id: 4,
    title: 'Diwali Celebration 2025',
    date: '2025-11-12',
    location: 'Community Center',
    description: 'Traditional celebration with cultural performances, food, and networking.',
    status: 'COMPLETED',
    attendees: 200,
  },
  {
    id: 5,
    title: 'Data Science Bootcamp',
    date: '2026-03-10',
    location: 'Online (Zoom)',
    description: 'Intensive 3-day bootcamp covering ML, AI, and data analytics with hands-on projects.',
    status: 'PENDING',
    attendees: 0,
  },
  {
    id: 6,
    title: 'Alumni Sports Day',
    date: '2025-12-05',
    location: 'Sports Complex',
    description: 'Friendly cricket and football matches followed by refreshments.',
    status: 'COMPLETED',
    attendees: 85,
  },
];

// ============================================
// REUSABLE COMPONENTS
// ============================================

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'PENDING':
        return 'status-badge status-pending';
      case 'APPROVED':
        return 'status-badge status-approved';
      case 'COMPLETED':
        return 'status-badge status-completed';
      default:
        return 'status-badge';
    }
  };

  return <span className={getBadgeClass()}>{status}</span>;
};

// AnalyticsCard Component
const AnalyticsCard = ({ title, value, icon }) => {
  return (
    <div className="analytics-card">
      <div className="analytics-icon">{icon}</div>
      <div className="analytics-content">
        <h3 className="analytics-value">{value}</h3>
        <p className="analytics-label">{title}</p>
      </div>
    </div>
  );
};

// EventCard Component
const EventCard = ({ event, userRole, onRSVP, onApprove, onReject }) => {
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const eventDate = new Date(event.date);
  const today = new Date();
  const isPastEvent = eventDate < today;

  const handleRSVP = (status) => {
    setRsvpStatus(status);
    onRSVP && onRSVP(event.id, status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        <StatusBadge status={event.status} />
      </div>

      <div className="event-meta">
        <div className="event-meta-item">
          <span className="meta-icon">📅</span>
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="event-meta-item">
          <span className="meta-icon">📍</span>
          <span>{event.location}</span>
        </div>
        {event.attendees > 0 && (
          <div className="event-meta-item">
            <span className="meta-icon">👥</span>
            <span>{event.attendees} attendees</span>
          </div>
        )}
      </div>

      <p className="event-description">{event.description}</p>

      {/* Role-based Actions */}
      <div className="event-actions">
        {/* Student Actions - RSVP */}
        {userRole === 'student' && event.status === 'APPROVED' && !isPastEvent && (
          <div className="rsvp-actions">
            <button
              className={`btn-rsvp ${rsvpStatus === 'interested' ? 'active' : ''}`}
              onClick={() => handleRSVP('interested')}
            >
              ⭐ Interested
            </button>
            <button
              className={`btn-rsvp ${rsvpStatus === 'going' ? 'active' : ''}`}
              onClick={() => handleRSVP('going')}
            >
              ✓ Going
            </button>
            <button
              className={`btn-rsvp ${rsvpStatus === 'not-going' ? 'active' : ''}`}
              onClick={() => handleRSVP('not-going')}
            >
              ✗ Not Going
            </button>
          </div>
        )}

        {/* Student - Event Completed */}
        {userRole === 'student' && isPastEvent && (
          <div className="event-completed-message">
            <span>This event has already taken place</span>
          </div>
        )}

        {/* Admin Actions - Approve/Reject */}
        {userRole === 'admin' && event.status === 'PENDING' && (
          <div className="admin-actions">
            <button className="btn-approve" onClick={() => onApprove(event.id)}>
              ✓ Approve
            </button>
            <button className="btn-reject" onClick={() => onReject(event.id)}>
              ✗ Reject
            </button>
          </div>
        )}

        {/* Alumni - View Only or View Details */}
        {userRole === 'alumni' && event.status === 'APPROVED' && (
          <button className="btn-details">View Details</button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ message, icon }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-message">{message}</p>
    </div>
  );
};

// Error State Component
const ErrorState = ({ message }) => {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{message}</p>
    </div>
  );
};

// ============================================
// MAIN EVENTS COMPONENT
// ============================================
const Events = () => {
  // State Management
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [userRole, setUserRole] = useState('student'); // Can be: 'student', 'alumni', 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(true);

  // Analytics Calculations
  const analytics = useMemo(() => {
    const today = new Date();
    const upcoming = events.filter(
      (e) => new Date(e.date) >= today && e.status !== 'COMPLETED'
    ).length;
    const completed = events.filter((e) => e.status === 'COMPLETED').length;

    return {
      total: events.length,
      upcoming,
      completed,
    };
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'upcoming') {
      const today = new Date();
      filtered = filtered.filter(
        (e) => new Date(e.date) >= today && e.status !== 'COMPLETED'
      );
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter((e) => e.status === 'COMPLETED');
    }

    // Sort by date (upcoming first, then past)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    return filtered;
  }, [events, searchQuery, statusFilter]);

  // Event Handlers
  const handleCreateEvent = () => {
    if (userRole !== 'alumni') {
      setError('Only alumni can create events.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setShowCreateModal(true);
    // In a real app, this would open a modal/form
    alert('Create Event Modal (UI only - no backend)');
  };

  const handleRSVP = (eventId, status) => {
    console.log(`RSVP for event ${eventId}: ${status}`);
    // In a real app, this would update backend
  };

  const handleApprove = (eventId) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, status: 'APPROVED' } : event
      )
    );
  };

  const handleReject = (eventId) => {
    if (window.confirm('Are you sure you want to reject this event?')) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
    setError(null);
  };

  // Permission Check Simulation
  if (!hasPermission) {
    return (
      <>
        <Navbar showAuthButtons={false} />
        <div className="events-container">
          <ErrorState message="You don't have permission to view events. Please contact admin." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar showAuthButtons={false} />
      <div className="events-container">
        {/* Header Section */}
        <div className="events-header">
          <div className="header-content">
            <h1 className="page-title">Events</h1>
            <p className="page-subtitle">
              Connect, learn, and grow with the alumni community
            </p>
          </div>

        {/* Role Switcher (for demo purposes) */}
        <div className="role-switcher">
          <label>Demo Role:</label>
          <select value={userRole} onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Create Event Button (Alumni only) */}
        {userRole === 'alumni' && (
          <button className="btn-create-event" onClick={handleCreateEvent}>
            + Create Event
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Analytics Section */}
      <div className="analytics-section">
        <AnalyticsCard title="Total Events" value={analytics.total} icon="📊" />
        <AnalyticsCard title="Upcoming Events" value={analytics.upcoming} icon="📅" />
        <AnalyticsCard title="Completed Events" value={analytics.completed} icon="✅" />
      </div>

      {/* Search and Filter Section */}
      <div className="controls-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Events
          </button>
          <button
            className={`filter-btn ${statusFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setStatusFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <EmptyState
            message={
              searchQuery
                ? 'No events found matching your search'
                : statusFilter === 'upcoming'
                ? 'No upcoming events scheduled'
                : statusFilter === 'completed'
                ? 'No completed events yet'
                : 'No events available'
            }
            icon="📭"
          />
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              userRole={userRole}
              onRSVP={handleRSVP}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default Events;
