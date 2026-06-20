import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiHeart } from 'react-icons/hi';

const LegacySettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const getInitialContact = () => {
    const tc = user?.digitalLegacy?.trustedContact;
    if (!tc) return '';
    if (typeof tc === 'object') {
      return tc.email || tc.username || '';
    }
    return tc;
  };

  const [form, setForm] = useState({
    enabled: user?.digitalLegacy?.enabled || false,
    action: user?.digitalLegacy?.action || 'memorialize',
    trustedContact: getInitialContact(),
    message: user?.digitalLegacy?.message || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/users/digital-legacy', form);
      updateUser({ digitalLegacy: data });
      toast.success('Digital legacy plan updated!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update legacy settings.');
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
        <HiHeart /> Digital Legacy Management
      </h1>
      <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
        Plan what happens to your digital identity and account assets in the event of inactivity or passing.
      </p>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Legacy Action Policy</h3>
        
        <div className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Action to Take</label>
            <select
              className="form-input"
              value={form.action}
              onChange={e => setForm({ ...form, action: e.target.value })}
            >
              <option value="memorialize">Memorialize Account (Freeze profile, keep content public)</option>
              <option value="delete">Permanently Delete Account & Data</option>
              <option value="transfer">Transfer Ownership to Trusted Contact</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Trusted Contact (Email or Username)</label>
            <input
              type="text"
              className="form-input"
              placeholder="trustee@email.com or username"
              value={form.trustedContact}
              onChange={e => setForm({ ...form, trustedContact: e.target.value })}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              We will notify this contact before executing the memorialization, deletion, or transfer action.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Personal Message to Legatee</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Instructions or farewell note..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>
        {saving ? <span className="spinner spinner-sm"></span> : 'Save Legacy Plan'}
      </button>
    </div>
  );
};

export default LegacySettings;
