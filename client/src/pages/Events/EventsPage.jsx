import React from 'react';
import { Calendar, MapPin, Plus } from 'lucide-react';

export default function EventsPage({
  events,
  setShowAddEventModal,
  user,
  handleEventRSVP,
  rsvpedEventsList
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
      
      {/* Event Listings list */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} color="var(--color-primary)" />
            <span>Connection Events</span>
          </h2>
          <button onClick={() => setShowAddEventModal(true)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            <Plus size={14} />
            <span>Organize Event</span>
          </button>
        </div>

        {events.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No upcoming community events organized yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map(ev => (
              <div key={ev._id} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', background: 'rgba(99,102,241,0.1)', padding: '10px 14px', borderRadius: '8px', minWidth: '70px', height: '70px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    {new Date(ev.date).toLocaleDateString([], { month: 'short' })}
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginTop: '-4px' }}>
                    {new Date(ev.date).toLocaleDateString([], { day: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '15px' }}>{ev.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {ev.location || 'Online Meetup'}
                  </span>
                  <p style={{ fontSize: '12.5px', marginTop: '6px' }}>{ev.description}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                    <button 
                      onClick={() => handleEventRSVP(ev._id, 'going')}
                      className={ev.going.some(g => g._id === user.id) ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Going ({ev.going.length})
                    </button>
                    <button 
                      onClick={() => handleEventRSVP(ev._id, 'interested')}
                      className={ev.interested.some(i => i._id === user.id) ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Interested ({ev.interested.length})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP quick panel sidebar */}
      <div className="glass-panel" style={{ padding: '20px', height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px', marginBottom: '10px' }}>Your Events Agenda</h3>
        {rsvpedEventsList.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You have no RSVPed events upcoming.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rsvpedEventsList.map(ev => (
              <div key={ev._id} style={{ display: 'flex', gap: '8px', padding: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px', background: 'rgba(99,102,241,0.05)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {new Date(ev.date).toLocaleDateString([], { month: 'short' })}
                  </span>
                  <strong style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '-2px' }}>
                    {new Date(ev.date).toLocaleDateString([], { day: 'numeric' })}
                  </strong>
                </div>
                <span style={{ fontSize: '12.5px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', flex: 1, alignSelf: 'center', marginLeft: '6px' }}>{ev.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
