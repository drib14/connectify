import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiUserGroup, HiHeart, HiArrowRight, HiVolumeUp } from 'react-icons/hi';
import { FaUserPlus, FaCheck, FaVolumeMute, FaLeaf } from 'react-icons/fa';
import API from '../../services/api';
import toast from 'react-hot-toast';
import './RightSidebar.css';

const affirmations = [
  "Take a deep breath. You are doing well.",
  "It is okay to step away. Protect your peace.",
  "You do not have to prove anything to anyone.",
  "Progress is progress, no matter how small.",
  "Your worth is not defined by your productivity.",
  "Today is a new day to learn and grow.",
];

const RightSidebar = () => {
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [breathingText, setBreathingText] = useState('Take a Breath');
  const [breathingState, setBreathingState] = useState('idle'); // idle, in, hold, out

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await API.get('/users/suggested');
        setSuggested(data.slice(0, 4));
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetchSuggestions();
    
    // Rotate affirmations every 10 seconds
    const interval = setInterval(() => {
      setAffirmationIdx(prev => (prev + 1) % affirmations.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleFollow = async (userId) => {
    try {
      const { data } = await API.post(`/users/follow/${userId}`);
      toast.success(data.following ? 'Following!' : 'Unfollowed.');
      setSuggested(prev => prev.map(u => u._id === userId ? { ...u, isFollowing: data.following } : u));
    } catch (e) {
      toast.error('Failed to follow.');
    }
  };

  const startBreathing = () => {
    if (breathingState !== 'idle') return;
    
    setBreathingState('in');
    setBreathingText('Inhale...');
    
    setTimeout(() => {
      setBreathingState('hold');
      setBreathingText('Hold...');
      
      setTimeout(() => {
        setBreathingState('out');
        setBreathingText('Exhale...');
        
        setTimeout(() => {
          setBreathingState('idle');
          setBreathingText('Take a Breath');
        }, 4000);
      }, 4000);
    }, 4000);
  };

  return (
    <aside className="right-sidebar">
      {/* Stress-Free Corner */}
      <div className="card widget-card">
        <h4 className="widget-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <FaLeaf style={{ color: 'var(--success)' }} /> Stress-Free Corner
        </h4>
        <p className="affirmation-text animate-fade-in">
          {affirmations[affirmationIdx]}
        </p>
        <div className="breathing-widget">
          <div className={`breathing-circle state-${breathingState}`} onClick={startBreathing}>
            <div className="breathing-label">{breathingText}</div>
          </div>
        </div>
      </div>

      {/* Suggested People */}
      <div className="card widget-card">
        <h4 className="widget-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <HiUserGroup /> People to Follow
        </h4>
        {loading ? (
          <div className="widget-loading">
            <div className="spinner spinner-sm"></div>
          </div>
        ) : suggested.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No suggestions available.</p>
        ) : (
          <div className="suggested-users-list">
            {suggested.map((u) => (
              <div key={u._id} className="suggested-user-row">
                <Link to={`/profile/${u.username}`} className="user-info-link">
                  {u.avatar ? (
                    <img src={u.avatar} className="avatar avatar-sm" alt="" />
                  ) : (
                    <div className="avatar avatar-sm avatar-placeholder">
                      {u.firstName?.[0]}
                      {u.lastName?.[0]}
                    </div>
                  )}
                  <div className="user-details">
                    <span className="user-name">{u.firstName} {u.lastName}</span>
                    <span className="user-handle">@{u.username}</span>
                  </div>
                </Link>
                <button
                  className={`btn btn-icon btn-sm ${u.isFollowing ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => handleFollow(u._id)}
                  title={u.isFollowing ? 'Following' : 'Follow'}
                >
                  {u.isFollowing ? <FaCheck style={{ color: 'var(--success)' }} /> : <FaUserPlus />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stress-Free Social Affirmation Footer */}
      <div className="widget-footer">
        <p>Connectify © 2026</p>
        <p>Designed for mental wellbeing</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
