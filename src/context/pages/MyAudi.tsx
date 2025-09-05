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
  Popconfirm,
  Tooltip,
  Input,
  Select,
  Skeleton,
  Avatar,
  Progress,
  Statistic,
  Badge,
  Drawer,
  List
} from 'antd';
import { 
  CarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  HeartOutlined,
  ShareAltOutlined,
  StarOutlined,
  CalendarOutlined,
  DollarOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cauHinhService, CauHinhTuyChinh } from '../../services/cauHinhService';
import '../../styles/MyAudi.css';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const MyAudi: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cauHinhList, setCauHinhList] = useState<CauHinhTuyChinh[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCauHinh, setSelectedCauHinh] = useState<CauHinhTuyChinh | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ngayTao');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCauHinhList();
    }
  }, [isAuthenticated, user]);

  const loadCauHinhList = async () => {
    try {
      setLoading(true);
      const data = await cauHinhService.getCauHinhByNguoiDung(user!.userId!);
      setCauHinhList(data);
      console.log('Danh sách cấu hình:', data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách cấu hình:', error);
      message.error('Không thể tải danh sách cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (cauHinh: CauHinhTuyChinh) => {
    setSelectedCauHinh(cauHinh);
    setPreviewModalVisible(true);
  };

  const handleEdit = (cauHinh: CauHinhTuyChinh) => {
    // SỬA: Sử dụng navigate thay vì window.location.href
    navigate(`/configure/${cauHinh.idMau}?configId=${cauHinh.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await cauHinhService.deleteCauHinh(id);
      message.success('Đã xóa cấu hình thành công');
      loadCauHinhList(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi khi xóa cấu hình:', error);
      message.error('Không thể xóa cấu hình');
    } finally {
      setDeleting(null);
    }
  };

  const handleXuatPDF = async (id: number) => {
    try {
      const blob = await cauHinhService.xuatPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cau-hinh-xe-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất PDF thành công');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      message.error('Không thể xuất PDF');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Advanced filtering and sorting
  const filteredAndSortedConfigs = useMemo(() => {
    let filtered = cauHinhList;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(config => 
        config.ten?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.tenMau?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.tenMauSac?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(config => config.tenMau === filterBy);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ngayTao':
          return new Date(b.ngayTao || '').getTime() - new Date(a.ngayTao || '').getTime();
        case 'tongGia':
          return b.tongGia - a.tongGia;
        case 'ten':
          return (a.ten || '').localeCompare(b.ten || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [cauHinhList, searchQuery, filterBy, sortBy]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalConfigs = cauHinhList.length;
    const totalValue = cauHinhList.reduce((sum, config) => sum + config.tongGia, 0);
    const averagePrice = totalConfigs > 0 ? totalValue / totalConfigs : 0;
    const mostExpensive = cauHinhList.length > 0 ? Math.max(...cauHinhList.map(c => c.tongGia)) : 0;
    const uniqueModels = new Set(cauHinhList.map(c => c.tenMau)).size;

    return {
      totalConfigs,
      totalValue,
      averagePrice,
      mostExpensive,
      uniqueModels
    };
  }, [cauHinhList]);

  useScrollToTop();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Vui lòng đăng nhập để xem cấu hình xe của bạn</Title>
        <Button type="primary" size="large" href="/login">
          Đăng nhập
        </Button>
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
                <CarOutlined /> Garage cá nhân
              </Title>
              <Text className="header-subtitle">
                Chào mừng trở lại, {user?.fullName || 'Audi Enthusiast'}
              </Text>
            </div>
          </div>
          <Space className="header-actions">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadCauHinhList}
              loading={loading}
              className="action-btn"
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              href="/models"
              className="primary-action-btn"
            >
              Tạo cấu hình mới
            </Button>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setDrawerVisible(true)}
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
                title="Tổng cấu hình"
                value={statistics.totalConfigs}
                prefix={<CarOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-success" hoverable>
              <Statistic
                title="Tổng giá trị"
                value={statistics.totalValue}
                formatter={(value) => formatPrice(Number(value))}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-warning" hoverable>
              <Statistic
                title="Giá trung bình"
                value={statistics.averagePrice}
                formatter={(value) => formatPrice(Number(value))}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card stat-card-purple" hoverable>
              <Statistic
                title="Mẫu xe khác nhau"
                value={statistics.uniqueModels}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Advanced Filter and Search Controls */}
      <div className="controls-section">
        <Card className="controls-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm theo tên, mẫu xe, màu sắc..."
                onSearch={setSearchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                enterButton
                className="search-input"
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Lọc theo mẫu"
                value={filterBy}
                onChange={setFilterBy}
                style={{ width: '100%' }}
                className="filter-select"
              >
                <Option value="all">Tất cả mẫu</Option>
                {Array.from(new Set(cauHinhList.map(c => c.tenMau))).map(model => (
                  <Option key={model} value={model}>{model}</Option>
                ))}
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
                <Option value="ngayTao">Mới nhất</Option>
                <Option value="tongGia">Giá cao nhất</Option>
                <Option value="ten">Tên A-Z</Option>
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
                  </Button.Group>
                  <Text type="secondary">
                    {filteredAndSortedConfigs.length} / {cauHinhList.length} cấu hình
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
                        description="Loading configuration..."
                      />
                    </Skeleton>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : filteredAndSortedConfigs.length === 0 ? (
          <div className="empty-state">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                cauHinhList.length === 0 
                  ? "Bạn chưa có cấu hình xe nào" 
                  : "Không tìm thấy cấu hình nào phù hợp"
              }
              className="professional-empty"
            >
              {cauHinhList.length === 0 ? (
                <Button type="primary" size="large" href="/models" className="empty-action-btn">
                  <PlusOutlined /> Tạo cấu hình đầu tiên
                </Button>
              ) : (
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterBy('all');
                }} className="empty-action-btn">
                  Xóa bộ lọc
                </Button>
              )}
            </Empty>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-view">
            <Row gutter={[20, 20]}>
              {filteredAndSortedConfigs.map((cauHinh, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={cauHinh.id}>
                  <Card
                    hoverable
                    className={`cau-hinh-card professional-card animate-card`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    actions={[
                      <Tooltip title="Xem chi tiết" key="view">
                        <Button 
                          type="text" 
                          icon={<EyeOutlined />}
                          onClick={() => handlePreview(cauHinh)}
                          className="card-action-btn"
                        />
                      </Tooltip>,
                      <Tooltip title="Chỉnh sửa" key="edit">
                        <Button 
                          type="text" 
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(cauHinh)}
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
                      <Tooltip title="Xuất PDF" key="download">
                        <Button 
                          type="text" 
                          icon={<DownloadOutlined />}
                          onClick={() => handleXuatPDF(cauHinh.id!)}
                          className="card-action-btn"
                        />
                      </Tooltip>,
                      <Popconfirm
                        title="Xóa cấu hình"
                        description="Bạn có chắc chắn muốn xóa cấu hình này?"
                        onConfirm={() => handleDelete(cauHinh.id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                        key="delete"
                      >
                        <Tooltip title="Xóa">
                          <Button 
                            type="text" 
                            icon={<DeleteOutlined />}
                            loading={deleting === cauHinh.id}
                            className="card-action-btn danger-btn"
                          />
                        </Tooltip>
                      </Popconfirm>
                    ]}
                  >
                    <Badge.Ribbon text="Premium" color="gold" className="premium-ribbon">
                      <div className="cau-hinh-info professional-info">
                        <div className="cau-hinh-header professional-header-card">
                          <Title level={4} className="cau-hinh-title professional-title">
                            {cauHinh.ten || `${cauHinh.tenMau} Custom`}
                          </Title>
                          <div className="card-tags">
                            <Tag color="blue" className="model-tag">{cauHinh.tenMau}</Tag>
                            <Tag icon={<CalendarOutlined />} className="date-tag">
                              {formatDate(cauHinh.ngayTao || '')}
                            </Tag>
                          </div>
                        </div>
                        
                        <div className="cau-hinh-details professional-details">
                          <div className="detail-grid">
                            <div className="detail-item professional-detail">
                              <div className="detail-icon">
                                <div className="color-preview" style={{ backgroundColor: '#' + (cauHinh.tenMauSac?.toLowerCase().includes('đen') ? '000' : cauHinh.tenMauSac?.toLowerCase().includes('trắng') ? 'fff' : '999') }}></div>
                              </div>
                              <div className="detail-content">
                                <Text className="detail-label">Màu sắc</Text>
                                <Text className="detail-value">{cauHinh.tenMauSac}</Text>
                              </div>
                            </div>
                            
                            {cauHinh.tenNoiThat && (
                              <div className="detail-item professional-detail">
                                <div className="detail-icon">
                                  <SettingOutlined className="detail-icon-svg" />
                                </div>
                                <div className="detail-content">
                                  <Text className="detail-label">Nội thất</Text>
                                  <Text className="detail-value">{cauHinh.tenNoiThat}</Text>
                                </div>
                              </div>
                            )}
                            
                            {cauHinh.tenBanhXe && (
                              <div className="detail-item professional-detail">
                                <div className="detail-icon">
                                  <CarOutlined className="detail-icon-svg" />
                                </div>
                                <div className="detail-content">
                                  <Text className="detail-label">Bánh xe</Text>
                                  <Text className="detail-value">{cauHinh.tenBanhXe}</Text>
                                </div>
                              </div>
                            )}
                            
                            {cauHinh.danhSachTuyChon && cauHinh.danhSachTuyChon.length > 0 && (
                              <div className="detail-item professional-detail">
                                <div className="detail-icon">
                                  <Badge count={cauHinh.danhSachTuyChon.length} size="small">
                                    <StarOutlined className="detail-icon-svg" />
                                  </Badge>
                                </div>
                                <div className="detail-content">
                                  <Text className="detail-label">Tùy chọn</Text>
                                  <Text className="detail-value">{cauHinh.danhSachTuyChon.length} mục</Text>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Divider className="professional-divider" />
                        
                        <div className="cau-hinh-footer">
                          <div className="price-section professional-price">
                            <div className="price-container">
                              <Text className="price-label">Tổng giá trị</Text>
                              <div className="price-display">
                                <Text className="price-value-main">
                                  {formatPrice(cauHinh.tongGia)}
                                </Text>
                              </div>
                            </div>
                          </div>
                          
                          <div className="card-meta">
                            <Progress 
                              percent={Math.min((cauHinh.tongGia / statistics.mostExpensive) * 100, 100)} 
                              showInfo={false} 
                              strokeColor="#3b82f6"
                              className="price-progress"
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
        ) : (
          <div className="list-view">
            <List
              itemLayout="vertical"
              size="large"
              dataSource={filteredAndSortedConfigs}
              renderItem={(cauHinh, index) => (
                <List.Item
                  key={cauHinh.id}
                  className={`list-item professional-list-item animate-list-item`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  actions={[
                    <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => handlePreview(cauHinh)}>Xem</Button>,
                    <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(cauHinh)}>Sửa</Button>,
                    <Button key="download" type="text" icon={<DownloadOutlined />} onClick={() => handleXuatPDF(cauHinh.id!)}>PDF</Button>,
                    <Popconfirm key="delete" title="Xóa cấu hình?" onConfirm={() => handleDelete(cauHinh.id!)}>
                      <Button type="text" icon={<DeleteOutlined />} danger loading={deleting === cauHinh.id}>Xóa</Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size={64} icon={<CarOutlined />} className="list-avatar" />}
                    title={
                      <div className="list-title-section">
                        <Text className="list-title">{cauHinh.ten || `${cauHinh.tenMau} Custom`}</Text>
                        <div className="list-tags">
                          <Tag color="blue">{cauHinh.tenMau}</Tag>
                          <Tag>{formatDate(cauHinh.ngayTao || '')}</Tag>
                        </div>
                      </div>
                    }
                    description={
                      <div className="list-description">
                        <Space wrap>
                          <Text type="secondary">Màu: {cauHinh.tenMauSac}</Text>
                          {cauHinh.tenNoiThat && <Text type="secondary">Nội thất: {cauHinh.tenNoiThat}</Text>}
                          {cauHinh.tenBanhXe && <Text type="secondary">Bánh xe: {cauHinh.tenBanhXe}</Text>}
                          {cauHinh.danhSachTuyChon?.length && <Text type="secondary">{cauHinh.danhSachTuyChon.length} tùy chọn</Text>}
                        </Space>
                      </div>
                    }
                  />
                  <div className="list-price-section">
                    <Text className="list-price">{formatPrice(cauHinh.tongGia)}</Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      {/* Settings Drawer */}
      <Drawer
        title="Cài đặt cá nhân hóa"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={320}
        className="settings-drawer"
      >
        <div className="drawer-content">
          <Title level={4}>Tùy chỉnh giao diện</Title>
          <Divider />
          <div className="setting-item">
            <Text>Chế độ xem mặc định</Text>
            <Select value={viewMode} onChange={setViewMode} style={{ width: '100%', marginTop: 8 }}>
              <Option value="grid">Lưới</Option>
              <Option value="list">Danh sách</Option>
            </Select>
          </div>
          <div className="setting-item">
            <Text>Sắp xếp mặc định</Text>
            <Select value={sortBy} onChange={setSortBy} style={{ width: '100%', marginTop: 8 }}>
              <Option value="ngayTao">Mới nhất</Option>
              <Option value="tongGia">Giá cao nhất</Option>
              <Option value="ten">Tên A-Z</Option>
            </Select>
          </div>
        </div>
      </Drawer>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết cấu hình xe"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setPreviewModalVisible(false);
              if (selectedCauHinh) handleEdit(selectedCauHinh);
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={800}
      >
        {selectedCauHinh && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Tên cấu hình" span={2}>
              {selectedCauHinh.ten || 'Không có tên'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Mẫu xe">
              {selectedCauHinh.tenMau}
            </Descriptions.Item>
            
            <Descriptions.Item label="Màu sắc">
              {selectedCauHinh.tenMauSac}
            </Descriptions.Item>
            
            {selectedCauHinh.tenNoiThat && (
              <Descriptions.Item label="Nội thất">
                {selectedCauHinh.tenNoiThat}
                {selectedCauHinh.giaNoiThat && (
                  <Text type="secondary"> (+{formatPrice(selectedCauHinh.giaNoiThat)})</Text>
                )}
              </Descriptions.Item>
            )}
            
            {selectedCauHinh.tenBanhXe && (
              <Descriptions.Item label="Bánh xe">
                {selectedCauHinh.tenBanhXe}
                {selectedCauHinh.giaBanhXe && (
                  <Text type="secondary"> (+{formatPrice(selectedCauHinh.giaBanhXe)})</Text>
                )}
              </Descriptions.Item>
            )}
            
            {selectedCauHinh.danhSachTuyChon && selectedCauHinh.danhSachTuyChon.length > 0 && (
              <Descriptions.Item label="Tùy chọn" span={2}>
                <div>
                  {selectedCauHinh.danhSachTuyChon.map((tuyChon, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <Text strong>{tuyChon.ten}</Text>
                      <Text type="secondary"> - {tuyChon.danhMuc}</Text>
                      <Text type="secondary"> (+{formatPrice(tuyChon.gia)})</Text>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Tổng giá" span={2}>
              <Text strong style={{ fontSize: '18px', color: '#3b82f6' }}>
                {formatPrice(selectedCauHinh.tongGia)}
              </Text>
            </Descriptions.Item>
            
            {selectedCauHinh.ngayTao && (
              <Descriptions.Item label="Ngày tạo">
                {formatDate(selectedCauHinh.ngayTao)}
              </Descriptions.Item>
            )}
            
            {selectedCauHinh.ngayCapNhat && (
              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(selectedCauHinh.ngayCapNhat)}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyAudi;