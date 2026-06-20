import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Clock, Plus, Trash2, Send, Image, Users, Sparkles } from 'lucide-react';
import api from '../../utils/api';

// Inline Countdown sub-component for locked capsules
function CapsuleCountdown({ unlockDate, onUnlockReached }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(unlockDate) - new Date();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
        if (onUnlockReached) onUnlockReached();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [unlockDate]);

  if (!timeLeft) {
    return (
      <span className="flex items-center gap-1 text-emerald-400 font-bold" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
        <Unlock size={14} /> Ready to Open!
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
      <Clock size={13} />
      <span>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}

export default function TimeCapsulePage({ user, allUsers, showToast, playAlertChime }) {
  const [capsules, setCapsules] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const loadCapsules = async () => {
    try {
      const res = await api.get('/capsules');
      if (res.data.success) {
        setCapsules(res.data.capsules);
        // Play success chime if any capsule just unlocked
        const hasJustUnlocked = res.data.capsules.some(c => c.isUnlocked);
        if (hasJustUnlocked) {
          playAlertChime('victory');
        }
      }
    } catch (err) {
      console.error('Error loading time capsules:', err);
    }
  };

  useEffect(() => {
    loadCapsules();
  }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleParticipantToggle = (id) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleCreateCapsule = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !unlockDate) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const targetDate = new Date(unlockDate);
    if (targetDate <= new Date()) {
      showToast('Unlock date must be in the future.', 'error');
      return;
    }

    setLoading(false);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('unlockDate', unlockDate);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }
    formData.append('participants', JSON.stringify(selectedParticipants));

    try {
      setLoading(true);
      showToast('Sealing memory inside Time Capsule...', 'info');
      const res = await api.post('/capsules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        showToast('🔒 Memory sealed in the Vault successfully! Earned +25 SPARK!', 'success');
        playAlertChime('victory');
        setTitle('');
        setMessage('');
        setUnlockDate('');
        setMediaFile(null);
        setMediaPreview(null);
        setSelectedParticipants([]);
        setShowCreateForm(false);
        loadCapsules();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create time capsule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCapsule = async (id) => {
    if (!confirm('Are you sure you want to discard this Time Capsule? The memory will be lost forever.')) return;
    try {
      const res = await api.delete(`/capsules/${id}`);
      if (res.data.success) {
        showToast('Time capsule removed.', 'info');
        setCapsules(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete capsule.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header section */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--main-gradient)', color: 'white' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles /> Connectify Time Capsule
          </h2>
          <p style={{ opacity: 0.85, fontSize: '13px', marginTop: '4px' }}>
            Lock text letters, photos, or videos in a secure digital vault to be revealed to yourself and selected friends on a future date.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-premium"
          style={{ background: 'white', color: 'var(--bg-primary)' }}
        >
          <Plus size={16} />
          <span>{showCreateForm ? 'Back to Vault' : 'Seal New Memory'}</span>
        </button>
      </div>

      {showCreateForm ? (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', marginBottom: '18px', fontSize: '18px' }}>
            🔐 Seal a New Memory Capsule
          </h3>
          <form onSubmit={handleCreateCapsule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Memory Title</label>
              <input 
                type="text" 
                placeholder="e.g. Letter to My Future Self, College Graduation Memories..."
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Your Message / Letter</label>
              <textarea 
                placeholder="Write your thoughts, feelings, predictions or questions for the future..."
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                required 
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Unlock Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={unlockDate} 
                  onChange={e => setUnlockDate(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Attach Photo / Video (Optional)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current.click()} 
                    className="btn-secondary"
                    style={{ height: '40px' }}
                  >
                    <Image size={16} /> Choose File
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleMediaChange} 
                    accept="image/*,video/*" 
                    style={{ display: 'none' }}
                  />
                  {mediaPreview && (
                    <div style={{ position: 'relative' }}>
                      <img src={mediaPreview} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => { setMediaFile(null); setMediaPreview(null); }} 
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-danger)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justify: 'center', padding: 0, fontSize: '8px', color: 'white' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Friends list multiselect */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} /> Share Lock with Friends (Reveal to them too)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto', padding: '6px' }}>
                {allUsers.filter(u => u._id !== user.id).map(u => {
                  const isSelected = selectedParticipants.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleParticipantToggle(u._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '30px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                        cursor: 'pointer',
                        fontSize: '12px',
                        userSelect: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={u.profilePic || '/default-avatar.png'} alt={u.username} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      <span>{u.username}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ height: '44px', fontWeight: '700', marginTop: '12px' }}
            >
              {loading ? 'Locking in Connectify Vault...' : '🔒 Seal Time Capsule (Cost: 0 points)'}
            </button>

          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          
          {capsules.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Lock size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Your Memory Vault is Empty</h4>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Sealed memories, future letters, and capsule timeline markers will appear here.</p>
              <button 
                onClick={() => setShowCreateForm(true)} 
                className="btn-primary"
                style={{ marginTop: '16px', display: 'inline-flex' }}
              >
                Create First Time Capsule
              </button>
            </div>
          ) : (
            capsules.map(c => {
              const isCreator = c.user._id === user.id || c.user === user.id;
              return (
                <div 
                  key={c._id} 
                  className={`glass-panel ${c.isUnlocked ? 'unlocked-glow' : 'locked-glow'}`}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                    borderLeft: `4px solid ${c.isUnlocked ? 'var(--color-success)' : 'var(--color-primary)'}`,
                    boxShadow: c.isUnlocked ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '12px' }}>
                        {c.isUnlocked ? (
                          <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                            <Unlock size={12} /> Opened
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                            <Lock size={12} /> Sealed
                          </span>
                        )}
                      </span>
                      {isCreator && (
                        <button onClick={() => handleDeleteCapsule(c._id)} style={{ background: 'none', padding: 0, color: 'var(--text-muted)' }} title="Delete Memory">
                          <Trash2 size={14} className="hover:text-red-500" />
                        </button>
                      )}
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                      {c.title}
                    </h4>
                    
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Created by @{c.user.username} • for {c.participants.length > 0 ? `${c.participants.length + 1} people` : 'Self only'}
                    </p>

                    <p style={{ fontSize: '13px', marginTop: '12px', whiteSpace: 'pre-wrap', color: c.isUnlocked ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: c.isUnlocked ? 'normal' : 'italic' }}>
                      {c.message}
                    </p>

                    {c.isUnlocked && c.mediaUrl && (
                      <div style={{ marginTop: '12px', borderRadius: '6px', overflow: 'hidden', maxHeight: '180px', border: '1px solid var(--border-glass)' }}>
                        {c.mediaType === 'video' ? (
                          <video src={c.mediaUrl} controls style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                        ) : (
                          <img src={c.mediaUrl} alt="capsule attachment" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CapsuleCountdown unlockDate={c.unlockDate} onUnlockReached={loadCapsules} />
                    </div>
                    {c.participants.length > 0 && (
                      <div style={{ display: 'flex', gap: '-6px' }}>
                        {c.participants.map(p => (
                          <img 
                            key={p._id}
                            src={p.profilePic || '/default-avatar.png'} 
                            alt={p.username} 
                            style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid var(--bg-primary)', marginLeft: '-6px' }}
                            title={p.username}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}

        </div>
      )}

    </div>
  );
}
