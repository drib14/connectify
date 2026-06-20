import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiCalendar, HiLocationMarker, HiUsers, HiInbox } from 'react-icons/hi';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import Modal from '../../components/UI/Modal';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'general', date: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events?upcoming=true');
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
      await API.post('/events', form);
      toast.success('Event created!');
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'general', date: '' });
      fetchEvents();
    } catch (e) {
      toast.error('Failed.');
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Event">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <input className="form-input" placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input form-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="flex gap-sm">
            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="general">General</option>
              <option value="meetup">Meet-Up</option>
              <option value="skillExchange">Skill Exchange</option>
              <option value="studySession">Study Session</option>
              <option value="challenge">Challenge</option>
            </select>
            <input type="datetime-local" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
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
          <div className="empty-state-title">No upcoming events</div>
          <div className="empty-state-text">Create an event or check back later!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {events.map(event => (
            <div key={event._id} className="card card-interactive">
              <div className="flex items-center gap-md">
                <div style={{ textAlign: 'center', padding: 'var(--space-sm) var(--space-md)', background: 'rgba(0,212,170,0.1)', borderRadius: 'var(--radius-md)', minWidth: 60 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600 }}>{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary)' }}>{new Date(event.date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{event.title}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <HiCalendar /> {new Date(event.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })} · <HiUsers /> {event.attendees?.length || 0} attending
                  </div>
                  {event.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 8 }}>{event.description}</p>}
                </div>
                <button className="btn btn-outline btn-sm" onClick={async () => { try { await API.post(`/events/${event._id}/attend`, { status: 'going' }); toast.success('RSVP\'d!'); fetchEvents(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } }}>RSVP</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
