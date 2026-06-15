import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, BookOpen, Compass, ChevronLeft } from 'lucide-react';

const Legal = () => {
  const [activeTab, setActiveTab] = useState('tos');
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'tos':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.6' }}>
            <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Terms of Service</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Last updated: June 15, 2026</p>
            <p style={{ fontSize: '14px' }}>Welcome to Connectify! By using our platform, you agree to these terms. Please read them carefully.</p>
            
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>1. Using our services</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You must follow any policies made available to you within the platform. You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>2. Your Connectify Account</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You need a Connectify Account in order to use our features. You are responsible for the activity that happens on or through your Connectify Account. Keep your password confidential and monitor your sessions.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>3. Privacy and Copyright Protection</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Connectify’s privacy policies explain how we treat your personal data and protect your privacy when you use our Services. By using our Services, you agree that Connectify can use such data in accordance with our privacy policies.</p>
          </div>
        );
      case 'privacy':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.6' }}>
            <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Privacy Policy</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Last updated: June 15, 2026</p>
            <p style={{ fontSize: '14px' }}>At Connectify, accessible from localhost, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Connectify and how we use it.</p>
            
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Information We Collect</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>We gather personal profiles information such as your name, username, email address, password hashes, and user uploads (photos, videos, story moments, clips) to render custom social feeds and communications channels.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>How We Use Your Information</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>We use the information we collect to operate, maintain, and provide the features of the network, including real-time chats, check-ins, payment validation logs, and email notifications.</p>
          </div>
        );
      case 'guidelines':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.6' }}>
            <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Community Guidelines</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Last updated: June 15, 2026</p>
            <p style={{ fontSize: '14px' }}>Our guidelines help keep Connectify safe, friendly, and fun for everyone. We require all users to behave with respect and integrity.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>1. Respect the Circle</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Do not engage in harassment, hate speech, or bullying of other circle members. Be supportive and build engaging communities inside Guilds.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>2. Share Authentic Vibes</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Do not upload spam, malware, fake news, or copyrighted audio/video media (outside the integrated Spotify preview search links) designed to mislead others.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
          style={{ alignSelf: 'flex-start', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="glass-panel" style={{ display: 'flex', overflow: 'hidden', padding: 0 }}>
          {/* Side Menu */}
          <div style={{ width: '220px', borderRight: '1px solid var(--border-color)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '12px', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '8px' }}>Legal Deck</h3>
            
            <button
              onClick={() => setActiveTab('tos')}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'tos' ? 'rgba(99,102,241,0.1)' : 'transparent',
                borderColor: activeTab === 'tos' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'tos' ? 'var(--primary-glow)' : 'var(--text-muted)',
                gap: '10px',
              }}
            >
              <BookOpen size={16} />
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'privacy' ? 'rgba(99,102,241,0.1)' : 'transparent',
                borderColor: activeTab === 'privacy' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'privacy' ? 'var(--primary-glow)' : 'var(--text-muted)',
                gap: '10px',
              }}
            >
              <ShieldAlert size={16} />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'guidelines' ? 'rgba(99,102,241,0.1)' : 'transparent',
                borderColor: activeTab === 'guidelines' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'guidelines' ? 'var(--primary-glow)' : 'var(--text-muted)',
                gap: '10px',
              }}
            >
              <Compass size={16} />
              <span>Guidelines</span>
            </button>
          </div>

          {/* Right tab panel contents */}
          <div style={{ flex: 1, padding: '32px', minHeight: '400px' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
