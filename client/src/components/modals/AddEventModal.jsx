import React from 'react';
import { X } from 'lucide-react';

export default function AddEventModal({ 
  isOpen, 
  onClose, 
  newEventTitle, 
  setNewEventTitle, 
  newEventDate, 
  setNewEventDate, 
  newEventLoc, 
  setNewEventLoc, 
  newEventDesc, 
  setNewEventDesc, 
  handleCreateEvent 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}>
      <div className="glass-panel-heavy" style={{ width: '420px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Organize Event</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Event Title..." value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required />
          <input type="datetime-local" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
          <input type="text" placeholder="Location..." value={newEventLoc} onChange={e => setNewEventLoc(e.target.value)} />
          <textarea placeholder="Event Description..." value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} rows={3} />
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Launch Event</button>
        </form>
      </div>
    </div>
  );
}
