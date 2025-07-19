import React from 'react';
import { Breadcrumb, Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';

interface AdminHeaderProps {
  pageTitle: string;
}
// animation 
const AdminHeader: React.FC<AdminHeaderProps> = ({ pageTitle }) => (
  <div
    style={{
      background: '#f5f5f5',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 72,
      position: 'sticky',
      top: 22,
      zIndex: 100,
    }}
  >
    <div>
      <Breadcrumb separator=" / " style={{ marginBottom: 0 }}>
        <Breadcrumb.Item>Pages</Breadcrumb.Item>
        <Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ fontWeight: 700, fontSize: 22, marginTop: 18 }}>{pageTitle}</div>
    </div>
    <div>
      <Badge count={4} size="small">
        <BellOutlined style={{ fontSize: 24, color: '#222', cursor: 'pointer' }} />
      </Badge>
    </div>
  </div>
);

export default AdminHeader;