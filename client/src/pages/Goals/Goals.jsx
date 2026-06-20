import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiPlus,
  HiCheckCircle,
  HiClock,
  HiTrendingUp,
  HiAcademicCap,
  HiBriefcase,
  HiLightBulb,
  HiUsers,
  HiHeart,
  HiTag,
  HiInbox
} from 'react-icons/hi';
import { FaFire, FaPause, FaDumbbell, FaPalette, FaCoins } from 'react-icons/fa';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import Modal from '../../components/UI/Modal';

const categoryConfig = {
  fitness: { icon: FaDumbbell, color: '#ef4444' },
  education: { icon: HiAcademicCap, color: '#0ea5e9' },
  career: { icon: HiBriefcase, color: '#f59e0b' },
  personal: { icon: HiLightBulb, color: '#10b981' },
  creative: { icon: FaPalette, color: '#a855f7' },
  financial: { icon: FaCoins, color: '#22c55e' },
  social: { icon: HiUsers, color: '#ec4899' },
  health: { icon: HiHeart, color: '#ef4444' },
  other: { icon: HiTag, color: '#64748b' }
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', targetDate: '', isPublic: true });
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    try {
      const { data } = await API.get(`/goals/mine?status=${filter}`);
      setGoals(data);
    } catch (e) {
      toast.error('Failed to load goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required.');
    try {
      await API.post('/goals', form);
      toast.success('Goal created!');
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'personal', targetDate: '', isPublic: true });
      fetchGoals();
    } catch (e) {
      toast.error('Failed.');
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      await API.put(`/goals/${id}/progress`, { progress });
      toast.success(progress >= 100 ? 'Goal completed! +20 pts' : 'Progress updated!');
      fetchGoals();
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HiTrendingUp /> Goals
        </h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <HiPlus /> New Goal
        </button>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Goal">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <input className="form-input" placeholder="Goal title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input form-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="flex gap-sm">
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {Object.keys(categoryConfig).map((k) => (
                <option key={k} value={k}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </option>
              ))}
            </select>
            <input type="date" className="form-input" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">Create Goal</button>
        </form>
      </Modal>

      <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className={`tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <FaFire /> Active
        </button>
        <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <HiCheckCircle /> Completed
        </button>
        <button className={`tab ${filter === 'paused' ? 'active' : ''}`} onClick={() => setFilter('paused')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <FaPause /> Paused
        </button>
      </div>

      {loading ? (
        <SkeletonLoader type="goal" count={4} />
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiInbox />
          </div>
          <div className="empty-state-title">No {filter} goals</div>
          <div className="empty-state-text">Create a goal and start tracking your progress!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {goals.map(goal => {
            const CatIcon = categoryConfig[goal.category]?.icon || HiTag;
            return (
              <div key={goal._id} className="card card-interactive">
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="flex items-center gap-sm">
                    <span style={{ fontSize: 24, display: 'inline-flex', color: categoryConfig[goal.category]?.color }}>
                      <CatIcon />
                    </span>
                    <div>
                      <h3 style={{ fontWeight: 600 }}>{goal.title}</h3>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)} · {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline'}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${goal.status === 'completed' ? 'badge-success' : goal.status === 'active' ? 'badge-primary' : 'badge-warm'}`}>
                    {goal.status}
                  </span>
                </div>
                {goal.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>{goal.description}</p>}
                <div className="flex items-center gap-md">
                  <div className="flex-1">
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary)' }}>{goal.progress}%</span>
                </div>
                {goal.status === 'active' && (
                  <div className="flex gap-xs" style={{ marginTop: 'var(--space-sm)' }}>
                    {[25, 50, 75, 100].map(p => <button key={p} className="btn btn-ghost btn-sm" onClick={() => updateProgress(goal._id, p)}>{p}%</button>)}
                  </div>
                )}
                {goal.accountabilityPartner && (
                  <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <HiUsers /> Partner: {goal.accountabilityPartner.firstName} {goal.accountabilityPartner.lastName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
