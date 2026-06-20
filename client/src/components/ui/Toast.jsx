import React from 'react';
import { BellRing } from 'lucide-react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-alert glass-panel-heavy ${t.type}`}>
          <BellRing size={16} />
          <span style={{ fontSize: '12.5px', fontWeight: '500' }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
