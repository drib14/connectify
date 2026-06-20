import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { HiTrendingUp, HiUserGroup, HiCalendar, HiQuestionMarkCircle, HiStar } from 'react-icons/hi';

const Explore = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [publicGoals, setPublicGoals] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [usersRes, goalsRes, commRes] = await Promise.all([
          API.get('/users/suggested'),
          API.get('/goals/public?limit=5'),
          API.get('/communities?limit=6'),
        ]);
        setSuggestedUsers(usersRes.data);
        setPublicGoals(goalsRes.data);
        setCommunities(commRes.data.communities || []);
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)' }}>🌍 Explore</h1>

      {/* Suggested People */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>👋 People to Follow</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          {suggestedUsers.map(u => (
            <Link key={u._id} to={`/profile/${u.username}`} className="card card-interactive" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              {u.avatar ? <img src={u.avatar} className="avatar avatar-xl" alt="" style={{ margin: '0 auto var(--space-sm)' }} /> : <div className="avatar avatar-xl avatar-placeholder" style={{ margin: '0 auto var(--space-sm)', fontSize: '1.5rem' }}>{u.firstName?.[0]}{u.lastName?.[0]}</div>}
              <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>@{u.username}</div>
              {u.contributionScore > 0 && <div className="badge badge-primary" style={{ marginTop: 8 }}>⭐ {u.contributionScore} pts</div>}
              {u.skills?.length > 0 && <div className="flex gap-xs justify-center flex-wrap" style={{ marginTop: 8 }}>{u.skills.slice(0, 2).map(s => <span key={s} className="tag">{s}</span>)}</div>}
            </Link>
          ))}
        </div>
      </section>

      {/* Public Goals */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
          <h2 className="heading-4">🎯 Public Goals</h2>
          <Link to="/goals" className="auth-link" style={{ fontSize: 'var(--text-sm)' }}>View all →</Link>
        </div>
        {publicGoals.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No public goals yet.</p> : (
          <div className="flex flex-col gap-sm">
            {publicGoals.map(g => (
              <div key={g._id} className="card flex items-center gap-md" style={{ padding: 'var(--space-md)' }}>
                <div className="flex-1">
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{g.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>by {g.user?.firstName} {g.user?.lastName} · {g.category}</div>
                </div>
                <div style={{ minWidth: 100 }}>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${g.progress}%` }}></div></div>
                  <div style={{ fontSize: 'var(--text-xs)', textAlign: 'right', marginTop: 4, color: 'var(--primary)' }}>{g.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Communities */}
      <section>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
          <h2 className="heading-4">🌍 Popular Communities</h2>
          <Link to="/communities" className="auth-link" style={{ fontSize: 'var(--text-sm)' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          {communities.map(c => (
            <Link key={c._id} to={`/communities/${c._id}`} className="card card-interactive" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 8 }}>{c.memberCount} members · {c.type}</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explore;
