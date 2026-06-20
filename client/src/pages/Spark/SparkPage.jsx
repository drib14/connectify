import React from 'react';
import { Award, Crown } from 'lucide-react';

export default function SparkPage({
  user,
  challenges,
  leaderboard,
  handleSelectProfile
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '24px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={26} color="var(--color-primary)" />
          <span>Connectify Spark Sparkler</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Complete daily social connection goals to earn Spark points. Premium members earn 2x multipliers on all challenges! Your accumulated points place you on the community leaderboard.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Your Point Balance</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: 'var(--color-primary)' }}>{user.sparkPoints || 0} SPARK</h1>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '24px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Premium Status Multiplier</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: user.isPremium ? 'var(--premium-gold)' : 'var(--text-muted)' }}>
              {user.isPremium ? '2.0x Active' : '1.0x (Standard)'}
            </h1>
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>Daily Challenges List</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {challenges.map((goal, idx) => {
            const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            return (
              <div key={idx} className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>{goal.name}</span>
                  <span style={{ fontSize: '12px', color: goal.completed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {goal.completed ? 'Goal Achieved!' : `${goal.current} / ${goal.target}`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: goal.completed ? 'var(--color-success)' : 'var(--color-primary)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Leaderboard listing */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Crown size={18} color="var(--premium-gold)" />
          <span>Leaderboard Rankings</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {leaderboard.map((lUser, idx) => (
            <div
              key={lUser._id}
              onClick={() => handleSelectProfile(lUser.username)}
              className="leaderboard-item"
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`leaderboard-rank rank-${idx + 1}`}>{idx + 1}</span>
                <img src={lUser.profilePic || '/default-avatar.png'} alt={lUser.username} style={{ width: '28px', height: '28px', borderRadius: '50%', border: lUser.isPremium ? '2px solid var(--premium-gold)' : 'none' }} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{lUser.username}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lUser.sparkPoints} SP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
