import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPlus, HiTrash, HiUser, HiCalendar } from 'react-icons/hi';
import { FaUserSecret } from 'react-icons/fa';

const DisposableSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(user?.disposableProfiles || []);
  const [communities, setCommunities] = useState([]);
  const [form, setForm] = useState({ displayName: '', communityId: '', expiresInDays: 7 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { data } = await API.get('/communities');
        setCommunities(data.communities || []);
        if (data.communities?.length > 0) {
          setForm(prev => ({ ...prev, communityId: data.communities[0]._id }));
        }
      } catch (e) {}
    };
    fetchCommunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) return toast.error('Alias display name required.');
    setCreating(true);
    try {
      const { data } = await API.post('/users/disposable-profile', form);
      setProfiles(data);
      updateUser({ disposableProfiles: data });
      setForm({ displayName: '', communityId: communities[0]?._id || '', expiresInDays: 7 });
      toast.success('Disposable profile generated!');
    } catch (error) {
      toast.error('Failed to create disposable profile.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 650, margin: '0 auto' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ marginBottom: 'var(--space-md)' }}>
        <HiArrowLeft /> Back to Settings
      </button>

      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <FaUserSecret /> Disposable Profiles
      </h1>
      <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
        Create temporary aliases for specific communities to keep your interests and personas isolated.
      </p>

      {/* Create form */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Create Temporary Identity</h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Alias Display Name</label>
            <input
              className="form-input"
              placeholder="e.g. IncognitoGardener"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Community</label>
            <select
              className="form-input"
              value={form.communityId}
              onChange={e => setForm({ ...form, communityId: e.target.value })}
            >
              {communities.length === 0 ? (
                <option value="">No communities joined yet</option>
              ) : (
                communities.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lifespan</label>
            <select
              className="form-input"
              value={form.expiresInDays}
              onChange={e => setForm({ ...form, expiresInDays: parseInt(e.target.value) })}
            >
              <option value="1">1 Day</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={creating || communities.length === 0}>
            {creating ? 'Generating...' : 'Create Alias Profile'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card">
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Active Aliases</h3>
        {profiles.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No active temporary profiles.</p>
        ) : (
          <div className="flex flex-col gap-sm">
            {profiles.map((p, i) => {
              const matchedComm = communities.find(c => c._id === p.communityId);
              return (
                <div key={i} className="card flex items-center justify-between" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar avatar-sm avatar-placeholder">
                      <FaUserSecret />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.displayName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Linked to: {matchedComm?.name || 'Community'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <HiCalendar />
                    <span>Expires: {new Date(p.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisposableSettings;
