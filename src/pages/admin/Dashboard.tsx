import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/Admin.css';

// Khai báo kiểu dữ liệu cho window.Recharts
declare global {
  interface Window {
    Recharts: any;
  }
}

// Khai báo kiểu cho dữ liệu biểu đồ
interface RevenueData {
  month: string;
  value: number;
  prevValue?: number;
  change?: number;
  changePercent?: number;
}

interface CarModelData {
  name: string;
  value: number;
}

interface StatsData {
  name: string;
  value: number;
  icon: string;
  changeValue: number;
  changeText: string;
  color: string;
}

interface MonthlyData {
  month: string;
  users: number;
  orders: number;
  testdrives: number;
}

// Lấy các component từ Recharts
const { 
  LineChart, Line, AreaChart, Area, 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell,
  ReferenceLine, ComposedChart, Scatter
} = window.Recharts || {};

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Lấy chữ cái đầu làm avatar
  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0);
    }
    return 'A';
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Dữ liệu biểu đồ doanh thu theo tháng với thêm thông tin tăng giảm
  const revenueData: RevenueData[] = [
    { month: 'T1', value: 8.5, prevValue: 7.2, change: 1.3, changePercent: 18.1 },
    { month: 'T2', value: 7.2, prevValue: 8.5, change: -1.3, changePercent: -15.3 },
    { month: 'T3', value: 9.8, prevValue: 7.2, change: 2.6, changePercent: 36.1 },
    { month: 'T4', value: 10.5, prevValue: 9.8, change: 0.7, changePercent: 7.1 },
    { month: 'T5', value: 12.1, prevValue: 10.5, change: 1.6, changePercent: 15.2 },
    { month: 'T6', value: 11.3, prevValue: 12.1, change: -0.8, changePercent: -6.6 },
    { month: 'T7', value: 13.8, prevValue: 11.3, change: 2.5, changePercent: 22.1 },
    { month: 'T8', value: 15.2, prevValue: 13.8, change: 1.4, changePercent: 10.1 },
    { month: 'T9', value: 14.5, prevValue: 15.2, change: -0.7, changePercent: -4.6 },
    { month: 'T10', value: 16.7, prevValue: 14.5, change: 2.2, changePercent: 15.2 },
    { month: 'T11', value: 18.3, prevValue: 16.7, change: 1.6, changePercent: 9.6 },
    { month: 'T12', value: 20.5, prevValue: 18.3, change: 2.2, changePercent: 12.0 },
  ];

  // Dữ liệu thống kê cho users, orders và test drives
  const statsData: StatsData[] = [
    { 
      name: 'Người dùng', 
      value: 128, 
      icon: 'fas fa-users', 
      changeValue: 12, 
      changeText: 'mới trong tháng',
      color: '#1976d2'
    },
    { 
      name: 'Đơn hàng', 
      value: 43, 
      icon: 'fas fa-shopping-cart', 
      changeValue: 8, 
      changeText: 'đang xử lý',
      color: '#d50000'  
    },
    { 
      name: 'Doanh thu', 
      value: 12.5, 
      icon: 'fas fa-dollar-sign', 
      changeValue: 18, 
      changeText: 'tăng so với tháng trước',
      color: '#43a047'
    },
    { 
      name: 'Lái thử', 
      value: 26, 
      icon: 'fas fa-car', 
      changeValue: 5, 
      changeText: 'đang chờ xác nhận',
      color: '#ff9800'
    },
  ];

  // Dữ liệu biểu đồ phân bổ doanh thu theo dòng xe
  const carModelData: CarModelData[] = [
    { name: 'A Series', value: 35 },
    { name: 'Q Series', value: 40 },
    { name: 'RS Series', value: 15 },
    { name: 'e-tron', value: 10 },
  ];

  // Dữ liệu theo tháng cho người dùng, đơn hàng và lái thử
  const monthlyData: MonthlyData[] = [
    { month: 'T1', users: 80, orders: 20, testdrives: 14 },
    { month: 'T2', users: 85, orders: 22, testdrives: 16 },
    { month: 'T3', users: 92, orders: 25, testdrives: 18 },
    { month: 'T4', users: 98, orders: 27, testdrives: 19 },
    { month: 'T5', users: 105, orders: 30, testdrives: 20 },
    { month: 'T6', users: 110, orders: 32, testdrives: 21 },
    { month: 'T7', users: 115, orders: 35, testdrives: 22 },
    { month: 'T8', users: 118, orders: 37, testdrives: 23 },
    { month: 'T9', users: 120, orders: 39, testdrives: 24 },
    { month: 'T10', users: 123, orders: 41, testdrives: 25 },
    { month: 'T11', users: 126, orders: 42, testdrives: 25 },
    { month: 'T12', users: 128, orders: 43, testdrives: 26 },
  ];

  // Màu sắc cho biểu đồ
  const COLORS = ['#1976d2', '#43a047', '#ff9800', '#e91e63'];
  const TREND_COLORS = {
    increase: '#43a047', // Xanh lá cho tăng
    decrease: '#d32f2f', // Đỏ cho giảm
    neutral: '#757575'   // Xám cho không đổi
  };

  // Vẽ biểu đồ doanh thu với màu sắc thể hiện tăng/giảm
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Thiết lập kích thước canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Xóa canvas
        ctx.clearRect(0, 0, width, height);
        
        // Vẽ trục tọa độ
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
        
        // Tìm giá trị lớn nhất
        const maxValue = Math.max(...revenueData.map(item => item.value));
        
        // Vẽ thanh dữ liệu
        const barWidth = chartWidth / revenueData.length - 10;
        
        revenueData.forEach((item, index) => {
          const x = padding + index * (chartWidth / revenueData.length) + 5;
          const barHeight = (item.value / maxValue) * chartHeight;
          const y = height - padding - barHeight;
          
          // Xác định màu dựa trên sự thay đổi
          let barColor;
          if (item.change && item.change > 0) {
            barColor = TREND_COLORS.increase;
          } else if (item.change && item.change < 0) {
            barColor = TREND_COLORS.decrease;
          } else {
            barColor = TREND_COLORS.neutral;
          }
          
          // Vẽ thanh với màu thể hiện tăng/giảm
          ctx.fillStyle = barColor;
          ctx.fillRect(x, y, barWidth, barHeight);
          
          // Thêm biểu tượng mũi tên
          const arrow = item.change && item.change > 0 ? '▲' : item.change && item.change < 0 ? '▼' : '■';
          ctx.fillStyle = barColor;
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(arrow, x + barWidth / 2, y - 15);
          
          // Vẽ nhãn
          ctx.fillStyle = '#333';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.month, x + barWidth / 2, height - padding + 15);
          
          // Vẽ giá trị
          ctx.fillStyle = '#333';
          ctx.font = 'bold 10px Arial';
          ctx.fillText(item.value.toString() + ' tỷ', x + barWidth / 2, y - 5);
          
          // Vẽ phần trăm thay đổi
          if (item.changePercent) {
            const changeText = `${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(1)}%`;
            ctx.fillStyle = barColor;
            ctx.font = '9px Arial';
            ctx.fillText(changeText, x + barWidth / 2, y - 25);
          }
        });
        
        // Vẽ tiêu đề
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Biểu đồ doanh thu năm 2023 (tỷ VNĐ)', width / 2, 20);
        
        // Vẽ chú thích
        const legendX = width - 180;
        const legendY = padding;
        ctx.font = '10px Arial';
        
        // Chú thích tăng
        ctx.fillStyle = TREND_COLORS.increase;
        ctx.fillRect(legendX, legendY, 12, 12);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.fillText('Tăng', legendX + 18, legendY + 10);
        
        // Chú thích giảm
        ctx.fillStyle = TREND_COLORS.decrease;
        ctx.fillRect(legendX, legendY + 20, 12, 12);
        ctx.fillStyle = '#333';
        ctx.fillText('Giảm', legendX + 18, legendY + 30);
      }
    }
  }, []);

  // Khai báo kiểu cho tham số của hàm label trong thành phần Pie
  const renderCustomizedLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // Hàm formatter cho tooltip
  const tooltipFormatter = (value: number, name: string, entry: any) => {
    if (name === 'value') {
      return [`${value} tỷ`, 'Doanh thu'];
    }
    if (name === 'prevValue') {
      return [`${value} tỷ`, 'Tháng trước'];
    }
    if (name === 'change') {
      const prefix = value > 0 ? '+' : '';
      return [`${prefix}${value} tỷ`, 'Thay đổi'];
    }
    if (name === 'users') return [`${value} người`, 'Người dùng'];
    if (name === 'orders') return [`${value} đơn`, 'Đơn hàng'];
    if (name === 'testdrives') return [`${value} lượt`, 'Lái thử'];
    
    return [`${value} xe`, 'Số lượng'];
  };
  
  // Custom renderer cho tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        value: number;
        change: number;
        changePercent?: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isIncreasing = data.change > 0;
      const changeColor = isIncreasing ? TREND_COLORS.increase : TREND_COLORS.decrease;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Tháng: ${label}`}</p>
          <p className="tooltip-value" style={{ color: '#333' }}>
            {`Doanh thu: ${data.value} tỷ`}
          </p>
          <p className="tooltip-change" style={{ color: changeColor }}>
            {`Thay đổi: ${isIncreasing ? '+' : ''}${data.change} tỷ (${isIncreasing ? '+' : ''}${data.changePercent?.toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Tính toán màu dựa trên giá trị thay đổi
  const getBarColor = (item: RevenueData) => {
    if (!item.change) return TREND_COLORS.neutral;
    return item.change > 0 ? TREND_COLORS.increase : TREND_COLORS.decrease;
  };

  useEffect(() => {
    // Thêm vào ngay sau khai báo các state
    console.log("User role in Dashboard:", user?.role);
    console.log("Local storage:", localStorage.getItem('user'));
    console.log("Is authenticated:", isAuthenticated);
  }, [user, isAuthenticated]);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-logo">
          <button 
            className="admin-toggle-menu" 
            onClick={toggleSidebar} 
            aria-label="Toggle sidebar"
            title="Ẩn/Hiện menu"
          >
            <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-times'}`}></i>
          </button>
          <h1>Audi Management System</h1>
        </div>
        
        <div className="admin-user-dropdown">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {getInitials()}
            </div>
            <span>Xin chào, {user?.fullName || 'Admin'}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', opacity: 0.7 }}></i>
          </div>
          
          <div className="admin-user-dropdown-content">
         
            <Link to="/admin/settings" className="admin-user-menu-item">
              <i className="fas fa-cog"></i>
              <span>Cài đặt</span>
            </Link>
            <button onClick={handleLogout} className="admin-user-menu-item logout">
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
              <span className="logout-arrow">→</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="admin-content">
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="admin-nav">
            <ul>
              <li>
                <Link to="/admin/dashboard" className="admin-nav-item active">
                  <span className="admin-nav-icon"><i className="fas fa-tachometer-alt"></i></span>
                  <span className="admin-nav-text">Tổng quan</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-users"></i></span>
                  <span className="admin-nav-text">Quản lý người dùng</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/products" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-car"></i></span>
                  <span className="admin-nav-text">Quản lý sản phẩm</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-shopping-cart"></i></span>
                  <span className="admin-nav-text">Quản lý đơn hàng</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/dealers" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-store"></i></span>
                  <span className="admin-nav-text">Quản lý đại lý</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/inventory" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-warehouse"></i></span>
                  <span className="admin-nav-text">Quản lý tồn kho</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/marketing" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-bullhorn"></i></span>
                  <span className="admin-nav-text">Quản lý marketing</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/blog" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-newspaper"></i></span>
                  <span className="admin-nav-text">Quản lý bài viết</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/support" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-headset"></i></span>
                  <span className="admin-nav-text">Quản lý hỗ trợ</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-cog"></i></span>
                  <span className="admin-nav-text">Cài đặt hệ thống</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-main">
          <div className="admin-stats">
            {statsData.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-header">
                  <h3>{stat.name}</h3>
                  <i className={stat.icon} style={{ color: stat.color }}></i>
                </div>
                <p className="stat-number" style={{ color: stat.color }}>{stat.name === 'Doanh thu' ? `${stat.value} tỷ` : stat.value}</p>
                <p className="stat-detail">
                  <span className="stat-change-value">{stat.changeValue}</span> {stat.changeText}
                </p>
              </div>
            ))}
          </div>
          
          {window.Recharts ? (
            <>
              {/* Biểu đồ 1: Doanh thu */}
              <div className="admin-section chart-section">
                <h2>
                  <span className="admin-section-icon"><i className="fas fa-chart-line"></i></span>
                  Biểu đồ doanh thu năm 2023
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" tickFormatter={(value: number) => `${value} tỷ`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#000" />
                      <Bar 
                        yAxisId="left" 
                        dataKey="value" 
                        name="Doanh thu (tỷ)" 
                        fill={TREND_COLORS.increase} 
                        barSize={25}
                      >
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                        ))}
                      </Bar>
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="value" 
                        name="Xu hướng doanh thu" 
                        stroke="#333" 
                        dot={false} 
                        activeDot={{ r: 8 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Biểu đồ 2: Người dùng */}
              <div className="admin-section chart-section">
                <h2>
                  <span className="admin-section-icon"><i className="fas fa-users"></i></span>
                  Biểu đồ người dùng năm 2023
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={monthlyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value: number) => `${value}`} />
                      <Tooltip formatter={(value: number, name: string) => [`${value} người`, 'Người dùng']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        name="Người dùng" 
                        stroke={statsData[0].color} 
                        fill={`${statsData[0].color}33`} 
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Biểu đồ 3: Đơn hàng */}
              <div className="admin-section chart-section">
                <h2>
                  <span className="admin-section-icon"><i className="fas fa-shopping-cart"></i></span>
                  Biểu đồ đơn hàng năm 2023
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value: number) => `${value}`} />
                      <Tooltip formatter={(value: number, name: string) => [`${value} đơn`, 'Đơn hàng']} />
                      <Legend />
                      <Bar 
                        dataKey="orders" 
                        name="Đơn hàng" 
                        fill={statsData[1].color} 
                        barSize={25}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Biểu đồ 4: Lái thử */}
              <div className="admin-section chart-section">
                <h2>
                  <span className="admin-section-icon"><i className="fas fa-car"></i></span>
                  Biểu đồ lái thử năm 2023
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value: number) => `${value}`} />
                      <Tooltip formatter={(value: number, name: string) => [`${value} lượt`, 'Lái thử']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="testdrives" 
                        name="Lái thử" 
                        stroke={statsData[3].color} 
                        fill={statsData[3].color}
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-section chart-section">
              <h2>
                <span className="admin-section-icon"><i className="fas fa-chart-bar"></i></span>
                Biểu đồ doanh thu năm 2023
              </h2>
              <div className="chart-container">
                <canvas ref={canvasRef} className="revenue-chart" height="300"></canvas>
              </div>
            </div>
          )}
          
          <div className="admin-recent">
            <div className="admin-section">
              <h2>
                <span className="admin-section-icon"><i className="fas fa-shopping-cart"></i></span>
                Đơn hàng gần đây
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#12345</td>
                    <td>Nguyễn Văn A</td>
                    <td>Audi A4 2023</td>
                    <td>1.45 tỷ</td>
                    <td><span className="status pending">Đang xử lý</span></td>
                    <td><a href="#view">Xem</a></td>
                  </tr>
                  <tr>
                    <td>#12344</td>
                    <td>Trần Thị B</td>
                    <td>Audi Q5 2023</td>
                    <td>1.85 tỷ</td>
                    <td><span className="status completed">Đã thanh toán</span></td>
                    <td><a href="#view">Xem</a></td>
                  </tr>
                  <tr>
                    <td>#12343</td>
                    <td>Lê Văn C</td>
                    <td>Audi e-tron GT</td>
                    <td>3.25 tỷ</td>
                    <td><span className="status pending">Đang xử lý</span></td>
                    <td><a href="#view">Xem</a></td>
                  </tr>
                </tbody>
              </table>
              <a href="#all-orders" className="view-all-link">Xem tất cả đơn hàng <i className="fas fa-arrow-right"></i></a>
            </div>
            
            <div className="admin-section">
              <h2>
                <span className="admin-section-icon"><i className="fas fa-headset"></i></span>
                Yêu cầu hỗ trợ gần đây
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Tiêu đề</th>
                    <th>Ưu tiên</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#S-156</td>
                    <td>Phạm Thị D</td>
                    <td>Vấn đề đặt lịch lái thử</td>
                    <td><span className="priority high">Cao</span></td>
                    <td><span className="status new">Mới</span></td>
                    <td><a href="#view">Xem</a></td>
                  </tr>
                  <tr>
                    <td>#S-155</td>
                    <td>Hoàng Văn E</td>
                    <td>Câu hỏi về bảo dưỡng</td>
                    <td><span className="priority medium">Trung bình</span></td>
                    <td><span className="status in-progress">Đang xử lý</span></td>
                    <td><a href="#view">Xem</a></td>
                  </tr>
                </tbody>
              </table>
              <a href="#all-support" className="view-all-link">Xem tất cả yêu cầu <i className="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;