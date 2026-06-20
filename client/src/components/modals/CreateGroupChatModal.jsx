import React from 'react';
import { X } from 'lucide-react';

export default function CreateGroupChatModal({ 
  isOpen, 
  onClose, 
  groupName, 
  setGroupName, 
  allUsers, 
  user, 
  selectedParticipants, 
  handleParticipantToggle, 
  handleCreateGroup 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div className="glass-panel-heavy" style={{ width: '400px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Create Group Lounge</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Group Name</label>
            <input
              type="text"
              placeholder="The Party Room..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Select Participants</label>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-glass)', padding: '8px', borderRadius: '6px' }}>
              {allUsers.filter(u => u._id !== user.id).map(friend => (
                <div 
                  key={friend._id}
                  onClick={() => handleParticipantToggle(friend._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: selectedParticipants.includes(friend._id) ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedParticipants.includes(friend._id)} 
                    onChange={() => {}} 
                  />
                  <img src={friend.profilePic || '/default-avatar.png'} alt={friend.username} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '12px' }}>{friend.username}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Launch Group Lounge
          </button>
        </form>
      </div>
    </div>
  );
}
