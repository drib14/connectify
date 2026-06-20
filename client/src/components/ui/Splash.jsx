import React from 'react';

export default function Splash() {
  return (
    <div className="splash-container">
      <img src="/logo.png" className="splash-logo" alt="Connectify Logo" />
      <h1 className="splash-title">CONNECTIFY</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '3px', marginTop: '10px' }}>
        Loading social ecosystem...
      </p>
    </div>
  );
}
