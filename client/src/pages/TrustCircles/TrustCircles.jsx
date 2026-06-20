import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiHeart, HiUsers, HiBriefcase, HiAcademicCap, HiPlus, HiX, HiSearch } from 'react-icons/hi';
import './TrustCircles.css';

const circles = [
  { key: 'family', label: 'Family', icon: HiHeart, color: '#ef4444', emoji: '❤️' },
  { key: 'friends', label: 'Friends', icon: HiUsers, color: '#0ea5e9', emoji: '👥' },
  { key: 'coworkers', label: 'Coworkers', icon: HiBriefcase, color: '#f59e0b', emoji: '💼' },
  { key: 'classmates', label: 'Classmates', icon: HiAcademicCap, color: '#a855f7', emoji: '🎓' },
];

const TrustCircles = () => {
  const { user, updateUser } = useAuth();
  const [trustCircles, setTrustCircles] = useState({ family: [], friends: [], coworkers: [], classmates: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeCircle, setActiveCircle] = useState('family');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/auth/me');
        setTrustCircles(data.trustCircles || { family: [], friends: [], coworkers: [], classmates: [] });
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const { data } = await API.get(`/users/search?q=${query}`);
        setSearchResults(data.filter(u => u._id !== user._id));
      } catch (e) {}
    } else { setSearchResults([]); }
  };

  const addToCircle = async (userId) => {
    try {
      const { data } = await API.put('/users/trust-circles', { circle: activeCircle, userId, action: 'add' });
      setTrustCircles(data);
      toast.success(`Added to ${activeCircle}!`);
      setSearchQuery('');
      setSearchResults([]);
    } catch (e) { toast.error('Failed to add.'); }
  };

  const removeFromCircle = async (userId) => {
    try {
      const { data } = await API.put('/users/trust-circles', { circle: activeCircle, userId, action: 'remove' });
      setTrustCircles(data);
      toast.success('Removed from circle.');
    } catch (e) { toast.error('Failed to remove.'); }
  };

  const activeMembers = trustCircles[activeCircle] || [];
  const activeCircleInfo = circles.find(c => c.key === activeCircle);

  return (
    <div className="trust-circles-page">
      <div className="page-header">
        <h1 className="heading-2">🔒 Trust Circles</h1>
        <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Control who sees your content. Share with the right people.</p>
      </div>

      <div className="tc-grid">
        {/* Circle Selector */}
        <div className="tc-selector">
          {circles.map(c => (
            <button key={c.key} className={`tc-circle-btn ${activeCircle === c.key ? 'active' : ''}`} onClick={() => setActiveCircle(c.key)} style={{ '--circle-color': c.color }}>
              <div className="tc-circle-icon">{c.emoji}</div>
              <div className="tc-circle-info">
                <span className="tc-circle-label">{c.label}</span>
                <span className="tc-circle-count">{(trustCircles[c.key] || []).length} members</span>
              </div>
            </button>
          ))}
        </div>

        {/* Circle Members */}
        <div className="tc-members-panel">
          <div className="tc-members-header">
            <h3 className="heading-4">{activeCircleInfo?.emoji} {activeCircleInfo?.label} Circle</h3>
            <span className="badge badge-primary">{activeMembers.length} members</span>
          </div>

          {/* Search to Add */}
          <div className="tc-search">
            <HiSearch className="tc-search-icon" />
            <input type="text" className="form-input" placeholder={`Search to add to ${activeCircleInfo?.label}...`} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>

          {searchResults.length > 0 && (
            <div className="tc-search-results">
              {searchResults.map(u => (
                <div key={u._id} className="tc-search-result">
                  <div className="flex items-center gap-sm">
                    {u.avatar ? <img src={u.avatar} className="avatar avatar-sm" alt="" /> : <div className="avatar avatar-sm avatar-placeholder">{u.firstName?.[0]}{u.lastName?.[0]}</div>}
                    <div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{u.firstName} {u.lastName}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>@{u.username}</div></div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => addToCircle(u._id)}><HiPlus /> Add</button>
                </div>
              ))}
            </div>
          )}

          {/* Members List */}
          <div className="tc-members-list">
            {activeMembers.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}><div className="empty-state-icon">👋</div><div className="empty-state-title">No members yet</div><div className="empty-state-text">Search and add people to your {activeCircleInfo?.label} circle.</div></div>
            ) : (
              activeMembers.map(m => (
                <div key={m._id} className="tc-member">
                  <div className="flex items-center gap-sm">
                    {m.avatar ? <img src={m.avatar} className="avatar avatar-sm" alt="" /> : <div className="avatar avatar-sm avatar-placeholder">{m.firstName?.[0]}{m.lastName?.[0]}</div>}
                    <div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{m.firstName} {m.lastName}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>@{m.username}</div></div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeFromCircle(m._id)} style={{ color: 'var(--error)' }}><HiX /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustCircles;
