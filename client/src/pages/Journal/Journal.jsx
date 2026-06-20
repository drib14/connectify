import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const moodOptions = [
  { value: 'great', emoji: '😄', label: 'Great', color: '#22c55e' },
  { value: 'good', emoji: '🙂', label: 'Good', color: '#00d4aa' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#f59e0b' },
  { value: 'low', emoji: '😔', label: 'Low', color: '#f97316' },
  { value: 'bad', emoji: '😢', label: 'Bad', color: '#ef4444' },
];

const Journal = () => {
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ mood: 'okay', reflection: '', gratitude: '', goals: '' });

  useEffect(() => { API.get('/journal').then(({ data }) => setJournal(data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const body = { mood: form.mood, reflection: form.reflection, gratitude: form.gratitude ? form.gratitude.split('\n').filter(Boolean) : [], goals: form.goals ? form.goals.split('\n').filter(Boolean) : [] };
      await API.post('/journal/entry', body);
      toast.success('Journal entry saved! 📝');
      setShowCreate(false); setForm({ mood: 'okay', reflection: '', gratitude: '', goals: '' });
      API.get('/journal').then(({ data }) => setJournal(data));
    } catch (e) { toast.error('Failed.'); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2">📔 Reflection Journal</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>✏️ New Entry</button>
      </div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>Your private space to reflect on your week, track your mood, and grow. Only you can see this.</p>

      {showCreate && (
        <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-lg)' }}>
          <form onSubmit={handleCreate} className="flex flex-col gap-md">
            <div>
              <label className="form-label" style={{ marginBottom: 8 }}>How are you feeling?</label>
              <div className="flex gap-sm">
                {moodOptions.map(m => (
                  <button key={m.value} type="button" className={`card ${form.mood === m.value ? 'card-elevated' : ''}`} onClick={() => setForm({ ...form, mood: m.value })} style={{ padding: 'var(--space-sm) var(--space-md)', cursor: 'pointer', textAlign: 'center', border: form.mood === m.value ? `2px solid ${m.color}` : undefined, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 24 }}>{m.emoji}</div>
                    <div style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reflection</label>
              <textarea className="form-input form-textarea" placeholder="What's on your mind? How was your week?" value={form.reflection} onChange={e => setForm({ ...form, reflection: e.target.value })} rows={5} />
            </div>
            <div className="form-group">
              <label className="form-label">Gratitude (one per line)</label>
              <textarea className="form-input" placeholder="What are you grateful for?" value={form.gratitude} onChange={e => setForm({ ...form, gratitude: e.target.value })} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Goals for next week (one per line)</label>
              <textarea className="form-input" placeholder="What do you want to accomplish?" value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} rows={3} />
            </div>
            <button type="submit" className="btn btn-primary">Save Entry</button>
          </form>
        </div>
      )}

      {loading ? <div className="loader"><div className="spinner spinner-lg"></div></div> : !journal?.entries?.length ? (
        <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-title">No entries yet</div><div className="empty-state-text">Start journaling to track your growth and wellbeing.</div></div>
      ) : (
        <div className="flex flex-col gap-md">
          {[...journal.entries].reverse().map((entry, i) => {
            const mood = moodOptions.find(m => m.value === entry.mood);
            return (
              <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="flex items-center gap-sm">
                    <span style={{ fontSize: 28 }}>{mood?.emoji || '😐'}</span>
                    <div><div style={{ fontWeight: 600 }}>{mood?.label || 'Okay'}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{new Date(entry.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
                  </div>
                </div>
                {entry.reflection && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-sm)', whiteSpace: 'pre-wrap' }}>{entry.reflection}</p>}
                {entry.gratitude?.length > 0 && <div style={{ marginBottom: 'var(--space-sm)' }}><strong style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>🙏 Grateful for:</strong>{entry.gratitude.map((g, j) => <div key={j} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', paddingLeft: 16 }}>• {g}</div>)}</div>}
                {entry.goals?.length > 0 && <div><strong style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary)' }}>🎯 Goals:</strong>{entry.goals.map((g, j) => <div key={j} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', paddingLeft: 16 }}>• {g}</div>)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Journal;
