import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className="admin-theme-root" data-theme={theme}>
      {children}
    </div>
  );
};

export default AdminLayout;