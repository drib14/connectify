import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiSearch, HiUserGroup, HiLocationMarker, HiLightBulb, HiPuzzle, HiFlag, HiAcademicCap } from 'react-icons/hi';

const typeConfig = {
  general: { emoji: '💬', color: 'var(--text-secondary)' }, neighborhood: { emoji: '🏘️', color: 'var(--success)' },
  habit: { emoji: '🔄', color: 'var(--warm)' }, sharedGoal: { emoji: '🎯', color: 'var(--primary)' },
  temporary: { emoji: '⏳', color: 'var(--error)' }, problemSolving: { emoji: '🧩', color: 'var(--accent)' },
  skillExchange: { emoji: '🔧', color: 'var(--secondary)' }, studyGroup: { emoji: '📚', color: 'var(--info)' },
  projectTeam: { emoji: '🚀', color: 'var(--primary)' }, volunteer: { emoji: '🤝', color: 'var(--success)' },
  crisis: { emoji: '🚨', color: 'var(--error)' }, knowledge: { emoji: '💡', color: 'var(--warm)' },
};

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'general' });

  useEffect(() => { fetchCommunities(); }, [activeType, search]);

  const fetchCommunities = async () => {
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.set('type', activeType);
      if (search) params.set('search', search);
      const { data } = await API.get(`/communities?${params}`);
      setCommunities(data.communities);
    } catch (e) {} finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    try {
      await API.post('/communities', form);
      toast.success('Community created! 🎉');
      setShowCreate(false);
      setForm({ name: '', description: '', type: 'general' });
      fetchCommunities();
    } catch (e) { toast.error('Failed to create community.'); }
  };

  const handleJoin = async (id) => {
    try {
      await API.post(`/communities/${id}/join`);
      toast.success('Joined community!');
      fetchCommunities();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed.'); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2">🌍 Communities</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><HiPlus /> Create</button>
      </div>

      {showCreate && (
        <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Create Community</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-md">
            <input className="form-input" placeholder="Community name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <textarea className="form-input form-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.emoji} {k.replace(/([A-Z])/g, ' $1').trim()}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">Create Community</button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <HiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" placeholder="Search communities..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="flex gap-xs flex-wrap" style={{ marginBottom: 'var(--space-lg)' }}>
        {['all', ...Object.keys(typeConfig)].map(t => (
          <button key={t} className={`tag ${activeType === t ? 'active' : ''}`} onClick={() => setActiveType(t)}>
            {t === 'all' ? '🌐 All' : `${typeConfig[t]?.emoji} ${t.replace(/([A-Z])/g, ' $1').trim()}`}
          </button>
        ))}
      </div>

      {loading ? <div className="loader"><div className="spinner spinner-lg"></div></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
          {communities.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}><div className="empty-state-icon">🌍</div><div className="empty-state-title">No communities found</div><div className="empty-state-text">Create the first one!</div></div>
          ) : communities.map(c => (
            <div key={c._id} className="card card-interactive" style={{ cursor: 'pointer' }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: 28 }}>{typeConfig[c.type]?.emoji || '💬'}</span>
                <div className="flex-1">
                  <Link to={`/communities/${c._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</Link>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{c.memberCount} members · {c.type}</div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-md)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
              {c.tags?.length > 0 && <div className="flex gap-xs flex-wrap" style={{ marginBottom: 'var(--space-sm)' }}>{c.tags.slice(0, 3).map(t => <span key={t} className="badge badge-primary">{t}</span>)}</div>}
              <button className="btn btn-outline btn-sm w-full" onClick={(e) => { e.stopPropagation(); handleJoin(c._id); }}>Join Community</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communities;
