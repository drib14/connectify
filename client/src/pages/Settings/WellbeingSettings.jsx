import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi';
import { FaBrain } from 'react-icons/fa';

const WellbeingSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    likeFreeModeEnabled: user?.likeFreeModeEnabled || false,
    slowFeedEnabled: user?.slowFeedEnabled || false,
    feedRefreshLimit: user?.feedRefreshLimit || 20,
    dailyLimitMinutes: user?.socialBurnoutSettings?.dailyLimitMinutes || 60,
    breakReminderMinutes: user?.socialBurnoutSettings?.breakReminderMinutes || 20,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        likeFreeModeEnabled: form.likeFreeModeEnabled,
        slowFeedEnabled: form.slowFeedEnabled,
        feedRefreshLimit: form.feedRefreshLimit,
        socialBurnoutSettings: {
          dailyLimitMinutes: parseInt(form.dailyLimitMinutes) || 60,
          breakReminderMinutes: parseInt(form.breakReminderMinutes) || 20,
        }
      };

      const { data } = await API.put('/users/profile', payload);
      updateUser(data);
      toast.success('Wellbeing settings saved!');
    } catch (e) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ marginBottom: 'var(--space-md)' }}>
        <HiArrowLeft /> Back to Settings
      </button>

      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <FaBrain /> Wellbeing & Limits
      </h1>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Feed Preferences</h3>
        
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Like-Free Mode</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Hide like counts on all posts to reduce validation addiction.</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.likeFreeModeEnabled} onChange={e => setForm({ ...form, likeFreeModeEnabled: e.target.checked })} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="divider"></div>

          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Slow Feed</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Limit feed refreshes per session to discourage infinite scrolling.</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.slowFeedEnabled} onChange={e => setForm({ ...form, slowFeedEnabled: e.target.checked })} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {form.slowFeedEnabled && (
            <div className="form-group animate-fade-in" style={{ marginTop: '8px' }}>
              <label className="form-label">Max feed refreshes per session</label>
              <input type="number" className="form-input" value={form.feedRefreshLimit} onChange={e => setForm({ ...form, feedRefreshLimit: parseInt(e.target.value) })} min={5} max={100} />
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Doomscroll Prevention</h3>
        
        <div className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Daily Screen Time Limit (Minutes)</label>
            <input type="number" className="form-input" value={form.dailyLimitMinutes} onChange={e => setForm({ ...form, dailyLimitMinutes: e.target.value })} min={10} max={480} />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>We will nudge you to take a break when you hit this limit.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Interval for Break Reminders (Minutes)</label>
            <input type="number" className="form-input" value={form.breakReminderMinutes} onChange={e => setForm({ ...form, breakReminderMinutes: e.target.value })} min={5} max={120} />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>Receive soft alerts at this set frequency.</span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>
        {saving ? <span className="spinner spinner-sm"></span> : 'Save Changes'}
      </button>
    </div>
  );
};

export default WellbeingSettings;
