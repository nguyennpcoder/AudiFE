import React from 'react';
import AdminHeader from './AdminHeader';

const Settings: React.FC = () => {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <AdminHeader pageTitle="Cài đặt" />
      <div style={{ padding: '24px 32px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: 24
        }}>
          <h2 style={{ marginTop: 0 }}>Cài đặt tài khoản quản trị</h2>
          <p style={{ color: '#64748b' }}>Trang cài đặt đang được phát triển. Vui lòng quay lại sau.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

