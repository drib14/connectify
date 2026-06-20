import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiUserGroup,
  HiHome,
  HiFlag,
  HiChat,
  HiPuzzle,
  HiInbox,
  HiAcademicCap,
  HiLightBulb,
  HiExclamation,
  HiClock
} from 'react-icons/hi';
import { FaCheckCircle, FaWrench, FaRocket, FaSyncAlt, FaHandshake, FaAward } from 'react-icons/fa';
import SkeletonLoader from '../../components/UI/SkeletonLoader';

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
  volunteer: { icon: FaHandshake, color: 'var(--success)' },
  crisis: { icon: HiExclamation, color: 'var(--error)' },
  knowledge: { icon: HiLightBulb, color: 'var(--warm)' },
};

const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [solutionContent, setSolutionContent] = useState('');
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiContent, setWikiContent] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/communities/${id}`);
        setCommunity(data);
      } catch (e) {
        toast.error('Not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddSolution = async () => {
    if (!solutionContent.trim()) return;
    try {
      const { data } = await API.post(`/communities/${id}/solution`, { content: solutionContent });
      setCommunity(prev => ({ ...prev, problemData: data }));
      setSolutionContent('');
      toast.success('Solution added! +15 contribution points');
    } catch (e) {
      toast.error('Failed.');
    }
  };

  const handleAddWiki = async () => {
    if (!wikiTitle.trim() || !wikiContent.trim()) return;
    try {
      const { data } = await API.post(`/communities/${id}/wiki`, { title: wikiTitle, content: wikiContent });
      setCommunity(prev => ({ ...prev, wiki: data }));
      setWikiTitle('');
      setWikiContent('');
      toast.success('Wiki page added!');
    } catch (e) {
      toast.error('Failed.');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <HiInbox />
        </div>
        <div className="empty-state-title">Community not found</div>
      </div>
    );
  }

  const isMember = community.members?.some(m => m.user?._id === user?._id || m.user === user?._id);
  const CommIcon = typeConfig[community.type]?.icon || HiChat;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-xl)' }}>
        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
          <span style={{ fontSize: 36, display: 'inline-flex', color: typeConfig[community.type]?.color || 'var(--primary)' }}>
            <CommIcon />
          </span>
          <div className="flex-1">
            <h1 className="heading-2">{community.name}</h1>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              {community.memberCount} members · {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
            </div>
          </div>
          {!isMember && (
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await API.post(`/communities/${id}/join`);
                  toast.success('Joined!');
                  setCommunity(prev => ({ ...prev, memberCount: prev.memberCount + 1 }));
                } catch (e) {
                  toast.error('Failed');
                }
              }}
            >
              Join
            </button>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{community.description}</p>
        {community.impactMetrics && (
          <div className="flex gap-xl" style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
            <div className="text-center">
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--primary)' }}>
                {community.impactMetrics.problemsSolved}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Problems Solved</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--secondary)' }}>
                {community.impactMetrics.volunteersEngaged}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Volunteers</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--accent)' }}>
                {community.impactMetrics.knowledgeArticles}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Wiki Articles</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--warm)' }}>
                {community.impactMetrics.eventsHosted}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Events</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
        {['about', 'solutions', 'wiki', 'members', 'votes'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Solutions (Problem Solving Hub) */}
      {activeTab === 'solutions' && community.type === 'problemSolving' && (
        <div>
          {community.problemData?.problemStatement && (
            <div className="card" style={{ marginBottom: 'var(--space-md)', borderLeft: '3px solid var(--accent)' }}>
              <h4>Problem Statement</h4>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{community.problemData.problemStatement}</p>
              <span className="badge badge-accent" style={{ marginTop: 8 }}>{community.problemData.status}</span>
            </div>
          )}
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Propose a Solution</h4>
            <textarea className="form-input form-textarea" placeholder="Your solution..." value={solutionContent} onChange={e => setSolutionContent(e.target.value)} rows={3} />
            <button className="btn btn-primary" style={{ marginTop: 'var(--space-sm)' }} onClick={handleAddSolution}>Submit Solution</button>
          </div>
          {community.problemData?.solutions?.map((s, i) => (
            <div key={i} className="card" style={{ marginBottom: 'var(--space-sm)' }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                <div className="avatar avatar-sm avatar-placeholder">
                  {s.author?.firstName?.[0]}
                  {s.author?.lastName?.[0]}
                </div>
                <strong style={{ fontSize: 'var(--text-sm)' }}>{s.author?.firstName} {s.author?.lastName}</strong>
                {s.isAccepted && (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <FaCheckCircle /> Accepted
                  </span>
                )}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Wiki */}
      {activeTab === 'wiki' && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Add Wiki Page</h4>
            <input className="form-input" placeholder="Title" value={wikiTitle} onChange={e => setWikiTitle(e.target.value)} style={{ marginBottom: 8 }} />
            <textarea className="form-input form-textarea" placeholder="Content..." value={wikiContent} onChange={e => setWikiContent(e.target.value)} rows={4} />
            <button className="btn btn-primary" style={{ marginTop: 'var(--space-sm)' }} onClick={handleAddWiki}>Add Page</button>
          </div>
          {community.wiki?.map((page, i) => (
            <div key={i} className="card" style={{ marginBottom: 'var(--space-sm)' }}>
              <h4>{page.title}</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 8, whiteSpace: 'pre-wrap' }}>{page.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {activeTab === 'members' && (
        <div className="flex flex-col gap-xs">
          {community.members?.map((m, i) => (
            <div key={i} className="card flex items-center justify-between" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
              <div className="flex items-center gap-sm">
                {m.user?.avatar ? (
                  <img src={m.user.avatar} className="avatar avatar-sm" alt="" />
                ) : (
                  <div className="avatar avatar-sm avatar-placeholder">
                    {m.user?.firstName?.[0]}
                    {m.user?.lastName?.[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{m.user?.firstName} {m.user?.lastName}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>@{m.user?.username}</div>
                </div>
              </div>
              <span className="badge badge-primary">{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* About */}
      {activeTab === 'about' && (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{community.description || 'No description provided.'}</p>
          {community.sharedGoal?.title && (
            <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
              <h4 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><HiFlag /> Shared Goal</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 8 }}>{community.sharedGoal.title}</p>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-bar-fill" style={{ width: `${community.sharedGoal.progress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'votes' && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FaAward />
          </div>
          <div className="empty-state-title">Community Voting</div>
          <div className="empty-state-text">Create polls and vote on community decisions.</div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;
