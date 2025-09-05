import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  message, 
  Spin,
  Empty,
  Modal,
  Descriptions,
  Divider,
  Image,
  Tooltip,
  Badge,
  Input,
  Select,
  Timeline,
  Progress,
  Statistic,
  Avatar,
  Drawer,
  Steps,
  Alert,
  DatePicker,
  List,
  Skeleton
} from 'antd';
import { 
  ShoppingCartOutlined, 
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  DollarOutlined,
  TruckOutlined,
  SettingOutlined,
  HistoryOutlined,
  FileTextOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  UserOutlined,
  StarOutlined,
  ShareAltOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/MyAudi.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;
const BACKEND_URL = 'http://localhost:8080/api/v1';

interface DonHang {
  id: number;
  maDonHang?: string;
  tenNguoiDung: string;
  tenMau?: string;
  tongTien: number;
  trangThai: string;
  ngayDat: string;
  ngayGiaoDuKien?: string;
  phuongThucThanhToan: string;
  tienDatCoc: number;
  ghiChu?: string;
  tenDaiLy?: string;
  cauHinh?: {
    tenCauHinh: string;
    mauSac?: string;
    noiThat?: string;
    banhXe?: string;
  };
  lichSuTrangThai?: {
    trangThai: string;
    ngayCapNhat: string;
    ghiChu?: string;
  }[];
}

const MyOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donHangList, setDonHangList] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [timelineDrawerVisible, setTimelineDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ngayDat');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDonHang();
    }
  }, [isAuthenticated, user]);

  const loadDonHang = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/don-hang/nguoi-dung/${user!.userId}`);
      setDonHangList(response.data);
      console.log('Danh sách đơn hàng:', response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (donHang: DonHang) => {
    setSelectedOrder(donHang);
    setPreviewModalVisible(true);
  };

  const getStatusColor = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly': return 'orange';
      case 'da_xac_nhan': return 'blue';
      case 'dang_san_xuat': return 'purple';
      case 'san_sang_giao': return 'green';
      case 'da_giao': return 'success';
      case 'da_huy': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly': return 'Chờ xử lý';
      case 'da_xac_nhan': return 'Đã xác nhận';
      case 'dang_san_xuat': return 'Đang sản xuất';
      case 'san_sang_giao': return 'Sẵn sàng giao';
      case 'da_giao': return 'Đã giao';
      case 'da_huy': return 'Đã hủy';
      default: return trangThai;
    }
  };

  const getStatusIcon = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly': return <ClockCircleOutlined />;
      case 'da_xac_nhan': return <CheckCircleOutlined />;
      case 'dang_san_xuat': return <CarOutlined />;
      case 'san_sang_giao': return <CheckCircleOutlined />;
      case 'da_giao': return <CheckCircleOutlined />;
      case 'da_huy': return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Advanced filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = donHangList;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.maDonHang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tenMau?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.cauHinh?.tenCauHinh?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.trangThai === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ngayDat':
          return new Date(b.ngayDat).getTime() - new Date(a.ngayDat).getTime();
        case 'tongTien':
          return b.tongTien - a.tongTien;
        case 'trangThai':
          return a.trangThai.localeCompare(b.trangThai);
        default:
          return 0;
      }
    });

    return filtered;
  }, [donHangList, searchQuery, statusFilter, sortBy]);

  // Statistics calculations
  const orderStats = useMemo(() => {
    const totalOrders = donHangList.length;
    const totalValue = donHangList.reduce((sum, order) => sum + order.tongTien, 0);
    const totalDeposit = donHangList.reduce((sum, order) => sum + order.tienDatCoc, 0);
    const pendingOrders = donHangList.filter(o => o.trangThai === 'cho_xu_ly').length;
    const processingOrders = donHangList.filter(o => ['da_xac_nhan', 'dang_san_xuat'].includes(o.trangThai)).length;
    const completedOrders = donHangList.filter(o => o.trangThai === 'da_giao').length;
    const cancelledOrders = donHangList.filter(o => o.trangThai === 'da_huy').length;

    return {
      totalOrders,
      totalValue,
      totalDeposit,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders
    };
  }, [donHangList]);

  const getOrderProgress = (trangThai: string) => {
    const progressMap = {
      cho_xu_ly: 10,
      da_xac_nhan: 25,
      dang_san_xuat: 60,
      san_sang_giao: 85,
      da_giao: 100,
      da_huy: 0,
    } as const;
    type TrangThaiKey = keyof typeof progressMap;
    return progressMap[(trangThai as TrangThaiKey)] ?? 0;
  };

  if (!isAuthenticated) {
    return (
      <div className="my-audi-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={2}>Vui lòng đăng nhập để xem đơn hàng</Title>
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-audi-container">
      {/* Professional Header with User Info */}
      <div className="my-audi-header professional-header">
        <div className="header-content">
          <div className="header-left">
            <Avatar size={64} icon={<UserOutlined />} className="user-avatar" />
            <div className="header-info">
              <Title level={2} className="header-title">
                <ShoppingCartOutlined /> Đơn hàng của tôi
              </Title>
              <Text className="header-subtitle">
                Chào mừng trở lại, {user?.fullName || 'Audi Enthusiast'} - Theo dõi hành trình đặt xe của bạn
              </Text>
            </div>
          </div>
          <Space className="header-actions">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadDonHang}
              loading={loading}
              className="action-btn"
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/models')}
              className="primary-action-btn"
            >
              Đặt hàng mới
            </Button>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setTimelineDrawerVisible(true)}
              className="action-btn"
            >
              Cài đặt
            </Button>
          </Space>
        </div>
      </div>

      {/* Professional Statistics Dashboard */}
      <div className="statistics-section">
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-primary" hoverable>
              <Statistic
                title="Tổng đơn hàng"
                value={orderStats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#60a5fa' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-success" hoverable>
              <Statistic
                title="Tổng giá trị"
                value={orderStats.totalValue}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#34d399' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-warning" hoverable>
              <Statistic
                title="Đặt cọc"
                value={orderStats.totalDeposit}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#fbbf24' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-purple" hoverable>
              <Statistic
                title="Hoàn thành"
                value={orderStats.completedOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#a78bfa' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Advanced Control Panel */}
      <div className="controls-section">
        <Card className="controls-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm theo mã đơn, mẫu xe, cấu hình..."
                onSearch={setSearchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                enterButton
                className="search-input"
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Lọc trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                className="filter-select"
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="cho_xu_ly">Chờ xử lý</Option>
                <Option value="da_xac_nhan">Đã xác nhận</Option>
                <Option value="dang_san_xuat">Đang sản xuất</Option>
                <Option value="san_sang_giao">Sẵn sàng giao</Option>
                <Option value="da_giao">Đã giao</Option>
                <Option value="da_huy">Đã hủy</Option>
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Sắp xếp theo"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                className="sort-select"
              >
                <Option value="ngayDat">Mới nhất</Option>
                <Option value="tongTien">Giá cao nhất</Option>
                <Option value="trangThai">Trạng thái</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div className="view-controls">
                <Space>
                  <Button.Group>
                    <Button
                      type={viewMode === 'grid' ? 'primary' : 'default'}
                      onClick={() => setViewMode('grid')}
                      icon={<FilterOutlined />}
                    >
                      Lưới
                    </Button>
                    <Button
                      type={viewMode === 'list' ? 'primary' : 'default'}
                      onClick={() => setViewMode('list')}
                      icon={<SortAscendingOutlined />}
                    >
                      Danh sách
                    </Button>
                    <Button
                      type={viewMode === 'timeline' ? 'primary' : 'default'}
                      onClick={() => setViewMode('timeline')}
                      icon={<HistoryOutlined />}
                    >
                      Timeline
                    </Button>
                  </Button.Group>
                  <Text type="secondary">
                    {filteredAndSortedOrders.length} / {donHangList.length} đơn hàng
                  </Text>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="content-area">
        {loading ? (
          <div className="loading-section">
            <div className="skeleton-header">
              <Skeleton.Avatar size={64} active />
              <div style={{ marginLeft: 16, flex: 1 }}>
                <Skeleton.Input style={{ width: 200 }} active />
                <Skeleton.Input style={{ width: 300, marginTop: 8 }} active />
              </div>
            </div>
            <Row gutter={[20, 20]} style={{ marginTop: 32 }}>
              {[...Array(6)].map((_, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <Card className="skeleton-card">
                    <Skeleton loading active>
                      <Card.Meta
                        avatar={<Avatar size={40} />}
                        title="Loading..."
                        description="Loading order..."
                      />
                    </Skeleton>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="empty-state">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                donHangList.length === 0 
                  ? "Bạn chưa có đơn hàng nào" 
                  : "Không tìm thấy đơn hàng nào phù hợp"
              }
              className="professional-empty"
            >
              {donHangList.length === 0 ? (
                <Button type="primary" size="large" onClick={() => navigate('/models')} className="empty-action-btn">
                  <ShoppingCartOutlined /> Đặt hàng ngay
                </Button>
              ) : (
                <Button onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }} className="empty-action-btn">
                  Xóa bộ lọc
                </Button>
              )}
            </Empty>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-view">
            <Row gutter={[20, 20]}>
              {filteredAndSortedOrders.map((donHang, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={donHang.id}>
                  <Card
                    hoverable
                    className={`order-card professional-card animate-card`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    actions={[
                      <Tooltip title="Xem chi tiết" key="view">
                        <Button 
                          type="text" 
                          icon={<EyeOutlined />}
                          onClick={() => handleViewOrder(donHang)}
                          className="card-action-btn"
                        />
                      </Tooltip>,
                      <Tooltip title="Theo dõi" key="track">
                        <Button 
                          type="text" 
                          icon={<TruckOutlined />}
                          className="card-action-btn"
                        />
                      </Tooltip>,
                      <Tooltip title="Chia sẻ" key="share">
                        <Button 
                          type="text" 
                          icon={<ShareAltOutlined />}
                          className="card-action-btn"
                        />
                      </Tooltip>,
                      <Tooltip title="Tải hóa đơn" key="download">
                        <Button 
                          type="text" 
                          icon={<DownloadOutlined />}
                          className="card-action-btn"
                        />
                      </Tooltip>
                    ]}
                  >
                    <Badge.Ribbon 
                      text={getStatusText(donHang.trangThai)} 
                      color={getStatusColor(donHang.trangThai)} 
                      className="premium-ribbon"
                    >
                      <div className="order-info professional-info">
                        <div className="order-card-header professional-header-card">
                          <Title level={4} className="professional-title">
                            #{donHang.id} - {donHang.tenMau || 'Audi'}
                          </Title>
                          <div className="card-tags">
                            <Tag color="blue" className="model-tag">
                              {donHang.tenMau || 'Audi'}
                            </Tag>
                            <Tag icon={<CalendarOutlined />} className="date-tag">
                              {formatDate(donHang.ngayDat)}
                            </Tag>
                          </div>
                        </div>
                        
                        <div className="order-details professional-details">
                          <div className="detail-grid">
                            {donHang.cauHinh && (
                              <div className="detail-item professional-detail">
                                <div className="detail-icon">
                                  <SettingOutlined className="detail-icon-svg" />
                                </div>
                                <div className="detail-content">
                                  <Text className="detail-label">Cấu hình</Text>
                                  <Text className="detail-value">{donHang.cauHinh.tenCauHinh}</Text>
                                </div>
                              </div>
                            )}
                            
                            <div className="detail-item professional-detail">
                              <div className="detail-icon">
                                <DollarOutlined className="detail-icon-svg" />
                              </div>
                              <div className="detail-content">
                                <Text className="detail-label">Thanh toán</Text>
                                <Text className="detail-value">{donHang.phuongThucThanhToan}</Text>
                              </div>
                            </div>
                            
                            {donHang.tenDaiLy && (
                              <div className="detail-item professional-detail">
                                <div className="detail-icon">
                                  <EnvironmentOutlined className="detail-icon-svg" />
                                </div>
                                <div className="detail-content">
                                  <Text className="detail-label">Đại lý</Text>
                                  <Text className="detail-value">{donHang.tenDaiLy}</Text>
                                </div>
                              </div>
                            )}
                            
                            {donHang.ngayGiaoDuKien && (
                              <div className="detail-item professional-detail">
                                <div className="detail-icon">
                                  <TruckOutlined className="detail-icon-svg" />
                                </div>
                                <div className="detail-content">
                                  <Text className="detail-label">Giao hàng</Text>
                                  <Text className="detail-value">{formatDate(donHang.ngayGiaoDuKien)}</Text>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Divider className="professional-divider" />
                        
                        <div className="order-footer">
                          <div className="price-section professional-price">
                            <div className="price-container">
                              <Text className="price-label">Tổng giá trị</Text>
                              <div className="price-display">
                                <Text className="price-value-main">
                                  {formatCurrency(donHang.tongTien)}
                                </Text>
                              </div>
                              {donHang.tienDatCoc > 0 && (
                                <Text className="deposit-text">
                                  Đặt cọc: {formatCurrency(donHang.tienDatCoc)}
                                </Text>
                              )}
                            </div>
                          </div>
                          
                          <div className="card-meta">
                            <Progress 
                              percent={getOrderProgress(donHang.trangThai)}
                              strokeColor={{
                                '0%': '#667eea',
                                '100%': '#764ba2',
                              }}
                              className="order-progress"
                              showInfo={false}
                            />
                          </div>
                        </div>
                      </div>
                    </Badge.Ribbon>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : viewMode === 'list' ? (
          <div className="list-view">
            <List
              itemLayout="vertical"
              size="large"
              dataSource={filteredAndSortedOrders}
              renderItem={(donHang, index) => (
                <List.Item
                  key={donHang.id}
                  className={`list-item professional-list-item animate-list-item`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  actions={[
                    <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => handleViewOrder(donHang)}>Chi tiết</Button>,
                    <Button key="track" type="text" icon={<TruckOutlined />}>Theo dõi</Button>,
                    <Button key="share" type="text" icon={<ShareAltOutlined />}>Chia sẻ</Button>,
                    <Button key="download" type="text" icon={<DownloadOutlined />}>Tải về</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size={64} icon={<ShoppingCartOutlined />} className="list-avatar" />}
                    title={
                      <div className="list-title-section">
                        <Text className="list-title">Đơn hàng #{donHang.id}</Text>
                        <div className="list-tags">
                          <Tag color={getStatusColor(donHang.trangThai)}>{getStatusText(donHang.trangThai)}</Tag>
                          <Tag>{donHang.tenMau}</Tag>
                        </div>
                      </div>
                    }
                    description={
                      <div className="list-description">
                        <Space wrap>
                          <Text type="secondary">Đặt: {formatDate(donHang.ngayDat)}</Text>
                          {donHang.cauHinh && <Text type="secondary">Cấu hình: {donHang.cauHinh.tenCauHinh}</Text>}
                          {donHang.tenDaiLy && <Text type="secondary">Đại lý: {donHang.tenDaiLy}</Text>}
                          <Text type="secondary">Thanh toán: {donHang.phuongThucThanhToan}</Text>
                        </Space>
                        <Progress 
                          percent={getOrderProgress(donHang.trangThai)} 
                          strokeColor="#3b82f6"
                          className="list-progress"
                          style={{ marginTop: 8 }}
                        />
                      </div>
                    }
                  />
                  <div className="list-price-section">
                    <Text className="list-price">{formatCurrency(donHang.tongTien)}</Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <div className="timeline-view">
            <Timeline mode="left" className="professional-timeline">
              {filteredAndSortedOrders.map((donHang, index) => (
                <Timeline.Item 
                  key={donHang.id}
                  color={getStatusColor(donHang.trangThai)}
                  dot={getStatusIcon(donHang.trangThai)}
                  className={`timeline-item animate-timeline-item`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="timeline-card professional-card" hoverable>
                    <div className="timeline-card-content">
                      <div className="timeline-header">
                        <Title level={4}>Đơn hàng #{donHang.id}</Title>
                        <Tag color={getStatusColor(donHang.trangThai)}>
                          {getStatusText(donHang.trangThai)}
                        </Tag>
                      </div>
                      
                      <div className="timeline-details">
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Text type="secondary">Mẫu xe:</Text>
                            <Text strong style={{ marginLeft: 8 }}>{donHang.tenMau}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Ngày đặt:</Text>
                            <Text style={{ marginLeft: 8 }}>{formatDate(donHang.ngayDat)}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Tổng tiền:</Text>
                            <Text strong style={{ color: '#52c41a', marginLeft: 8 }}>
                              {formatCurrency(donHang.tongTien)}
                            </Text>
                          </Col>
                          {donHang.ngayGiaoDuKien && (
                            <Col span={12}>
                              <Text type="secondary">Dự kiến giao:</Text>
                              <Text style={{ marginLeft: 8 }}>{formatDate(donHang.ngayGiaoDuKien)}</Text>
                            </Col>
                          )}
                        </Row>
                      </div>
                      
                      <div className="timeline-actions">
                        <Space>
                          <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewOrder(donHang)}>
                            Chi tiết
                          </Button>
                          <Button size="small" icon={<TruckOutlined />}>
                            Theo dõi
                          </Button>
                        </Space>
                      </div>
                      
                      <Progress 
                        percent={getOrderProgress(donHang.trangThai)}
                        strokeColor="#3b82f6"
                        className="timeline-progress"
                        style={{ marginTop: 16 }}
                      />
                    </div>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </div>

      {/* Settings Drawer */}
      <Drawer
        title="Cài đặt đơn hàng"
        placement="right"
        onClose={() => setTimelineDrawerVisible(false)}
        open={timelineDrawerVisible}
        width={320}
        className="settings-drawer"
      >
        <div className="drawer-content">
          <Title level={4}>Tùy chỉnh hiển thị</Title>
          <Divider />
          <div className="setting-item">
            <Text>Chế độ xem mặc định</Text>
            <Select value={viewMode} onChange={setViewMode} style={{ width: '100%', marginTop: 8 }}>
              <Option value="grid">Lưới</Option>
              <Option value="list">Danh sách</Option>
              <Option value="timeline">Timeline</Option>
            </Select>
          </div>
          <div className="setting-item">
            <Text>Sắp xếp mặc định</Text>
            <Select value={sortBy} onChange={setSortBy} style={{ width: '100%', marginTop: 8 }}>
              <Option value="ngayDat">Ngày đặt</Option>
              <Option value="tongTien">Tổng tiền</Option>
              <Option value="trangThai">Trạng thái</Option>
            </Select>
          </div>
          <div className="setting-item">
            <Text>Thông báo</Text>
            <Alert
              message="Theo dõi đơn hàng"
              description="Bạn sẽ nhận được thông báo khi trạng thái đơn hàng thay đổi."
              type="info"
              showIcon
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </Drawer>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã đơn hàng">
              #{selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedOrder.trangThai)}>
                {getStatusText(selectedOrder.trangThai)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {formatDate(selectedOrder.ngayDat)}
            </Descriptions.Item>
            {selectedOrder.cauHinh && (
              <Descriptions.Item label="Cấu hình xe">
                {selectedOrder.cauHinh.tenCauHinh}
              </Descriptions.Item>
            )}
            {selectedOrder.tenMau && (
              <Descriptions.Item label="Mẫu xe">
                {selectedOrder.tenMau}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tổng tiền">
              <Text strong style={{ color: '#3b82f6', fontSize: '18px' }}>
                {formatCurrency(selectedOrder.tongTien)}
              </Text>
            </Descriptions.Item>
            {selectedOrder.tienDatCoc > 0 && (
              <Descriptions.Item label="Tiền đặt cọc">
                {formatCurrency(selectedOrder.tienDatCoc)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder.phuongThucThanhToan}
            </Descriptions.Item>
            {selectedOrder.ngayGiaoDuKien && (
              <Descriptions.Item label="Ngày giao dự kiến">
                {formatDate(selectedOrder.ngayGiaoDuKien)}
              </Descriptions.Item>
            )}
            {selectedOrder.ghiChu && (
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.ghiChu}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders; 