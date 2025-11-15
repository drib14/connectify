import React, { useState } from 'react';
import UserManagement from '../../components/UserManagement/UserManagement';
import ReportManagement from '../../components/ReportManagement/ReportManagement';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel</h2>
      <nav>
        <button onClick={() => setActiveTab('users')} disabled={activeTab === 'users'}>
          User Management
        </button>
        <button onClick={() => setActiveTab('reports')} disabled={activeTab === 'reports'}>
          Report Management
        </button>
      </nav>
      <main style={{ marginTop: '20px' }}>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'reports' && <ReportManagement />}
      </main>
    </div>
  );
};

export default AdminPage;
