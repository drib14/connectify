import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const confettiColors = ['#00d4aa', '#0ea5e9', '#a855f7', '#f59e0b', '#ef4444', '#22c55e', '#ec4899'];

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confettiPieces, setConfettiPieces] = useState([]);

  const features = useMemo(() => [
    { icon: '🔒', title: 'Trust Circles', desc: 'Control who sees what', link: '/trust-circles' },
    { icon: '🎯', title: 'Set Goals', desc: 'Track your progress', link: '/goals' },
    { icon: '🌍', title: 'Communities', desc: 'Find your people', link: '/communities' },
    { icon: '💡', title: 'Skill Showcase', desc: 'Show your talents', link: `/profile/${user?.username}` },
    { icon: '📝', title: 'Journal', desc: 'Reflect & grow', link: '/journal' },
    { icon: '🤝', title: 'Explore', desc: 'Discover content', link: '/explore' },
  ], [user?.username]);

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
      rotation: `${Math.random() * 360}deg`,
    }));
    setConfettiPieces(pieces);
  }, []);

  return (
    <div className="welcome-page mesh-gradient">
      {/* Confetti */}
      <div className="welcome-confetti">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: piece.left,
              bottom: '-10px',
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              transform: `rotate(${piece.rotation})`,
            }}
          />
        ))}
      </div>

      <div className="welcome-container animate-fade-in-up">
        <div className="welcome-emoji">🎉</div>
        
        <h1 className="welcome-title">
          Welcome to <span className="text-gradient">Connectify</span>,{' '}
          {user?.firstName}!
        </h1>
        
        <p className="welcome-message">
          Your account is all set! You're now part of a community that values 
          <strong style={{ color: 'var(--primary)' }}> authentic connections</strong>, 
          <strong style={{ color: 'var(--secondary)' }}> personal growth</strong>, and 
          <strong style={{ color: 'var(--accent)' }}> real impact</strong>. 
          Here are some things you can do to get started:
        </p>

        <div className="welcome-features">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="welcome-feature"
              onClick={() => navigate(feature.link)}
            >
              <div className="welcome-feature-icon">{feature.icon}</div>
              <div className="welcome-feature-title">{feature.title}</div>
              <div className="welcome-feature-desc">{feature.desc}</div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/feed')}
          id="welcome-explore-btn"
          style={{ padding: '16px 48px', fontSize: '16px' }}
        >
          Start Exploring → 
        </button>
      </div>
    </div>
  );
};

export default Welcome;
