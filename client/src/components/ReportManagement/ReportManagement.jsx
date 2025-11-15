import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get('/api/admin/reports');
      setReports(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateReport = async (reportId, status, adminAction = '') => {
    try {
      await axios.put('/api/admin/reports', { reportId, status, adminAction });
      fetchReports(); // Refresh the report list
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h3>User Reports</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reporter</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reported User</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reason</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{report.reporter.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{report.reportedUser?.name || 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{report.reason}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{report.status}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => handleUpdateReport(report._id, 'resolved')}>Resolve</button>
                <button onClick={() => handleUpdateReport(report._id, 'dismissed')}>Dismiss</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportManagement;
