import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '', bio: user?.bio || '',
    location: user?.location || '', website: user?.website || '',
    likeFreeModeEnabled: user?.likeFreeModeEnabled || false,
    slowFeedEnabled: user?.slowFeedEnabled || false,
    feedRefreshLimit: user?.feedRefreshLimit || 20,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', form);
      updateUser(data);
      toast.success('Settings saved!');
    } catch (e) { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)' }}>⚙️ Settings</h1>

      {/* Profile Settings */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Profile</h3>
        <div className="flex flex-col gap-md">
          <div className="flex gap-sm">
            <div className="form-group flex-1"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="form-group flex-1"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Website</label><input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
        </div>
      </div>

      {/* Mental Health Settings */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>🧠 Wellbeing Settings</h3>
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Like-Free Mode</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Hide like counts on all posts</div></div>
            <label className="toggle"><input type="checkbox" checked={form.likeFreeModeEnabled} onChange={e => setForm({ ...form, likeFreeModeEnabled: e.target.checked })} /><span className="toggle-slider"></span></label>
          </div>
          <div className="divider"></div>
          <div className="flex items-center justify-between">
            <div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Slow Feed</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Limit feed refreshes to reduce doomscrolling</div></div>
            <label className="toggle"><input type="checkbox" checked={form.slowFeedEnabled} onChange={e => setForm({ ...form, slowFeedEnabled: e.target.checked })} /><span className="toggle-slider"></span></label>
          </div>
          {form.slowFeedEnabled && (
            <div className="form-group">
              <label className="form-label">Max feed refreshes per session</label>
              <input type="number" className="form-input" value={form.feedRefreshLimit} onChange={e => setForm({ ...form, feedRefreshLimit: parseInt(e.target.value) })} min={5} max={100} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner spinner-sm"></span> : 'Save Changes'}</button>
        <button className="btn btn-danger" onClick={handleLogout}><HiLogout /> Log Out</button>
      </div>
    </div>
  );
};

export default Settings;
