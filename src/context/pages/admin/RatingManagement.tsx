import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  message, 
  Typography, 
  Rate,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Progress,
  Divider
} from 'antd';
import type { Dayjs } from 'dayjs';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  StarOutlined
} from '@ant-design/icons';
import { ratingService, DanhGia } from '../../../services/ratingService';
import StarRating from '../../../components/common/StarRating';
import '../../../styles/RatingManagement.css';
import '../../../styles/Admin.css';
import AdminHeader from './AdminHeader';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface RatingStats {
  totalRatings: number;
  approvedRatings: number;
  pendingRatings: number;
  rejectedRatings: number;
  averageRating: number;
}

const RatingManagement: React.FC = () => {
  const [ratings, setRatings] = useState<DanhGia[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<DanhGia[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RatingStats>({
    totalRatings: 0,
    approvedRatings: 0,
    pendingRatings: 0,
    rejectedRatings: 0,
    averageRating: 0
  });
  const [selectedRating, setSelectedRating] = useState<DanhGia | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Fetch ratings (all for admin by default)
  const fetchRatings = async () => {
    try {
      setLoading(true);
      // Fetch all ratings for admin
      const data = await ratingService.getAllDanhGia(0, 1000); // Get a large number to handle client-side pagination
      
      const allRatings = data.danhGia || [];
      setRatings(allRatings);
      
      // Calculate stats based on all ratings
      const stats: RatingStats = {
        totalRatings: allRatings.length,
        approvedRatings: allRatings.filter(r => r.trangThai === 'da_duyet').length,
        pendingRatings: allRatings.filter(r => r.trangThai === 'cho_duyet').length,
        rejectedRatings: allRatings.filter(r => r.trangThai === 'bi_tu_choi').length,
        averageRating: allRatings.reduce((sum, r) => sum + r.soSao, 0) / allRatings.length || 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // Filter ratings based on search, status, and date range
  const filterRatings = () => {
    let filtered = ratings;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.trangThai === statusFilter);
    }
    
    // Filter by search text
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(r => 
        (r.tenNguoiDung || '').toLowerCase().includes(q) || 
        (r.tenMauXe || '').toLowerCase().includes(q)
      );
    }
    
    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const [from, to] = dateRange;
      const fromTs = from!.startOf('day').toDate().getTime();
      const toTs = to!.endOf('day').toDate().getTime();
      filtered = filtered.filter(r => {
        const t = new Date(r.ngayTao).getTime();
        return t >= fromTs && t <= toTs;
      });
    }
    
    setFilteredRatings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  useEffect(() => {
    filterRatings();
  }, [ratings, statusFilter, searchText, dateRange]);

  // Handle approve/reject rating
  const handleApproveRating = async (id: number, approve: boolean) => {
    try {
      await ratingService.duyetDanhGia(id, approve);
      message.success(approve ? 'Đánh giá đã được duyệt' : 'Đánh giá đã bị từ chối');
      setShowApproveModal(false);
      setSelectedRating(null);
      fetchRatings();
    } catch (error: any) {
      console.error('Error approving rating:', error);
      message.error(error.message || 'Có lỗi xảy ra khi duyệt đánh giá');
    }
  };

  // Handle delete rating
  const handleDeleteRating = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ratingService.xoaDanhGia(id);
          message.success('Đánh giá đã được xóa');
          fetchRatings();
        } catch (error: any) {
          console.error('Error deleting rating:', error);
          message.error(error.message || 'Có lỗi xảy ra khi xóa đánh giá');
        }
      }
    });
  };

  // Get status tag
  const getStatusTag = (trangThai: string) => {
    switch (trangThai) {
      case 'da_duyet':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
      case 'cho_duyet':
        return <Tag color="orange">Chờ duyệt</Tag>;
      case 'bi_tu_choi':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Bị từ chối</Tag>;
      default:
        return <Tag>{trangThai}</Tag>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'tenNguoiDung',
      key: 'tenNguoiDung',
      render: (text: string, record: DanhGia) => (
        <div className="customer-details">
          <Text strong style={{ display: 'block' }}>{text}</Text>
          <Text type="secondary" className="customer-id">ID: {record.idNguoiDung}</Text>
        </div>
      ),
    },
    {
      title: 'Mẫu xe',
      dataIndex: 'tenMauXe',
      key: 'tenMauXe',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'soSao',
      key: 'soSao',
      render: (rating: number) => (
        <StarRating rating={rating} size="small" readonly />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'tieuDe',
      key: 'tieuDe',
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (trangThai: string) => getStatusTag(trangThai),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: DanhGia) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRating(record);
              setShowDetailModal(true);
            }}
          >
            Xem
          </Button>
          {record.trangThai === 'cho_duyet' && (
            <>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedRating(record);
                  setShowApproveModal(true);
                }}
                style={{ color: '#52c41a' }}
              >
                Duyệt
              </Button>
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={() => handleApproveRating(record.id, false)}
                style={{ color: '#ff4d4f' }}
              >
                Từ chối
              </Button>
            </>
          )}
          <Button
            type="text"
            danger
            onClick={() => handleDeleteRating(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Tổng số trang
  const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);
  
  // Lấy danh sách đánh giá của trang hiện tại
  const currentRatings = filteredRatings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <AdminHeader pageTitle="Quản lý đánh giá" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0 0 0', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
        <div className="admin-section" style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', padding: '24px 24px 12px', height: 'calc(100vh - 120px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <Search
                placeholder="Tìm kiếm theo tên khách hàng hoặc mẫu xe"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                enterButton={<SearchOutlined />}
                allowClear
              />
            </div>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}>
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="cho_duyet">Chờ duyệt</Option>
              <Option value="da_duyet">Đã duyệt</Option>
              <Option value="bi_tu_choi">Bị từ chối</Option>
            </Select>
            <RangePicker value={dateRange} onChange={setDateRange} />
          </div>

      {/* Statistics Cards */}
      {/* <Row gutter={[16, 16]} className="stats-section">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng đánh giá"
              value={stats.totalRatings}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã duyệt"
              value={stats.approvedRatings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Chờ duyệt"
              value={stats.pendingRatings}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Điểm TB"
              value={stats.averageRating}
              precision={1}
              suffix="/ 5"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row> */}
          {/* Ratings Table */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              overflowX: 'auto', 
              borderRadius: 12, 
              background: '#fafbfc',
              flex: 1,
              minHeight: 0
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate', 
                borderSpacing: 0,
                height: '100%'
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 8px', textAlign: 'left', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Khách hàng</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Mẫu xe</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Đánh giá</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Tiêu đề</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Ngày tạo</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                          <div className="loading-spinner" style={{ marginBottom: 16 }}></div>
                          <Text type="secondary">Đang tải dữ liệu...</Text>
                        </div>
                      </td>
                    </tr>
                  ) : currentRatings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '100px 24px', color: '#888', height: '300px' }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    currentRatings.map((rating, idx) => (
                      <tr
                        key={rating.id}
                        className="table-row-fadein"
                        style={{
                          animationDelay: `${idx * 120}ms`,
                          background: '#fff',
                          borderBottom: '1px solid #f0f0f0',
                          height: '50px',
                          transition: 'background 0.3s cubic-bezier(0.4,0,0.2,1), color 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-radius 0.3s cubic-bezier(0.4,0,0.2,1)',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          zIndex: 1,
                          position: 'relative'
                        }}
                      >
                        <td style={{ padding: '10px 8px' }}>
                          <div className="customer-details">
                            <Text strong style={{ display: 'block' }}>{rating.tenNguoiDung}</Text>
                            <Text type="secondary" className="customer-id">ID: {rating.idNguoiDung}</Text>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}><Text strong>{rating.tenMauXe}</Text></td>
                        <td style={{ padding: '10px 8px' }}>
                          <StarRating rating={rating.soSao} size="small" readonly />
                        </td>
                        <td style={{ padding: '10px 8px', maxWidth: 200 }}>
                          <Text ellipsis={{ tooltip: rating.tieuDe }} style={{ maxWidth: 200 }}>
                            {rating.tieuDe}
                          </Text>
                        </td>
                        <td style={{ padding: '10px 8px' }}>{getStatusTag(rating.trangThai)}</td>
                        <td style={{ padding: '10px 8px' }}><Text type="secondary">{formatDate(rating.ngayTao)}</Text></td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 160 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setSelectedRating(rating);
                                setShowDetailModal(true);
                              }}
                            >
                              Xem
                            </Button>
                            {rating.trangThai === 'cho_duyet' && (
                              <>
                                <Button
                                  type="text"
                                  icon={<CheckCircleOutlined />}
                                  onClick={() => {
                                    setSelectedRating(rating);
                                    setShowApproveModal(true);
                                  }}
                                  style={{ color: '#52c41a' }}
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  type="text"
                                  icon={<CloseCircleOutlined />}
                                  onClick={() => handleApproveRating(rating.id, false)}
                                  style={{ color: '#ff4d4f' }}
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                            <Button
                              type="text"
                              danger
                              onClick={() => handleDeleteRating(rating.id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Thêm các row trống để cố định chiều cao khi data ít */}
                  {currentRatings.length > 0 && currentRatings.length < 10 && 
                    Array.from({ length: 10 - currentRatings.length }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '50px', background: '#fff' }}>
                        <td colSpan={7} style={{ padding: '10px 8px' }}></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            
            {/* Pagination - Cố định ở dưới */}
            {totalPages > 1 && (
              <div className="admin-pagination" style={{ 
                marginTop: 16, 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 8,
                flexShrink: 0 // Không co lại
              }}>
                <button 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.6 : 1,
                  }}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.6 : 1,
                  }}
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                
                <span style={{ fontSize: 14, color: '#555' }}>
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.6 : 1,
                  }}
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.6 : 1,
                  }}
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
     
      {/* Rating Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={600}
      >
        {selectedRating && (
          <div className="rating-detail">
            <div className="rating-header">
              <div className="customer-info">
                {/* <Avatar icon={<UserOutlined />} size={48} /> */}
                <div className="customer-details">
                  <Title level={4}>{selectedRating.tenNguoiDung}</Title>
                  <Text type="secondary">ID: {selectedRating.idNguoiDung}</Text>
                </div>
              </div>
              <div className="rating-meta">
                <StarRating rating={selectedRating.soSao} size="large" readonly />
                <Text type="secondary">{formatDate(selectedRating.ngayTao)}</Text>
                {getStatusTag(selectedRating.trangThai)}
              </div>
            </div>
            
            <Divider />
            
            <div className="rating-content">
              <Title level={5}>Mẫu xe: {selectedRating.tenMauXe}</Title>
              {selectedRating.tieuDe && (
                <Title level={5}>Tiêu đề: {selectedRating.tieuDe}</Title>
              )}
              <Paragraph>{selectedRating.noiDung}</Paragraph>
              {selectedRating.daMua && (
                <Tag color="blue">Khách hàng đã mua xe này</Tag>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Duyệt đánh giá"
        open={showApproveModal}
        onCancel={() => setShowApproveModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowApproveModal(false)}>
            Hủy
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => handleApproveRating(selectedRating?.id || 0, false)}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleApproveRating(selectedRating?.id || 0, true)}
          >
            Duyệt
          </Button>,
        ]}
      >
        {selectedRating && (
          <div>
            <p>Bạn có chắc chắn muốn duyệt đánh giá này?</p>
            <div className="rating-preview">
              <Text strong>{selectedRating.tenNguoiDung}</Text>
              <StarRating rating={selectedRating.soSao} size="small" readonly />
              <Text>{selectedRating.tieuDe}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RatingManagement;
