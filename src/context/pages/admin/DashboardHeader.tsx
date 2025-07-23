import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Badge, Button } from 'antd';
import { BellOutlined, DollarOutlined, UsergroupAddOutlined, HeartOutlined, LockOutlined, MenuOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import '../../../styles/DashboardHeader.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line, LineChart } from 'recharts';
import { fetchSampleCarModels, CarModel } from '../../../services/carModelService';
import { fetchSalesStaff, User, buildAvatarUrl } from '../../../services/authService';
import { useTheme } from '../../ThemeContext';

const { Header, Content } = Layout;

const data = [
  { name: 'Jan', value: 400, revenue: 2400, users: 240 },
  { name: 'Feb', value: 300, revenue: 1398, users: 210 },
  { name: 'Mar', value: 200, revenue: 9800, users: 290 },
  { name: 'Apr', value: 278, revenue: 3908, users: 300 },
  { name: 'May', value: 189, revenue: 4800, users: 181 },
  { name: 'Jun', value: 239, revenue: 3800, users: 250 },
  { name: 'Jul', value: 349, revenue: 4300, users: 210 },
];

const pieData = [
  { name: 'Khuyến mãi online', value: 400, color: '#8884d8' },
  { name: 'Khuyến mãi showroom', value: 300, color: '#82ca9d' },
  { name: 'Khuyến mãi tháng', value: 200, color: '#ffc658' },
  { name: 'Ưu đãi đặc biệt', value: 100, color: '#ff7c7c' },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Thêm type cho dữ liệu ảo
type FakeStats = {
  [carModelId: string]: {
    sales: number;
    progress: number;
  };
};

const DashboardHeader: React.FC<any> = ({
  pageTitle,
  children,
  onToggleSidebar,
  isSidebarCollapsed
}) => {
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [salesStaff, setSalesStaff] = useState<User[]>([]);
  // Thêm state cho số liệu ảo
  const [fakeStats, setFakeStats] = useState<FakeStats>({});
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetchSampleCarModels()
      .then((models) => {
        setCarModels(models);
        // Sinh số liệu ảo cho từng model
        const stats: FakeStats = {};
        models.forEach(model => {
          stats[model.id] = {
            sales: Math.floor(Math.random() * 91) + 10, // 10-100
            progress: Math.floor(Math.random() * 91) + 10 // 10-100%
          };
        });
        setFakeStats(stats);
      })
      .catch(console.error);
  }, []);

  // Lấy danh sách nhân viên bán hàng
  useEffect(() => {
    fetchSalesStaff()
      .then(setSalesStaff)
      .catch(console.error);
  }, []);

  return (
  <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
    <Header
      style={{
        background: '#f5f5f5',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 72,
        position: 'sticky',
        top: 0,
        marginTop: 30 ,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {isSidebarCollapsed && (
          <Button 
            type="link" 
            onClick={onToggleSidebar} 
            style={{ 
              fontSize: 24, 
              color: '#222',
              height: 'auto',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            className="hamburger-btn"
          >
            <MenuOutlined />
          </Button>
        )}
        <div>
          <Breadcrumb separator=" / " style={{ marginBottom: 0 }}>
            <Breadcrumb.Item>Pages</Breadcrumb.Item>
            <Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ fontWeight: 700, fontSize: 22, marginTop: 2 }}>{pageTitle}</div>
        </div>
      </div>
      <div className="admin-header-actions">
        <Button
          type="text"
          icon={
            theme === 'dark'
              ? <BulbFilled style={{
                  color: '#FFD600',
                  fontSize: 22,
                  filter: 'drop-shadow(0 0 4px #FFD600) brightness(1.5) saturate(2)'
                }} />
              : <BulbOutlined style={{ color: '#222', fontSize: 22 }} />
          }
          onClick={toggleTheme}
          aria-label="Đổi giao diện sáng/tối"
          style={{ marginRight: 12 }}
        />
        <Badge count={4} size="small">
          <BellOutlined style={{ fontSize: 24, color: '#222', cursor: 'pointer' }} />
        </Badge>
      </div>
    </Header>
    <Content style={{ padding: '24px 32px 0 32px', background: '#f5f5f5' }}>
      <div
        className="dashboard-cards"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', // Giảm minmax từ 200px xuống 160px
          gap: 10, // Giảm gap từ 16 xuống 10
          marginBottom: 32,
        }}
      >
        {/* Card 1: Today's Sales - Updated */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          borderRadius: 16,
          padding: '12px', // Giảm padding từ 20px xuống 12px
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          minHeight: 140,
        }}
        className="hover-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
        }}>
          {/* Decorative background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)',
            borderRadius: '50%',
            transform: 'translate(25px, -25px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6
                }}>
                  <div style={{
                    width: 2,
                    height: 14,
                    background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                    borderRadius: 1
                  }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>Doanh số hôm nay</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>$53,000</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '3px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>+30%</span>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(24, 144, 255, 0.4)'
              }}>
                <DollarOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
              Tăng 15% so với hôm qua •  Xu hướng tích cực
            </p>
          </div>
        </div>

        {/* Card 2: Staff - Updated */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          borderRadius: 16,
          padding: '12px', // Giảm padding
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          minHeight: 140,
        }}
        className="hover-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
        }}>
          {/* Decorative background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
            borderRadius: '50%',
            transform: 'translate(25px, -25px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6
                }}>
                  <div style={{
                    width: 2,
                    height: 14,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: 1
                  }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>Nhân viên bán hàng</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{salesStaff.length}</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    padding: '3px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}>Hoạt động</span>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)'
              }}>
                <UsergroupAddOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
              {salesStaff.length > 0 
                ? `${salesStaff.slice(0, 2).map(staff => `${staff.ho} ${staff.ten}`).join(', ')}${salesStaff.length > 2 ? '...' : ''}`
                : 'Đang tải danh sách nhân viên'} • 👥 Đội ngũ chuyên nghiệp
            </p>
          </div>
        </div>

        {/* Card 3: New Clients - Updated */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fef7ff 100%)',
          borderRadius: 16,
          padding: '12px', // Giảm padding
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          minHeight: 140,
        }}
        className="hover-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
        }}>
          {/* Decorative background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
            borderRadius: '50%',
            transform: 'translate(25px, -25px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6
                }}>
                  <div style={{
                    width: 2,
                    height: 14,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: 1
                  }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>Khách hàng mới</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>+1,200</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    padding: '3px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}>-20%</span>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
              }}>
                <HeartOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
              Giảm so với tháng trước • 💼 Cần tăng cường marketing
            </p>
          </div>
        </div>

        {/* Card 4: New Orders - Updated */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
          borderRadius: 16,
          padding: '12px', // Giảm padding
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          minHeight: 140,
        }}
        className="hover-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
        }}>
          {/* Decorative background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
            borderRadius: '50%',
            transform: 'translate(25px, -25px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6
                }}>
                  <div style={{
                    width: 2,
                    height: 14,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: 1
                  }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>Đơn hàng mới</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>$13,200</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '3px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>+10%</span>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
              }}>
                <LockOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
              Tăng nhẹ so với tuần trước • 🛒 Đơn hàng ổn định
            </p>
          </div>
        </div>
      </div>

      {/* 4 biểu đồ với layout 2x2 cân đối - GIỮ NGUYÊN TẤT CẢ CONTENT */}
     {/* 4 biểu đồ với layout 2x2 cân đối - ĐÃ ĐỔI VỊ TRÍ */}
