import React from 'react';
import { HiLightningBolt } from 'react-icons/hi';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-container">
      <div className="splash-content">
        <div className="splash-logo-container">
          <div className="splash-glow"></div>
          <HiLightningBolt className="splash-logo" />
        </div>
        <h1 className="splash-title">Connectify</h1>
        <p className="splash-subtitle">Where authentic connections thrive</p>
        <div className="splash-progress-track">
          <div className="splash-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
