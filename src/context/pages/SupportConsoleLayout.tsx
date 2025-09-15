import React from 'react';
import '../../styles/Admin.css';

type SupportConsoleLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const SupportConsoleLayout: React.FC<SupportConsoleLayoutProps> = ({ title = 'Support Console', children }) => {
  return (
    <div style={{ background: 'linear-gradient(180deg, #f5f7fb 0%, #eef2f7 60%, #e9eef5 100%)', minHeight: '100vh' }}>
      {/* Top bar */}
      <div
        className="admin-animate-top"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
         
          background: 'linear-gradient(90deg, #0b0b0b 0%, #111827 55%, #0f172a 100%)',
          color: '#fff',
          padding: '14px 0',
          boxShadow: '0 8px 28px rgba(0,0,0,0.25)'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',  marginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/public/vite.svg" alt="logo" style={{ width: 28, height: 28, filter: 'invert(1)' }} />
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>Audi Support</div>
          </div>
          <div style={{ opacity: 0.9, fontSize: 14 }}>Real‑time helpdesk</div>
        </div>
      </div>

      {/* Page header */}
      <div className="admin-animate-bottom" style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: 12, letterSpacing: 0.3 }}>Support / Console</div>
            <h1 style={{ margin: 4, fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{title}</h1>
            <div style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>Quản lý yêu cầu, phản hồi và SLA theo thời gian thực</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="support-ghost-btn" title="Làm mới" onClick={() => window.location.reload()}>
              <i className="fas fa-rotate"></i>
              <span>Làm mới</span>
            </button>
            {/* <button className="support-primary-btn" title="Tạo ticket">
              <i className="fas fa-plus"></i>
              <span>Ticket mới</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="admin-animate-bottom" style={{ maxWidth: 1200, margin: '16px auto 0', padding: '0 16px' }}>
        <div className="support-glass-card">
          {children}
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height: 24 }} />
    </div>
  );
};

export default SupportConsoleLayout;


