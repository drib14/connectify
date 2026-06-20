import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiPlus,
  HiCheckCircle,
  HiThumbUp,
  HiChat,
  HiQuestionMarkCircle,
  HiInbox,
  HiStar
} from 'react-icons/hi';
import { FaTrophy, FaCheckCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import Modal from '../../components/UI/Modal';

const Questions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'other', tags: '' });
  const [expandedQ, setExpandedQ] = useState(null);
  const [answerContent, setAnswerContent] = useState('');

  useEffect(() => {
    API.get('/questions')
      .then(({ data }) => setQuestions(data.questions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required.');
    try {
      const body = { ...form, tags: form.tags ? JSON.stringify(form.tags.split(',').map(t => t.trim())) : '[]' };
      await API.post('/questions', body);
      toast.success('Question posted!');
      setShowCreate(false);
      setForm({ title: '', content: '', category: 'other', tags: '' });
      API.get('/questions').then(({ data }) => setQuestions(data.questions));
    } catch (e) {
      toast.error('Failed.');
    }
  };

  const handleAnswer = async (qId) => {
    if (!answerContent.trim()) return;
    try {
      await API.post(`/questions/${qId}/answer`, { content: answerContent });
      toast.success('Answer posted! +5 contribution pts');
      setAnswerContent('');
      const { data } = await API.get('/questions');
      setQuestions(data.questions);
    } catch (e) {
      toast.error('Failed.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HiQuestionMarkCircle /> Q&A Hub
        </h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <HiPlus /> Ask Question
        </button>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Ask a Question">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <input className="form-input" placeholder="Question title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input form-textarea" placeholder="Details..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} />
          <div className="flex gap-sm">
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {['tech', 'science', 'arts', 'health', 'business', 'education', 'lifestyle', 'other'].map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <input className="form-input" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary w-full">Post Question</button>
        </form>
      </Modal>

      {loading ? (
        <SkeletonLoader type="feed" count={3} />
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiInbox />
          </div>
          <div className="empty-state-title">No questions yet</div>
          <div className="empty-state-text">Be the first to ask!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {questions.map(q => (
            <div key={q._id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpandedQ(expandedQ === q._id ? null : q._id)}>
              <div className="flex items-start gap-md">
                <div style={{ textAlign: 'center', minWidth: 50 }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--primary)' }}>{q.answers?.length || 0}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>answers</div>
                </div>
                <div className="flex-1">
                  <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{q.title}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>Asked by {q.author?.firstName} {q.author?.lastName}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}</span>
                    <span>·</span>
                    <span>{q.views} views</span>
                    {q.rewardPoints > 0 && (
                      <span className="badge badge-warm" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <FaTrophy style={{ fontSize: '10px' }} /> {q.rewardPoints} pts
                      </span>
                    )}
                  </div>
                  {q.tags?.length > 0 && (
                    <div className="flex gap-xs" style={{ marginTop: 8 }}>
                      {q.tags.map(t => (
                        <span key={t} className="badge badge-secondary">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`badge ${q.status === 'closed' ? 'badge-success' : q.status === 'answered' ? 'badge-primary' : 'badge-warm'}`}>
                  {q.status}
                </span>
              </div>

              {expandedQ === q._id && (
                <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }} onClick={e => e.stopPropagation()}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>{q.content}</p>
                  {q.answers?.map(a => (
                    <div
                      key={a._id}
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        background: a._id === q.bestAnswer ? 'rgba(34,197,94,0.08)' : 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-xs)',
                        borderLeft: a._id === q.bestAnswer ? '3px solid var(--success)' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-xs" style={{ marginBottom: 4 }}>
                        <strong style={{ fontSize: 'var(--text-sm)' }}>{a.author?.firstName} {a.author?.lastName}</strong>
                        {a._id === q.bestAnswer && (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <FaCheckCircle /> Best
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{a.content}</p>
                    </div>
                  ))}
                  <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)' }}>
                    <input className="form-input flex-1" placeholder="Write your answer..." value={answerContent} onChange={e => setAnswerContent(e.target.value)} />
                    <button className="btn btn-primary btn-sm" onClick={() => handleAnswer(q._id)}>Answer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questions;
