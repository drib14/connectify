import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiCalendar, HiLocationMarker, HiUsers, HiInbox } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import Modal from '../../components/UI/Modal';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // options: 'upcoming', 'past', 'all'
  const [form, setForm] = useState({ title: '', description: '', type: 'general', date: '', endDate: '' });
  const [coverFile, setCoverFile] = useState(null);
  const { refreshUser } = useAuth();

  useEffect(() => {
    fetchEvents(filter);
  }, [filter]);

  const fetchEvents = async (activeFilter = filter) => {
    setLoading(true);
    try {
      let url = '/events';
      if (activeFilter === 'upcoming') {
        url = '/events?upcoming=true';
      } else if (activeFilter === 'past') {
        url = '/events?upcoming=false';
      }
      const { data } = await API.get(url);
      setEvents(data);
    } catch (e) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.date) return toast.error('Date required.');
    if (!form.title.trim()) return toast.error('Title required.');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('type', form.type);
      formData.append('date', form.date);
      if (form.endDate) {
        formData.append('endDate', form.endDate);
      }
      if (coverFile) {
        formData.append('eventMedia', coverFile);
      }

      await API.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Event created!');
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'general', date: '', endDate: '' });
      setCoverFile(null);
      fetchEvents(filter);
      refreshUser();
    } catch (e) {
      toast.error('Failed to create event.');
    }
  };

  const getEventBadge = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : null;

    if (eventDate <= now && (!eventEndDate || eventEndDate >= now)) {
      return { text: 'ONGOING', bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' };
    } else if (eventDate > now) {
      return { text: 'UPCOMING', bg: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' };
    } else {
      return { text: 'PAST', bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-tertiary)', border: '1px solid rgba(255, 255, 255, 0.08)' };
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HiCalendar /> Events
        </h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <HiPlus /> Create Event
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: 'var(--space-md)', paddingBottom: '8px' }}>
        {[
          { label: 'Upcoming & Ongoing', value: 'upcoming' },
          { label: 'Past Events', value: 'past' },
          { label: 'All Events', value: 'all' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: filter === tab.value ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
              background: filter === tab.value ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
              color: filter === tab.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Event">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <input className="form-input" placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input form-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          
          <div className="flex flex-col gap-xs" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Event Cover Image</label>
            <input type="file" accept="image/*" className="form-input" onChange={e => setCoverFile(e.target.files[0])} />
          </div>

          <div className="flex flex-col gap-xs" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Event Type</label>
            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="general">General</option>
              <option value="meetup">Meet-Up</option>
              <option value="skillExchange">Skill Exchange</option>
              <option value="studySession">Study Session</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

          <div className="flex gap-sm" style={{ flexDirection: 'column', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Start Date & Time</label>
                <input type="datetime-local" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>End Date & Time (Optional)</label>
                <input type="datetime-local" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create Event</button>
        </form>
      </Modal>

      {loading ? (
        <SkeletonLoader type="goal" count={3} />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiInbox />
          </div>
          <div className="empty-state-title">No events found</div>
          <div className="empty-state-text">Create an event or check back later!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {events.map(event => {
            const badge = getEventBadge(event);
            return (
              <div key={event._id} className="card card-interactive animate-fade-in-up" style={{ overflow: 'hidden', padding: 0 }}>
                {event.coverImage && (
                  <div style={{ height: '180px', width: '100%', overflow: 'hidden' }}>
                    <img src={event.coverImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="flex items-center gap-md" style={{ padding: 'var(--space-md)' }}>
                  <div style={{ textAlign: 'center', padding: 'var(--space-sm) var(--space-md)', background: 'rgba(0,212,170,0.1)', borderRadius: 'var(--radius-md)', minWidth: 60 }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600 }}>{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary)' }}>{new Date(event.date).getDate()}</div>
                  </div>
                  <div className="flex-1" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{event.title}</h3>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border
                      }}>
                        {badge.text}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <HiCalendar /> {new Date(event.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`} · <HiUsers /> {event.attendees?.length || 0} attending
                    </div>
                    {event.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 8 }}>{event.description}</p>}
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={async () => { try { await API.post(`/events/${event._id}/attend`, { status: 'going' }); toast.success('RSVP\'d!'); fetchEvents(filter); refreshUser(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } }}>RSVP</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
