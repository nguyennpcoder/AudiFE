import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Badge, Button } from 'antd';
import { BellOutlined, DollarOutlined, UsergroupAddOutlined, HeartOutlined, LockOutlined, MenuOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import '../../styles/DashboardHeader.css';
import { Column, Line } from '@ant-design/charts';
import { fetchSampleCarModels, CarModel } from '../../services/carModelService';
import { fetchSalesStaff, User } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

const { Header, Content } = Layout;

const columnData = [
  { month: 'Jan', sales: 420, target: 380 },
  { month: 'Feb', sales: 320, target: 350 },
  { month: 'Mar', sales: 480, target: 450 },
  { month: 'Apr', sales: 380, target: 400 },
  { month: 'May', sales: 520, target: 480 },
  { month: 'Jun', sales: 450, target: 420 },
];

const lineData = [
  { month: 'Feb', Sales: 320, Traffic: 100 },
  { month: 'Mar', Sales: 80, Traffic: 120 },
  { month: 'Apr', Sales: 200, Traffic: 180 },
  { month: 'May', Sales: 150, Traffic: 200 },
  { month: 'Jun', Sales: 400, Traffic: 300 },
  { month: 'Jul', Sales: 220, Traffic: 250 },
  { month: 'Aug', Sales: 300, Traffic: 320 },
  { month: 'Sep', Sales: 250, Traffic: 280 },
  { month: 'Oct', Sales: 420, Traffic: 350 },
];

// Chuẩn hóa dữ liệu cho Column chart
const columnChartData = [
  ...columnData.map((d) => ({ month: d.month, value: d.sales, type: 'Sales' })),
  ...columnData.map((d) => ({ month: d.month, value: d.target, type: 'Target' })),
];

// Cấu hình biểu đồ cột
const columnConfig = {
  data: columnChartData,
  xField: 'month',
  yField: 'value',
  seriesField: 'type',
  color: ['#1890ff', '#52c41a'],
  height: 280,
  legend: {
    position: 'top',
  },
  columnStyle: {
    radius: [4, 4, 0, 0],
  },
  dodgePadding: 4,
  intervalPadding: 20,
  xAxis: {
    label: {
      style: {
        fill: '#666',
        fontSize: 12,
      },
    },
  },
  yAxis: {
    label: {
      style: {
        fill: '#666',
        fontSize: 12,
      },
    },
  },
};

// Chuẩn hóa dữ liệu cho Line chart
const lineChartData = [
  ...lineData.map((d) => ({ month: d.month, value: d.Sales, type: 'Sales' })),
  ...lineData.map((d) => ({ month: d.month, value: d.Traffic, type: 'Traffic' })),
];

// Cấu hình biểu đồ line
const lineConfig = {
  data: lineChartData,
  xField: 'month',
  yField: 'value',
  seriesField: 'type',
  color: ['#1890ff', '#10b981'],
  height: 260,
  smooth: true,
  legend: { 
    position: 'top-right', 
    itemName: { 
      style: { 
        fontSize: 14, 
        fontWeight: 500,
        fill: '#4b5563'
      } 
    }
  },
  point: {
    size: 4,
    style: {
      fill: '#fff',
      stroke: '#1890ff',
      lineWidth: 2,
    },
  },
  xAxis: {
    grid: null,
    line: null,
    tickLine: null,
    label: { style: { fill: '#6b7280', fontSize: 13, fontWeight: 500 } },
  },
  yAxis: {
    grid: { 
      line: { 
        style: { 
          stroke: 'rgba(0,0,0,0.06)', 
          lineWidth: 1, 
          lineDash: [4, 4] 
        } 
      } 
    },
    label: { style: { fill: '#6b7280', fontSize: 13, fontWeight: 500 } },
    line: null,
    tickLine: null,
  },
  tooltip: { 
    showMarkers: true,
    marker: {
      lineWidth: 2,
      stroke: '#fff',
      fill: '#1890ff',
      r: 4,
    },
  },
  animation: {
    appear: {
      animation: 'path-in',
      duration: 1000,
    },
  },
  area: false,
  lineStyle: { 
    lineWidth: 3,
    lineCap: 'round',
    lineJoin: 'round',
  },
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
      <div className="admin-header-actions ">
        <Button
          type="text"
          icon={theme === 'dark' ? <BulbFilled style={{ color: '#FFD600', fontSize: 22 }} /> : <BulbOutlined style={{ fontSize: 22 }} />}
          onClick={toggleTheme}
          aria-label="Đổi giao diện sáng/tối"
          style={{ marginRight: 12 }}
        />
        <Badge count={4} size="small">
          <BellOutlined style={{ fontSize: 24, color: '#222', cursor: 'pointer' }} />
        </Badge>
      </div>
    </Header>
    <Content style={{ padding: '24px 0 0 0', background: '#f5f5f5' }}>
      <div
        className="dashboard-cards"
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-start',
          marginBottom: 24,
        }}
      >
        {/* Card 1: Today's Sales */}
        <div className="dashboard-card">
          <div>
            <div className="dashboard-card-title" style={{ color: '#888', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              Today's Sales
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="dashboard-card-value" style={{ fontSize: 20, fontWeight: 700, color: '#222' }}>$53,000</span>
              <span className= "dashboard-card-value1" style={{ color: '#43a047', fontWeight: 600, fontSize: 15, marginLeft: 5 }}>+30%</span>
            </div>
          </div>
          <div
            style={{
              background: '#1890ff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
            }}
          >
            <DollarOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
        </div>

        {/* Card 2: Today's Users */}
        <div className="dashboard-card">
          <div>
            <div className="dashboard-card-title"style={{ color: '#888', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              Nhân viên bán hàng
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span className="dashboard-card-value" style={{ fontSize: 20, fontWeight: 700, color: '#222' }}>{salesStaff.length}</span>
              <span className="dashboard-card-value1" style={{ color: '#43a047', fontWeight: 600, fontSize: 13, marginLeft: 3 }}>Hoạt động</span>
            </div>
            {salesStaff.length > 0 && (
              <div className="dashboard-card-value2"style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                {salesStaff.map(staff => `${staff.ho} ${staff.ten}`).join(', ')}
              </div>
            )}
          </div>
          <div
            style={{
              background: '#1890ff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
            }}
          >
            <UsergroupAddOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
        </div>

        {/* Card 3: New Clients */}
        <div className="dashboard-card">
          <div>
            <div className="dashboard-card-title" style={{ color: '#888', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              New Clients
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span className="dashboard-card-value"style={{ fontSize: 20, fontWeight: 700, color: '#222' }}>+1,200</span>
              <span className="dashboard-card-title1"style={{ color: '#e53935', fontWeight: 600, fontSize: 13, marginLeft: 3 }}>-20%</span>
            </div>
          </div>
          <div
            style={{
              background: '#1890ff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
            }}
          >
            <HeartOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
        </div>

        {/* Card 4: New Orders */}
        <div className="dashboard-card">
          <div>
            <div className="dashboard-card-title"style={{ color: '#888', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              New Orders
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span className="dashboard-card-value"style={{ fontSize: 20, fontWeight: 700, color: '#222' }}>$13,200</span>
              <span className="dashboard-card-title1"style={{ color: '#43a047', fontWeight: 600, fontSize: 13, marginLeft: 3 }}>10%</span>
            </div>
          </div>
          <div
            style={{
              background: '#1890ff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
            }}
          >
            <LockOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
        </div>
      </div>
      {/* 2 biểu đồ bên dưới */}
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        padding: '0 32px',
        marginBottom: 32,
        marginTop: -20,
      }}>
        {/* Biểu đồ Pie với nền gradient nhạt */}
        <div style={{
          flex: 0.8,        
          minWidth: 340,
          // background: 'linear-gradient(135deg, rgba(0, 64, 255, 0.03) 0%, rgba(166, 186, 255, 0.08) 100%)',
          borderRadius: 24,
          padding: '10px',
          marginBottom: 24,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            height: '95%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Phần biểu đồ */}
            <div style={{
              padding: '22px 32px 24px 32px',
              background: '#fff',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Column {...columnConfig} />
            </div>
            
            {/* Phần content */}
            <div style={{ 
              padding: '14px 32px 32px 32px',
              background: '#fff',
              borderTop: '1px solid rgba(0,0,0,0.06)'
            }}>
              <div className="dashboard-card-title"style={{ fontWeight: 700, fontSize: 22, color: '#1a1a1a', marginBottom: 4 }}>Doanh số theo dòng xe</div>
              <div className="dashboard-card-value"style={{ color: '#6b7280', fontSize: 16, marginBottom: 8 }}>
                So với tháng trước <span className="dashboard-card-title1"style={{ color: '#10b981', fontWeight: 700 }}>+24%</span>
              </div>
              <div className="dashboard-card-title3"style={{ color: '#6b7280', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                Phân tích doanh số các dòng xe Audi phổ biến nhất trong tháng này.
              </div>
              <div style={{ display: 'flex', gap: 24, fontWeight: 700, fontSize: 16, color: '#1a1a1a', flexWrap: 'wrap' , marginBottom: 10}}>
                <span className="dashboard-card-title4">2,458 <span className="dashboard-card-title1"style={{ color: '#6b7280', fontWeight: 400 }}>Xe</span></span>
                <span className="dashboard-card-title4">+327 <span className="dashboard-card-title1"style={{ color: '#6b7280', fontWeight: 400 }}>Mới</span></span>
                <span className="dashboard-card-title4">82% <span className="dashboard-card-title1"style={{ color: '#6b7280', fontWeight: 400 }}>Hoàn thành</span></span>
              </div>
            </div>
          </div>
        </div>
        {/* Biểu đồ line với thiết kế hiện đại */}
        <div style={{
          flex: 1,
          minWidth: 400,
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          marginBottom: 60,
          marginTop: 10,
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Hiệu ứng background subtle */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(24,144,255,0.02) 100%)',
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: 16 
            }}>
              <div>
                <div className="dashboard-card-title"style={{ fontWeight: 700, fontSize: 22, color: '#1a1a1a', marginBottom: 4 }}>Doanh thu tháng</div>
                <div className="dashboard-card-value"style={{ color: '#10b981', fontWeight: 600, fontSize: 16, marginBottom: 15 }}>
                  Tăng so với tháng trước <span className="dashboard-card-title1">+24%</span>
                </div>
              </div>
              <div className="dashboard-card-title1"style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                ↗ +$15,230
              </div>
            </div>
            <Line {...lineConfig} />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 16,
              padding: '12px 0',
              borderTop: '1px solid rgba(0,0,0,0.06)'
            }}>
              <div className="dashboard-card-title3"style={{ color: '#6b7280', fontSize: 13 }}>
                Cập nhật lần cuối: 2 phút trước
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>
                  <span className="dashboard-card-title"style={{ color: '#1890ff', fontWeight: 600 }}>●</span> Doanh thu
                </span>
                <span style={{ color: '#6b7280' }}>
                  <span className="dashboard-card-title"style={{ color: '#10b981', fontWeight: 600 }}>●</span> Mục tiêu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="audi-dashboard-bottom">
        {/* Bảng dự án/Audi Store */}
        <div className="audi-projects">
          <div className="audi-projects-header">
            <div>
              <div className="audi-projects-title dashboard-card-title">Dự án bán hàng Audi</div>
              <div className="audi-projects-sub dashboard-card-value">Hoàn thành tháng này <span className="audi-projects-progress dashboard-card-title1">45%</span></div>
            </div>
            <div className="audi-projects-tabs">
              <button className="active ">Tất cả</button>
              <button>Online</button>
              <button>Showroom</button>
            </div>
          </div>
          <div className="audi-projects-table">
            <div className="audi-projects-row audi-projects-row-head" style={{ minHeight: 56, display: 'flex', alignItems: 'center' }}>
              <div className="dashboard-card-title3"style={{ flex: 2, display: 'flex', alignItems: 'center', textAlign: 'left' }}>Mẫu xe</div>
              <div className="dashboard-card-title3"style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Nhân viên</div>
              <div className="dashboard-card-title3"style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Doanh số</div>
              <div className="dashboard-card-title3"style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Tiến độ</div>
            </div>
            {carModels.map((model) => (
              <div className="audi-projects-row " key={model.id} style={{ minHeight: 56, display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={model.hinhAnh}
                    alt={model.tenMau}
                    // className="audi-car-logo" //viền logo img 
                    style={{
                      width: 48,
                      height: 36,
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginRight: 12,
                      flexShrink: 0,
                    }}
                  />
                  <span className="dashboard-card-title1">{model.tenMau}</span>
                </div>
                <div className="audi-members " style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            marginLeft: index === 0 ? 0 : -8,
                          }}
                        >
                          <div
                            className="staff-avatar dashboard-card-title1"
                            style={{
                              background: bgColor,
                              color: '#fff',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              fontSize: 12,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            }}
                          >
                            {staff.ten.charAt(0)}
                          </div>
                          <div className="staff-info-tooltip ">
                            <div className="staff-name dashboard-card-title2">{staff.ho} {staff.ten}</div>
                            <div className="staff-role dashboard-card-title">Nhân viên bán hàng</div>
                          </div>
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
                            marginLeft: index === 0 ? 0 : -8,
                          }}
                        >
                          <div
                            className="staff-avatar"
                            style={{
                              background: colors[index],
                              color: '#fff',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: 12,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                            }}
                          >
                            {letter}
                          </div>
                          <div className="staff-info-tooltip">
                            <div className="staff-name dashboard-card-title2">Đang tải...</div>
                            <div className="staff-role dashboard-card-title">Nhân viên bán hàng</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className=" dashboard-card-title1"style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {fakeStats[model.id]?.sales ?? '...'} xe
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="audi-progress-bar " style={{ width: '80%' }}>
                    <div style={{ width: `${fakeStats[model.id]?.progress ?? 0}%` }} />
                  </div>
                  <span className=" dashboard-card-title1"style={{ marginLeft: 8 }}>{fakeStats[model.id]?.progress ?? 0}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="audi-upload-row">
            <span>⬆️</span> <span style={{color: '#888'}}>Nhấn để tải lên báo cáo doanh số</span>
          </div>
        </div>
        {/* Lịch sử đơn hàng */}
        <div className="audi-orders-history">
          <div className="audi-orders-header">
            <div>
              <div className="audi-orders-title dashboard-card-title">Lịch sử đơn hàng</div>
              <div className="audi-orders-sub dashboard-card-value">Tháng này <span className="audi-orders-progress dashboard-card-title1">+18%</span></div>
            </div>
          </div>
          <div className="audi-orders-timeline">
            <div className="audi-order audi-order-success">
              <span className="audi-order-dot audi-order-dot-success" />
              <div>
                <div className="audi-order-title dashboard-card-title1">Đã giao xe Audi Q5</div>
                <div className="audi-order-date">09/06 14:20</div>
              </div>
            </div>
            <div className="audi-order">
              <span className="audi-order-dot audi-order-dot-success " />
              <div>
                <div className="audi-order-title dashboard-card-title4">Đơn hàng mới #A202406</div>
                <div className="audi-order-date">08/06 10:12</div>
              </div>
            </div>
            <div className="audi-order">
              <span className="audi-order-dot audi-order-dot-info" />
              <div>
                <div className="audi-order-title dashboard-card-title4">Thanh toán đặt cọc Audi A6</div>
                <div className="audi-order-date">04/06 09:30</div>
              </div>
            </div>
            <div className="audi-order">
              <span className="audi-order-dot audi-order-dot-info" />
              <div>
                <div className="audi-order-title dashboard-card-title4">Đơn hàng mới #A202405</div>
                <div className="audi-order-date">02/06 15:45</div>
              </div>
            </div>
            <div className="audi-order">
              <span className="audi-order-dot audi-order-dot-info" />
              <div>
                <div className="audi-order-title dashboard-card-title4">Đã xác nhận giao xe Audi Q7</div>
                <div className="audi-order-date">18/05 13:30</div>
              </div>
            </div>
            <div className="audi-order">
              <span className="audi-order-dot audi-order-dot-cancel" />
              <div>
                <div className="audi-order-title dashboard-card-title3">Đơn hàng bị hủy #A202404</div>
                <div className="audi-order-date">14/05 16:00</div>
              </div>
            </div>
          </div>
          <button className="audi-orders-btn ">Xem thêm</button>
        </div>
      </div>
    </Content>
  </div>
);
};

export default DashboardHeader;