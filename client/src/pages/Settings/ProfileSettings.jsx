import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiUserCircle, HiPhotograph } from 'react-icons/hi';
import ProgressLoader from '../../components/UI/ProgressLoader';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    setUploadVisible(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('coverPhoto', coverFile);

      const { data } = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      });
      updateUser(data);
      toast.success('Profile settings saved!');
      setAvatarFile(null);
      setCoverFile(null);
    } catch (e) {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        setUploadVisible(false);
      }, 600);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <ProgressLoader progress={uploadProgress} visible={uploadVisible} statusText="Saving profile settings..." />

      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ marginBottom: 'var(--space-md)' }}>
        <HiArrowLeft /> Back to Settings
      </button>

      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)' }}>Edit Profile</h1>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Photos</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Avatar Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => document.getElementById('avatar-input').click()}>
                <HiUserCircle style={{ fontSize: '20px' }} /> Choose Avatar
              </button>
              <input type="file" id="avatar-input" accept="image/*" style={{ display: 'none' }} onChange={e => setAvatarFile(e.target.files[0])} />
              {avatarFile && <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{avatarFile.name}</span>}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label className="form-label">Cover Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => document.getElementById('cover-input').click()}>
                <HiPhotograph style={{ fontSize: '20px' }} /> Choose Cover
              </button>
              <input type="file" id="cover-input" accept="image/*" style={{ display: 'none' }} onChange={e => setCoverFile(e.target.files[0])} />
              {coverFile && <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{coverFile.name}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-md">
          <div className="flex gap-sm">
            <div className="form-group flex-1">
              <label className="form-label">First Name</label>
              <input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>
      </div>

      <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>
        {saving ? <span className="spinner spinner-sm"></span> : 'Save Changes'}
      </button>
    </div>
  );
};

export default ProfileSettings;
