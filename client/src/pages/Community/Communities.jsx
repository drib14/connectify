import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiPlus,
  HiSearch,
  HiUserGroup,
  HiLocationMarker,
  HiLightBulb,
  HiPuzzle,
  HiFlag,
  HiAcademicCap,
  HiHome,
  HiClock,
  HiChat,
  HiHand,
  HiExclamation,
  HiInbox,
  HiGlobe
} from 'react-icons/hi';
import { FaSyncAlt, FaWrench, FaRocket } from 'react-icons/fa';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import Modal from '../../components/UI/Modal';

const typeConfig = {
  general: { icon: HiChat, color: 'var(--text-secondary)' },
  neighborhood: { icon: HiHome, color: 'var(--success)' },
  habit: { icon: FaSyncAlt, color: 'var(--warm)' },
  sharedGoal: { icon: HiFlag, color: 'var(--primary)' },
  temporary: { icon: HiClock, color: 'var(--error)' },
  problemSolving: { icon: HiPuzzle, color: 'var(--accent)' },
  skillExchange: { icon: FaWrench, color: 'var(--secondary)' },
  studyGroup: { icon: HiAcademicCap, color: 'var(--info)' },
  projectTeam: { icon: FaRocket, color: 'var(--primary)' },
  volunteer: { icon: HiHand, color: 'var(--success)' },
  crisis: { icon: HiExclamation, color: 'var(--error)' },
  knowledge: { icon: HiLightBulb, color: 'var(--warm)' },
};

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'general' });

  useEffect(() => {
    fetchCommunities();
  }, [activeType, search]);

  const fetchCommunities = async () => {
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.set('type', activeType);
      if (search) params.set('search', search);
      const { data } = await API.get(`/communities?${params}`);
      setCommunities(data.communities);
    } catch (e) {
      toast.error('Failed to fetch communities.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    try {
      await API.post('/communities', form);
      toast.success('Community created!');
      setShowCreate(false);
      setForm({ name: '', description: '', type: 'general' });
      fetchCommunities();
    } catch (e) {
      toast.error('Failed to create community.');
    }
  };

  const handleJoin = async (id) => {
    try {
      await API.post(`/communities/${id}/join`);
      toast.success('Joined community!');
      fetchCommunities();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HiUserGroup /> Communities
        </h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <HiPlus /> Create
        </button>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Community">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <input className="form-input" placeholder="Community name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <textarea className="form-input form-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {Object.entries(typeConfig).map(([k, v]) => (
              <option key={k} value={k}>
                {k.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Create Community</button>
        </form>
      </Modal>

      <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <HiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" placeholder="Search communities..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="flex gap-xs flex-wrap" style={{ marginBottom: 'var(--space-lg)' }}>
        <button
          className={`tag ${activeType === 'all' ? 'active' : ''}`}
          onClick={() => setActiveType('all')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <HiGlobe /> All
        </button>
        {Object.entries(typeConfig).map(([k, v]) => {
          const TagIcon = v.icon;
          return (
            <button
              key={k}
              className={`tag ${activeType === k ? 'active' : ''}`}
              onClick={() => setActiveType(k)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <TagIcon />
              <span>{k.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
          <SkeletonLoader type="community" count={6} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
          {communities.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">
                <HiInbox />
              </div>
              <div className="empty-state-title">No communities found</div>
              <div className="empty-state-text">Create the first one!</div>
            </div>
          ) : (
            communities.map(c => {
              const CommIcon = typeConfig[c.type]?.icon || HiChat;
              return (
                <div key={c._id} className="card card-interactive" style={{ cursor: 'pointer' }}>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                    <span style={{ fontSize: 24, display: 'inline-flex', color: typeConfig[c.type]?.color || 'var(--text-secondary)' }}>
                      <CommIcon />
                    </span>
                    <div className="flex-1">
                      <Link to={`/communities/${c._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</Link>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {c.memberCount} members · {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-md)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                  {c.tags?.length > 0 && (
                    <div className="flex gap-xs flex-wrap" style={{ marginBottom: 'var(--space-sm)' }}>
                      {c.tags.slice(0, 3).map(t => (
                        <span key={t} className="badge badge-primary">{t}</span>
                      ))}
                    </div>
                  )}
                  <button className="btn btn-outline btn-sm w-full" onClick={(e) => { e.stopPropagation(); handleJoin(c._id); }}>
                    Join Community
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Communities;
