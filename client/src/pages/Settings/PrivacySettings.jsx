import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { HiArrowLeft, HiShieldCheck, HiLockClosed, HiEye } from 'react-icons/hi';
import { FaUserShield, FaUsers, FaChartPie } from 'react-icons/fa';
import SkeletonLoader from '../../components/UI/SkeletonLoader';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/users/privacy-dashboard');
        setData(res.data);
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ marginBottom: 'var(--space-md)' }}>
          <HiArrowLeft /> Back to Settings
        </button>
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  const postsByVisibility = data?.postsByVisibility || [];
  const circles = data?.trustCircles || { family: 0, friends: 0, coworkers: 0, classmates: 0 };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ marginBottom: 'var(--space-md)' }}>
        <HiArrowLeft /> Back to Settings
      </button>

      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <FaUserShield /> Privacy Dashboard
      </h1>
      <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
        Connectify shows you exactly who can see what. Here is your platform visibility overview.
      </p>

      {/* Trust Circles Visual Counters */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FaUsers /> Trust Circles Members
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {Object.entries(circles).map(([key, val]) => (
            <div key={key} className="card" style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{key}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Link to="/trust-circles" className="auth-link" style={{ fontSize: 'var(--text-sm)' }}>Manage trust circles →</Link>
        </div>
      </div>

      {/* Posts Visibility Overview */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FaChartPie /> Content Visibility Breakdown
        </h3>
        {postsByVisibility.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No posts published yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {postsByVisibility.map((item) => {
              const totalPosts = postsByVisibility.reduce((acc, curr) => acc + curr.count, 0);
              const percentage = totalPosts > 0 ? Math.round((item.count * 100) / totalPosts) : 0;
              return (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ width: '100px', fontSize: '13px', textTransform: 'capitalize', fontWeight: 600 }}>{item._id}</span>
                  <div style={{ flex: 1 }}>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                  <span style={{ width: '80px', textAlign: 'right', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {item.count} posts ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legacy Status */}
      <div className="card">
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HiLockClosed /> Security & Credentials
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          All visibility policies are strictly isolated by cryptographic tokens (JWTs) and stored in secure clusters. 
          Default post settings are mapped to public visibility, but can be locked down to circular sharing at any time.
        </p>
      </div>
    </div>
  );
};

export default PrivacySettings;
