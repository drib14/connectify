import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'feed', count = 1 }) => {
  const renderItems = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <div key={i} className="skeleton-container animate-shimmer">
          {type === 'feed' && (
            <div className="skeleton-feed">
              <div className="skeleton-header">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-header-info">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-meta"></div>
                </div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-para"></div>
                <div className="skeleton-line skeleton-para"></div>
                <div className="skeleton-line skeleton-para-short"></div>
              </div>
              <div className="skeleton-image"></div>
              <div className="skeleton-footer">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          )}

          {type === 'profile' && (
            <div className="skeleton-profile">
              <div className="skeleton-cover"></div>
              <div className="skeleton-profile-header">
                <div className="skeleton-profile-avatar"></div>
                <div className="skeleton-profile-meta">
                  <div className="skeleton-line skeleton-profile-name"></div>
                  <div className="skeleton-line skeleton-profile-handle"></div>
                  <div className="skeleton-line skeleton-profile-bio"></div>
                </div>
              </div>
              <div className="skeleton-stats-grid">
                <div className="skeleton-stat-box"></div>
                <div className="skeleton-stat-box"></div>
                <div className="skeleton-stat-box"></div>
              </div>
              <div className="skeleton-tabs">
                <div className="skeleton-tab"></div>
                <div className="skeleton-tab"></div>
                <div className="skeleton-tab"></div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-para"></div>
                <div className="skeleton-line skeleton-para-short"></div>
              </div>
            </div>
          )}

          {type === 'community' && (
            <div className="skeleton-community">
              <div className="skeleton-header">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-header-info">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-meta"></div>
                </div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-para"></div>
                <div className="skeleton-line skeleton-para-short"></div>
              </div>
              <div className="skeleton-join-btn"></div>
            </div>
          )}

          {type === 'goal' && (
            <div className="skeleton-goal">
              <div className="skeleton-header">
                <div className="skeleton-icon-block"></div>
                <div className="skeleton-header-info">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-meta"></div>
                </div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-para"></div>
              </div>
              <div className="skeleton-progress-row">
                <div className="skeleton-progress-bar-fill"></div>
                <div className="skeleton-progress-label"></div>
              </div>
            </div>
          )}

          {type === 'explore' && (
            <div className="skeleton-explore">
              <div className="skeleton-section-header">
                <div className="skeleton-line skeleton-title"></div>
              </div>
              <div className="skeleton-explore-grid">
                <div className="skeleton-explore-card">
                  <div className="skeleton-avatar-center"></div>
                  <div className="skeleton-line skeleton-title-center"></div>
                  <div className="skeleton-line skeleton-meta-center"></div>
                </div>
                <div className="skeleton-explore-card">
                  <div className="skeleton-avatar-center"></div>
                  <div className="skeleton-line skeleton-title-center"></div>
                  <div className="skeleton-line skeleton-meta-center"></div>
                </div>
                <div className="skeleton-explore-card">
                  <div className="skeleton-avatar-center"></div>
                  <div className="skeleton-line skeleton-title-center"></div>
                  <div className="skeleton-line skeleton-meta-center"></div>
                </div>
              </div>
            </div>
          )}

          {type === 'notification' && (
            <div className="skeleton-notification">
              <div className="skeleton-avatar-sm"></div>
              <div className="skeleton-notification-info">
                <div className="skeleton-line skeleton-para"></div>
                <div className="skeleton-line skeleton-meta-short"></div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return items;
  };

  return <>{renderItems()}</>;
};

export default SkeletonLoader;
