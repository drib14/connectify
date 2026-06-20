import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import CookiePolicy from './CookiePolicy';
import CommunityGuidelines from './CommunityGuidelines';
import { HiArrowLeft } from 'react-icons/hi';
import './Legal.css';

const sections = [
  { id: 'terms', label: 'Terms of Service', component: TermsOfService },
  { id: 'privacy', label: 'Privacy Policy', component: PrivacyPolicy },
  { id: 'cookies', label: 'Cookie Policy', component: CookiePolicy },
  { id: 'guidelines', label: 'Community Guidelines', component: CommunityGuidelines },
];

const LegalHub = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  const activeSection = section || 'terms';

  useEffect(() => {
    // If invalid section parameter, redirect to terms
    if (section && !sections.find(s => s.id === section)) {
      navigate('/legal/terms', { replace: true });
    }
  }, [section, navigate]);

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || TermsOfService;

  return (
    <div className="legal-layout">
      {/* Back button */}
      <Link to="/feed" className="legal-back-btn">
        <HiArrowLeft /> Back to Feed
      </Link>

      <div className="legal-header">
        <h1 className="heading-2 legal-title">
          <span className="text-gradient">Connectify</span> Legal Hub
        </h1>
        <p className="legal-subtitle">Understand our terms, rules, and privacy agreements</p>
      </div>

      <div className="legal-nav-tabs">
        {sections.map(s => (
          <Link
            key={s.id}
            to={`/legal/${s.id}`}
            className={`legal-nav-tab ${activeSection === s.id ? 'active' : ''}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="legal-card">
        <ActiveComponent />
      </div>

      <footer className="legal-footer">
        <p>Connectify Social Platform © 2026. Built with absolute focus on digital wellbeing.</p>
        <p style={{ marginTop: '4px' }}>For inquiries, reach out to support@connectify.app</p>
      </footer>
    </div>
  );
};

export default LegalHub;
