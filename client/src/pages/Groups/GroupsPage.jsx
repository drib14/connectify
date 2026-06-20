import React from 'react';
import { Users, Shield, Plus } from 'lucide-react';
import PostCard from '../../components/features/posts/PostCard';

export default function GroupsPage({
  groups,
  selectedGroup,
  setSelectedGroup,
  handleCreateGroup,
  newGroupName,
  setNewGroupName,
  newGroupDesc,
  setNewGroupDesc,
  newGroupPrivacy,
  setNewGroupPrivacy,
  handleJoinGroup,
  handleLeaveGroup,
  handleSelectGroup,
  handleApproveMember,
  handleAddGroupRule,
  newGroupRule,
  setNewGroupRule,
  groupPostContent,
  setGroupPostContent,
  handlePostInGroup,
  user,
  allUsers,
  handleDeletePost,
  handleSelectProfile,
  API_BASE
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: '100%' }}>
      {/* Directory Sidebar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>Groups Hub</h3>
          <button onClick={() => setSelectedGroup(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>Browse</button>
        </div>

        {/* Create Group Form */}
        <form onSubmit={handleCreateGroup} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Create New Group:</span>
          <input type="text" placeholder="Group Name..." value={newGroupName} onChange={e => setNewGroupName(e.target.value)} style={{ fontSize: '12px', height: '32px' }} required />
          <input type="text" placeholder="Description..." value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} style={{ fontSize: '12px', height: '32px' }} />
          <select value={newGroupPrivacy} onChange={e => setNewGroupPrivacy(e.target.value)} style={{ fontSize: '11px', height: '32px' }}>
            <option value="public">🔓 Public Group</option>
            <option value="private">🔒 Private Group</option>
          </select>
          <button type="submit" className="btn-primary" style={{ padding: '4px', fontSize: '11px' }}>Create Group</button>
        </form>

        {/* Group Listing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Groups Directories:</span>
          {groups.map(g => (
            <div 
              key={g._id}
              onClick={() => handleSelectGroup(g._id)}
              className={`sidebar-link ${selectedGroup && selectedGroup._id === g._id ? 'active' : ''}`}
              style={{ padding: '8px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
            >
              <Users size={14} style={{ marginRight: '6px' }} />
              <span>{g.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups details panel */}
      <div className="glass-panel" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
        {selectedGroup ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '20px' }}>{selectedGroup.name}</h2>
                {selectedGroup.members.includes(user.id) ? (
                  <button onClick={() => handleLeaveGroup(selectedGroup._id)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>Leave Group</button>
                ) : (
                  <button onClick={() => handleJoinGroup(selectedGroup._id)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>Join Group</button>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedGroup.description || 'No description listed.'}</p>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '6px', display: 'block' }}>
                {selectedGroup.privacy} Group · {selectedGroup.members.length} members
              </span>
            </div>

            {/* Group Admin Moderation options (if creator) */}
            {selectedGroup.admins.includes(user.id) && (
              <div className="glass-panel" style={{ padding: '14px', border: '1px dashed var(--color-primary)', background: 'rgba(99,102,241,0.02)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Shield size={16} color="var(--color-primary)" />
                  <span>Admin Moderation Panel</span>
                </h4>

                {/* Rules Editor */}
                <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Group Rules List:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '6px 0' }}>
                    {(selectedGroup.rules || ['Be respectful.', 'No spamming.']).map((rule, ri) => (
                      <div key={ri} style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', gap: '4px' }}>
                        <span>{ri + 1}.</span> <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddGroupRule} style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="New rule..." 
                      value={newGroupRule}
                      onChange={e => setNewGroupRule(e.target.value)}
                      style={{ flex: 1, height: '28px', fontSize: '11px' }}
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: '4px 10px', height: '28px', fontSize: '11px' }}>Add</button>
                  </form>
                </div>

                {/* Pending membership approvals */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Pending Approvals ({selectedGroup.pendingMembers?.length || 0}):</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {(selectedGroup.pendingMembers || []).map(pId => {
                      const pendingU = allUsers.find(u => u._id === pId);
                      return pendingU ? (
                        <div key={pId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                          <span style={{ fontSize: '12px' }}>{pendingU.username}</span>
                          <button onClick={() => handleApproveMember(pId)} className="btn-primary" style={{ padding: '2px 8px', fontSize: '10px' }}>Approve</button>
                        </div>
                      ) : null;
                    })}
                    {(selectedGroup.pendingMembers || []).length === 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No pending approvals.</span>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Post in Group form (if member) */}
            {selectedGroup.members.includes(user.id) && (
              <form onSubmit={handlePostInGroup} className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.1)' }}>
                <textarea 
                  placeholder={`Write something to this group timeline, ${user.username}...`}
                  value={groupPostContent}
                  onChange={e => setGroupPostContent(e.target.value)}
                  rows={2}
                  style={{ width: '100%', background: 'transparent', resize: 'none', border: 'none' }}
                  required
                />
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Post to Group</button>
                </div>
              </form>
            )}

            {/* Group Posts feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedGroup.posts && selectedGroup.posts.map(p => (
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', height: '300px', gap: '8px' }}>
            <Users size={36} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Browse Connection Groups</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
              Select a group from the directories listing to view members feeds and timelines, or create a brand new one.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