<div className="dashboard-charts-grid" style={{ marginBottom: 32 }}>
  {/* Biểu đồ Bar - Vị trí 1 (trên trái) - GIỮ NGUYÊN */}
  <div style={{
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Phần biểu đồ Bar hiện đại */}
    <div style={{
      padding: '32px 40px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.6}/>
            </linearGradient>
            <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="4" stdDeviation="5" floodOpacity="0.12"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12}
            fontWeight={500}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            fontWeight={500}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="users" 
            fill="url(#colorUsers)" 
            radius={[8, 8, 0, 0]}
            filter="url(#barShadow)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    
    {/* Phần content Bar Chart hiện đại */}
    <div style={{ 
      padding: '28px 40px 36px 40px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
      borderTop: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.04) 100%)',
        borderRadius: '50%',
        transform: 'translate(30px, -30px)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.04) 100%)',
        borderRadius: '50%',
        transform: 'translate(-15px, 15px)',
        zIndex: 1
      }} />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 8 
            }}>
              <div style={{
                width: 4,
                height: 24,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: 2
              }} />
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 18, // Đồng bộ font size
                color: '#1e293b', 
                margin: 0,
                letterSpacing: '-0.5px'
              }}>Doanh số theo dòng xe</h3>
            </div>
            <p style={{ 
              color: '#64748b', 
              fontSize: 15, 
              margin: 0,
              lineHeight: 1.5
            }}>
              Phân tích hiệu suất các dòng xe hàng đầu
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>🚗</span> +24% Tăng trưởng
          </div>
        </div>
        
        {/* Stats grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: 20,
          marginBottom: 20
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(34, 197, 94, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(34, 197, 94, 0.12)'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>2,458</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tổng xe bán</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(16, 185, 129, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(16, 185, 129, 0.12)'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>+327</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Đơn hàng mới</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(5, 150, 105, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(5, 150, 105, 0.12)'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#059669', marginBottom: 4 }}>82%</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tỷ lệ hoàn thành</div>
          </div>
        </div>
        
        {/* Performance indicators */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 16, 
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(0,0,0,0.06)', 
          marginBottom: -5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)'
            }} />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Doanh số hiện tại</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              backgroundColor: '#16a34a',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)'
            }} />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Mục tiêu tháng</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Biểu đồ Area - Vị trí 2 (trên phải) - ĐÃ CHUYỂN LÊN */}
  <div style={{
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Area Chart Header */}
    <div style={{
      padding: '32px 40px',
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
            </linearGradient>
            <filter id="areaShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="4" stdDeviation="5" floodOpacity="0.15"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
            fontWeight={500}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            fontWeight={500}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorRevenue)"
            filter="url(#areaShadow)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    
    {/* Area Chart Footer */}
    <div style={{
      padding: '24px 40px 32px 40px',
      background: 'linear-gradient(135deg, #ffffff 0%, #fefbff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative element */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(124, 58, 237, 0.04) 100%)',
        borderRadius: '50%',
        transform: 'translate(-20px, 20px)',
        zIndex: 1
      }} />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 16 
        }}>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 4 
            }}>
              <div style={{
                width: 4,
                height: 20,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: 2
              }} />
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 18, 
                color: '#1e293b', 
                margin: 0,
                letterSpacing: '-0.5px'
              }}>Doanh thu tháng</h3>
            </div>
            <p style={{ 
              color: '#64748b', 
              fontSize: 13, 
              margin: 0,
              lineHeight: 1.5
            }}>
              Theo dõi xu hướng doanh thu theo thời gian
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>💰</span> +$15,230
          </div>
        </div>
        
        {/* Stats grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: 16,
          marginBottom: 20
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(139, 92, 246, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(139, 92, 246, 0.12)'
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>$2.4M</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Doanh thu tháng</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(124, 58, 237, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(124, 58, 237, 0.12)'
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>+24%</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Tăng trưởng</div>
          </div>
        </div>
        
        {/* Legend and update info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            Cập nhật lần cuối: 2 phút trước
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10,
                height: 10,
                backgroundColor: '#8b5cf6',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
              }} />
              <span style={{ color: '#64748b', fontWeight: 500 }}>Doanh thu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10,
                height: 10,
                backgroundColor: '#7c3aed',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
              }} />
              <span style={{ color: '#64748b', fontWeight: 500 }}>Mục tiêu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Biểu đồ Pie - Vị trí 3 (dưới trái) - ĐÃ CHUYỂN XUỐNG */}
  <div style={{
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Phần biểu đồ pie */}
    <div style={{
      padding: '32px 40px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <filter id="pieShade" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="4" dy="4" stdDeviation="6" floodOpacity="0.15"/>
            </filter>
          </defs>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={8}
            dataKey="value"
            filter="url(#pieShade)"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    
    {/* Phần content hiện đại */}
    <div style={{ 
      padding: '28px 40px 36px 40px',
      background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
      borderTop: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, rgba(136, 132, 216, 0.08) 0%, rgba(130, 202, 157, 0.05) 100%)',
        borderRadius: '50%',
        transform: 'translate(40px, -40px)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, rgba(255, 198, 88, 0.06) 0%, rgba(255, 124, 124, 0.04) 100%)',
        borderRadius: '50%',
        transform: 'translate(-20px, 20px)',
        zIndex: 1
      }} />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 8 
            }}>
              <div style={{
                width: 4,
                height: 24,
                background: 'linear-gradient(135deg, #8884d8 0%, #82ca9d 100%)',
                borderRadius: 2
              }} />
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 18, // Đồng bộ font size
                color: '#1e293b', 
                margin: 0,
                letterSpacing: '-0.5px'
              }}>Chương trình khuyến mãi</h3>
            </div>
            <p style={{ 
              color: '#64748b', 
              fontSize: 15, 
              margin: 0,
              lineHeight: 1.5
            }}>
              Theo dõi hiệu quả các chiến dịch marketing
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>📈</span> +15% Tăng trưởng
          </div>
        </div>
        
        {/* Stats grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: 20,
          marginBottom: 20
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(136, 132, 216, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(136, 132, 216, 0.12)'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#8884d8', marginBottom: 4 }}>1,000</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tổng lượt tham gia</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(130, 202, 157, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(130, 202, 157, 0.12)'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#82ca9d', marginBottom: 4 }}>+120</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Khách hàng mới</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(255, 198, 88, 0.08)',
            borderRadius: 16,
            border: '1px solid rgba(255, 198, 88, 0.12)'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ffc658', marginBottom: 4 }}>75%</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tỷ lệ chuyển đổi</div>
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 16, 
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          {pieData.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                borderRadius: '50%',
                boxShadow: `0 2px 4px ${entry.color}40`
              }} />
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Biểu đồ Line - Vị trí 4 (dưới phải) - GIỮ NGUYÊN */}
  <div style={{
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Line Chart */}
    <div style={{
      padding: '32px 40px',
      background: 'linear-gradient(135deg, #e0f7fa 0%, #f3e8ff 100%)',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ffc658" 
            strokeWidth={4}
            dot={{ fill: '#ffc658', strokeWidth: 2, r: 6 }}
            filter="url(#shadow)"
          />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke="#ff7c7c" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: '#ff7c7c', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    {/* Line Chart Footer */}
    <div style={{
      padding: '20px 40px 24px 40px',
      background: 'linear-gradient(135deg, #ffffff 0%, #fefbff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 16 
        }}>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 4 
            }}>
              <div style={{
                width: 4,
                height: 20,
                background: 'linear-gradient(135deg, #ffc658 0%, #ff7c7c 100%)',
                borderRadius: 2
              }} />
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 18, 
                color: '#1e293b', 
                margin: 0,
                letterSpacing: '-0.5px'
              }}>Phân tích hiệu quả</h3>
            </div>
            <p style={{ 
              color: '#64748b', 
              fontSize: 13, 
              margin: 0,
              lineHeight: 1.5
            }}>
              Theo dõi hiệu suất và tăng trưởng nhiều chiều
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #ffc658 0%, #ff7c7c 100%)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(255, 198, 88, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>📊</span> Tăng trưởng
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      <div style={{
        padding: '0 32px',
        display: 'flex',
        gap: 20,
        marginBottom: 32,
        marginLeft: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Bảng dự án/Audi Store - Updated */}
        <div style={{
          flex: 2.3,
          minWidth: 500,
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}>
          {/* Header với gradient background */}
          <div style={{
            padding: '24px 28px 20px 28px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)'
            }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6
                  }}>
                    <div style={{
                      width: 3,
                      height: 20,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      borderRadius: 2
                    }} />
                    <h3 style={{
                      fontWeight: 700,
                      fontSize: 20,
                      color: '#1e293b',
                      margin: 0,
                      letterSpacing: '-0.5px'
                    }}>Dự án bán hàng Audi</h3>
                  </div>
                  <p style={{
                    color: '#64748b',
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    Hoàn thành tháng này <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      padding: '3px 6px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600
                    }}>45%</span>
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span>🏆</span> Hiệu suất cao
                </div>
              </div>
              
              {/* Modern tabs */}
              <div style={{
                display: 'flex',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '3px',
                borderRadius: 12,
                backdropFilter: 'blur(10px)'
              }}>
                <button style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                }}>Tất cả</button>
                <button style={{
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>Online</button>
                <button style={{
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>Showroom</button>
              </div>
            </div>
          </div>
          {/* Modern table */}
          <div style={{ padding: '0 28px 24px 28px' }}>
            {/* Table header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px 12px 0 0',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              marginBottom: 0
            }}>
              <div style={{ flex: 2, fontSize: 12, fontWeight: 700, color: '#374151' }}>Mẫu xe</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#374151', textAlign: 'center' }}>Nhân viên</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#374151', textAlign: 'center' }}>Doanh số</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#374151', textAlign: 'center' }}>Tiến độ</div>
            </div>
            {/* Table rows */}
            <div style={{
              background: '#fff',
              borderRadius: '0 0 12px 12px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderTop: 'none',
              overflow: 'hidden'
            }}>
              {carModels.map((model, index) => (
                <div key={model.id} style={{
                  minHeight: 56,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: index < carModels.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}>
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      position: 'relative',
                      borderRadius: 8,
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <img
                        src={model.hinhAnh}
                        alt={model.tenMau}
                        style={{
                          width: 48,
                          height: 36,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{model.tenMau}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Model 2024</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {salesStaff.length > 0 ? (
                    salesStaff.slice(0, 3).map((staff, index) => {
                      const colors = ['#d50000', '#1890ff', '#43a047', '#ff9800', '#9c27b0'];
                      const bgColor = colors[index % colors.length];
                      return (
                        <div 
                          key={staff.id}
                          className="staff-avatar-container"
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                            marginLeft: index === 0 ? 0 : -6,
                          }}
                          title={`${staff.ho} ${staff.ten}`}
                        >
                          {staff.avatar && !buildAvatarUrl(staff.avatar).includes('avatar-default.png') ? (
                            <img
                              src={buildAvatarUrl(staff.avatar)}
                              alt={`${staff.ho} ${staff.ten}`}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.currentTarget.src = '/avatar-default.png';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
                                color: '#fff',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: 11,
                                border: '2px solid #fff',
                                boxShadow: `0 4px 12px ${bgColor}40`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = `0 6px 20px ${bgColor}60`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${bgColor}40`;
                              }}
                            >
                              {staff.ten.charAt(0)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    ['A', 'B', 'C'].map((letter, index) => {
                      const colors = ['#d50000', '#1890ff', '#43a047'];
                      return (
                        <div 
                          key={letter}
                          className="staff-avatar-container"
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                            marginLeft: index === 0 ? 0 : -6,
                          }}
                        >
                          <div
                              style={{
                                background: `linear-gradient(135deg, ${colors[index]} 0%, ${colors[index]}dd 100%)`,
                                color: '#fff',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: 11,
                                border: '2px solid #fff',
                                boxShadow: `0 4px 12px ${colors[index]}40`,
                              }}
                          >
                            {letter}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                      color: '#16a34a',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      {fakeStats[model.id]?.sales ?? '...'} xe
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{
                      width: '60%',
                      height: 6,
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: 16,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${fakeStats[model.id]?.progress ?? 0}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: 16,
                        transition: 'width 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                          animation: 'shimmer 2s infinite'
                        }} />
                      </div>
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#6366f1',
                      minWidth: '32px'
                    }}>{fakeStats[model.id]?.progress ?? 0}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Upload section */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                <span style={{ fontSize: 16 }}>⬆️</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Tải lên báo cáo</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Nhấn để tải lên báo cáo doanh số mới nhất</div>
              </div>
            </div>
          </div>
        </div>
        {/* Lịch sử đơn hàng - Updated */}
        <div style={{
          flex: 1,
          minWidth: 280,
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px 20px 28px',
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
            borderBottom: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)',
              borderRadius: '50%',
              transform: 'translate(25px, -25px)'
            }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6
                  }}>
                    <div style={{
                      width: 3,
                      height: 20,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: 2
                    }} />
                    <h3 style={{
                      fontWeight: 700,
                      fontSize: 20,
                      color: '#1e293b',
                      margin: 0,
                      letterSpacing: '-0.5px'
                    }}>Lịch sử đơn hàng</h3>
                  </div>
                  <p style={{
                    color: '#64748b',
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    Tháng này <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      padding: '3px 6px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600
                    }}>+18%</span>
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span></span> Tăng trưởng tốt
                </div>
              </div>
            </div>
          </div>
          {/* Timeline */}
          <div style={{ padding: '0 28px 24px 28px' }}>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: 12,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'linear-gradient(180deg, #f59e0b 0%, rgba(245, 158, 11, 0.2) 100%)'
              }} />
              
              {/* Timeline items */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: -18,
                  width: 10,
                  height: 10,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }} />
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  flex: 1
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Đã giao xe Audi Q5</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>09/06 14:20</div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: -18,
                  width: 10,
                  height: 10,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }} />
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  flex: 1
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Đơn hàng mới #A202406</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>08/06 10:12</div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: -18,
                  width: 10,
                  height: 10,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }} />
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(245, 158, 11, 0.1)',
                  flex: 1
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Thanh toán đặt cọc Audi A6</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>04/06 09:30</div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: -18,
                  width: 10,
                  height: 10,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                }} />
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  flex: 1
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Đã xác nhận giao xe Audi Q7</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>18/05 13:30</div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: -18,
                  width: 10,
                  height: 10,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }} />
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  flex: 1
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Đơn hàng bị hủy #A202404</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>14/05 16:00</div>
                </div>
              </div>
            </div>
          </div>
          {/* View more button */}
          <div style={{
            padding: '0 28px 24px 28px'
          }}>
            <button style={{
              width: '100%',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.3)';
            }}>
              <span>👁️</span>
              Xem thêm đơn hàng
            </button>
          </div>
        </div>
      </div>
    </Content>
  </div>
);
};

export default DashboardHeader;