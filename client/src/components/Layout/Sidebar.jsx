import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { SocketContext } from '../../context/SocketContext.jsx';
import API from '../../services/api.js';
import { Users, UserPlus, Music, Heart, Globe, Sparkles } from 'lucide-react';

const Sidebar = () => {
  const { user, setUser } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchCircleData = async () => {
      if (!user) return;
      try {
        const suggRes = await API.get('/users/circle/suggestions');
        setSuggestions(suggRes.data);

        // Fetch requests from /auth/me or direct refresh
        const profileRes = await API.get('/auth/me');
        setRequests(profileRes.data.circleRequests || []);
      } catch (err) {
        console.error('Error fetching circle data:', err.message);
      }
    };
    fetchCircleData();
  }, [user]);

  const sendRequest = async (targetUserId) => {
    try {
      await API.post('/users/circle/request', { targetUserId });
      setSuggestions((prev) => prev.filter((u) => u._id !== targetUserId));
    } catch (err) {
      console.error('Request failed:', err);
    }
  };

  const acceptRequest = async (requesterId) => {
    try {
      await API.post('/users/circle/accept', { requesterId });
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
      
      // Update local storage/context for circles
      const profileRes = await API.get('/auth/me');
      setUser(profileRes.data);
    } catch (err) {
      console.error('Accept failed:', err);
    }
  };

  const rejectRequest = async (requesterId) => {
    try {
      await API.post('/users/circle/reject', { requesterId });
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      console.error('Decline failed:', err);
    }
  };

  if (!user) return null;

  return (
    <aside className="glass-panel" style={{
      position: 'fixed',
      top: '80px',
      left: '24px',
      bottom: '24px',
      width: '260px',
      padding: '20px',
      overflowY: 'auto',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Navigation shortcuts */}
      <div>
        <h3 style={{ fontSize: '12px', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          My Workspace
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to={`/canvas/${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px', transition: '0.2s' }} className="btn-secondary">
            <Users size={18} className="text-gradient" />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Canvas Profile</span>
          </Link>
          <Link to="/groups" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px', transition: '0.2s' }} className="btn-secondary">
            <Users size={18} style={{ color: '#ec4899' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Community Groups</span>
          </Link>
          <Link to="/premium" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px', transition: '0.2s' }} className="btn-secondary">
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Unlock Aura AI</span>
          </Link>
        </div>
      </div>

      {/* Circle Requests */}
      {requests.length > 0 && (
        <div>
          <h3 style={{ fontSize: '12px', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Circle Invites ({requests.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map((reqUser) => (
              <div key={reqUser._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={reqUser.avatar} alt={reqUser.username} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reqUser.username}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => acceptRequest(reqUser._id)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px' }}>Join</button>
                  <button onClick={() => rejectRequest(reqUser._id)} className="btn-secondary" style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '4px' }}>X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Circle Friends & Presence */}
      <div>
        <h3 style={{ fontSize: '12px', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          My Circle Connections
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
          {user.circle && user.circle.length > 0 ? (
            user.circle.map((friend) => {
              const isOnline = onlineUsers.includes(friend._id);
              return (
                <div key={friend._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar-container" style={{ width: '30px', height: '30px' }}>
                    <img src={friend.avatar} alt={friend.username} className="avatar-image" style={{ width: '30px', height: '30px' }} />
                    {isOnline && <div className="online-badge" style={{ bottom: 0, right: 0, width: '10px', height: '10px' }}></div>}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>
                    {friend.username}
                  </span>
                </div>
              );
            })
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-dark)' }}>No connections yet. Expand your Circle!</span>
          )}
        </div>
      </div>

      {/* Circle suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 'auto' }}>
          <h3 style={{ fontSize: '12px', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Expand Circle
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {suggestions.slice(0, 3).map((sugg) => (
              <div key={sugg._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={sugg.avatar} alt={sugg.username} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{sugg.username}</span>
                </div>
                <button
                  onClick={() => sendRequest(sugg._id)}
                  className="btn-secondary"
                  style={{ padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Send Invite"
                >
                  <UserPlus size={14} className="text-gradient" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
