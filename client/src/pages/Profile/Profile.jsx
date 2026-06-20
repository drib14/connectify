import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiUserAdd,
  HiUserRemove,
  HiLocationMarker,
  HiLink,
  HiBadgeCheck,
  HiStar,
  HiCode,
  HiPhotograph,
  HiDocumentText,
  HiInbox,
  HiCamera
} from 'react-icons/hi';
import { FaAward, FaTrophy, FaStar } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.username === username;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);

    const toastId = toast.loading('Uploading avatar...');
    try {
      const { data } = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, avatar: data.avatar }));
      updateUser({ avatar: data.avatar });
      toast.success('Avatar updated!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload avatar.', { id: toastId });
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('coverPhoto', file);

    const toastId = toast.loading('Uploading cover photo...');
    try {
      const { data } = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, coverPhoto: data.coverPhoto }));
      updateUser({ coverPhoto: data.coverPhoto });
      toast.success('Cover photo updated!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload cover photo.', { id: toastId });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          API.get(`/users/profile/${username}`),
          API.get(`/posts/user/${username}`),
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data);
      } catch (e) {
        toast.error('Profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      const { data } = await API.post(`/users/follow/${profile._id}`);
      setProfile(prev => ({
        ...prev,
        followerCount: data.following ? prev.followerCount + 1 : prev.followerCount - 1,
        followers: data.following ? [...(prev.followers || []), currentUser._id] : (prev.followers || []).filter(id => id !== currentUser._id),
      }));
      toast.success(data.following ? 'Following!' : 'Unfollowed.');
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

  if (!profile) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <HiInbox />
        </div>
        <div className="empty-state-title">User not found</div>
      </div>
    );
  }

  const isFollowing = profile.followers?.includes(currentUser?._id);

  return (
    <div className="profile-page">
      {/* Cover & Avatar */}
      <div className="profile-cover">
        {profile.coverPhoto ? (
          <img src={profile.coverPhoto} alt="Cover" className="profile-cover-img" />
        ) : (
          <div className="profile-cover-placeholder" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-dark), var(--secondary-dark))' }}></div>
        )}
        <div className="profile-cover-overlay"></div>
        {isOwnProfile && (
          <label className="profile-cover-edit-btn" style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 5, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.2s' }}>
            <HiPhotograph /> Change Cover
            <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      <div className="profile-info-section">
        <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
          <div className="profile-avatar-container" style={{ position: 'relative', borderRadius: '50%', overflow: 'hidden', border: profile.isPremium ? '4px solid #d946ef' : '4px solid var(--bg-primary)', display: 'inline-block' }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.firstName} className="avatar avatar-3xl profile-avatar" style={{ border: 'none' }} />
            ) : (
              <div className="avatar avatar-3xl avatar-placeholder profile-avatar" style={{ fontSize: '2.5rem', border: 'none' }}>
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </div>
            )}
            {isOwnProfile && (
              <label className="profile-avatar-edit-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}>
                <HiCamera style={{ fontSize: '24px' }} />
                <span style={{ fontSize: '10px', marginTop: '4px' }}>Edit</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-name-row">
            <h1 className="heading-2">{profile.firstName} {profile.lastName}</h1>
            {profile.authenticityBadges?.length > 0 && <HiBadgeCheck className="profile-verified-icon" />}
          </div>
          <p className="profile-username">@{profile.username}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-meta">
            {profile.location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <HiLocationMarker /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <HiLink /> Website
              </a>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <HiStar style={{ color: 'var(--warm)' }} /> {profile.contributionScore} Contribution Score
            </span>
          </div>

          <div className="profile-stats">
            <div className="profile-stat"><strong>{profile.postCount}</strong><span>Posts</span></div>
            <div className="profile-stat"><strong>{profile.followerCount}</strong><span>Followers</span></div>
            <div className="profile-stat"><strong>{profile.followingCount}</strong><span>Following</span></div>
          </div>

          {!isOwnProfile && (
            <div className="profile-actions">
              <button className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} onClick={handleFollow} id="follow-btn">
                {isFollowing ? <><HiUserRemove /> Unfollow</> : <><HiUserAdd /> Follow</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div className="profile-skills">
          <h3 className="heading-4">Skills</h3>
          <div className="profile-skills-list">{profile.skills.map(s => <span key={s} className="tag">{s}</span>)}</div>
        </div>
      )}

      {/* Skill Showcase */}
      {profile.skillShowcase?.length > 0 && (
        <div className="profile-showcase">
          <h3 className="heading-4" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><HiCode /> Skill Showcase</h3>
          <div className="profile-showcase-grid">
            {profile.skillShowcase.map((item, i) => (
              <div key={i} className="card card-interactive showcase-card">
                {item.media?.[0] && <img src={item.media[0]} alt={item.title} className="showcase-media" />}
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {item.tags?.length > 0 && <div className="showcase-tags">{item.tags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}</div>}
                {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="auth-link">View Project →</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Posts */}
      <div className="profile-content">
        <div className="tabs">
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts
          </button>
          <button className={`tab ${activeTab === 'showcase' ? 'active' : ''}`} onClick={() => setActiveTab('showcase')}>
            Showcase
          </button>
          <button className={`tab ${activeTab === 'badges' ? 'active' : ''}`} onClick={() => setActiveTab('badges')}>
            Badges
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="feed-posts" style={{ marginTop: 'var(--space-lg)' }}>
            {posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <HiDocumentText />
                </div>
                <div className="empty-state-title">No posts yet</div>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="card post-card">
                  <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{post.content}</p>
                  <div className="post-meta" style={{ marginTop: 'var(--space-sm)' }}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} · <HiStar style={{ color: 'var(--warm)', display: 'inline', verticalAlign: 'text-top' }} /> {post.likes?.length || 0} · <HiInbox style={{ display: 'inline', verticalAlign: 'text-top' }} /> {post.comments?.length || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="profile-badges-grid" style={{ marginTop: 'var(--space-lg)' }}>
            {profile.authenticityBadges?.length > 0 ? (
              profile.authenticityBadges.map((b, i) => (
                <div key={i} className="card badge-card">
                  <span className="badge-icon">
                    <FaAward />
                  </span>
                  <strong>{b.name}</strong>
                  <span>{b.description}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaTrophy />
                </div>
                <div className="empty-state-title">No badges yet</div>
                <div className="empty-state-text">Earn badges through authentic participation!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
