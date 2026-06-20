import React from 'react';
import { Edit2, Upload, Crown, UserPlus } from 'lucide-react';
import PostCard from '../../components/features/posts/PostCard';

export default function ProfilePage({
  profileData,
  user,
  coverPicFile,
  setCoverPicFile,
  profilePicFile,
  setProfilePicFile,
  editBio,
  setEditBio,
  handleFollowToggle,
  handleFriendRequest,
  handleProfileUpdate,
  posts,
  handleDeletePost,
  handleSelectProfile,
  API_BASE
}) {
  if (!profileData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Profile Card Header */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {/* Cover Image */}
        <div style={{ height: '220px', background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', position: 'relative' }}>
          {profileData.coverPic && (
            <img src={profileData.coverPic} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {profileData._id === user.id && (
            <label style={{ position: 'absolute', bottom: '12px', right: '12px', padding: '6px 12px', borderRadius: '4px', background: 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit2 size={12} />
              <span>Edit Cover</span>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if (file) setCoverPicFile(file);
              }} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Info block */}
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-60px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <div className="avatar-container" style={{ position: 'relative' }}>
              <img 
                src={profileData.profilePic || '/default-avatar.png'} 
                alt={profileData.username} 
                className={`avatar ${profileData.isPremium ? 'premium-avatar' : ''}`}
                style={{ width: '110px', height: '110px', background: 'var(--bg-secondary)', border: '4px solid var(--bg-primary)' }}
              />
              {profileData.isPremium && <div className="premium-crown-tag" style={{ width: '22px', height: '22px', fontSize: '10px' }}>👑</div>}
              {profileData._id === user.id && (
                <label style={{ position: 'absolute', bottom: '0', right: '0', padding: '4px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', cursor: 'pointer' }}>
                  <Upload size={12} />
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) setProfilePicFile(file);
                  }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {profileData.username}
                {profileData.isPremium && <Crown size={18} color="var(--premium-gold)" />}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Spark points: {profileData.sparkPoints || 0} SP
              </span>
            </div>
          </div>

          {/* Actions buttons for relationship */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {profileData._id !== user.id ? (
              <>
                <button 
                  onClick={() => handleFollowToggle(profileData)}
                  className={profileData.followers.includes(user.id) ? 'btn-secondary' : 'btn-primary'}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  {profileData.followers.includes(user.id) ? 'Unfollow' : 'Follow'}
                </button>

                {profileData.friends.some(f => f._id === user.id) ? (
                  <button 
                    onClick={() => handleFriendRequest(profileData, 'unfriend')}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-danger)' }}
                  >
                    Unfriend
                  </button>
                ) : profileData.friendRequests.some(r => r.sender === user.id && r.status === 'pending') ? (
                  <button disabled className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', opacity: 0.6 }}>
                    Requested
                  </button>
                ) : (
                  <button 
                    onClick={() => handleFriendRequest(profileData, 'send')}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <UserPlus size={14} />
                    <span>Add Friend</span>
                  </button>
                )}
              </>
            ) : (
              (profilePicFile || coverPicFile || editBio !== profileData.bio) && (
                <button onClick={handleProfileUpdate} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  Save Profile Changes
                </button>
              )
            )}
          </div>
        </div>

        {/* Bio card */}
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Biography</h4>
          {profileData._id === user.id ? (
            <input
              type="text"
              placeholder="Write a custom bio description..."
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              style={{ width: '100%', fontSize: '13px', padding: '6px 10px' }}
            />
          ) : (
            <p style={{ fontSize: '13px' }}>{profileData.bio || 'This connectify user is silent.'}</p>
          )}
        </div>

      </div>

      {/* Profile detail split */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Left panel friends list */}
        <div className="glass-panel" style={{ padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>
            Connections ({profileData.friends?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(profileData.friends || []).map(friend => (
              <div
                key={friend._id}
                onClick={() => handleSelectProfile(friend.username)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                className="sidebar-link"
              >
                <img src={friend.profilePic || '/default-avatar.png'} alt={friend.username} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <span style={{ fontSize: '12.5px', fontWeight: '500' }}>{friend.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right profile posts feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {posts.filter(p => p.user._id === profileData._id).map(p => (
            <PostCard
              key={p._id}
              post={p}
              user={user}
              onDelete={handleDeletePost}
              onSelectProfile={handleSelectProfile}
              API_BASE={API_BASE}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
