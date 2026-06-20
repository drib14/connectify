import React from 'react';
import { HiCheckCircle, HiCloudUpload } from 'react-icons/hi';
import './ProgressLoader.css';

const ProgressLoader = ({ progress = 0, statusText = 'Uploading files...', visible = false }) => {
  if (!visible) return null;

  return (
    <div className="progress-loader-overlay">
      <div className="progress-loader-card">
        {progress >= 100 ? (
          <div className="progress-completed-icon">
            <HiCheckCircle />
          </div>
        ) : (
          <div className="progress-upload-icon">
            <HiCloudUpload className="progress-icon-anim" />
          </div>
        )}
        <h3 className="progress-status-title">
          {progress >= 100 ? 'Process Completed' : statusText}
        </h3>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-percentage-label">{progress}%</div>
      </div>
    </div>
  );
};

export default ProgressLoader;
