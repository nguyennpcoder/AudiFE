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
  Avatar, 
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
  StarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ratingService, DanhGia } from '../../../services/ratingService';
import StarRating from '../../../components/common/StarRating';
import '../../../styles/RatingManagement.css';

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
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Fetch pending ratings
  const fetchRatings = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const data = await ratingService.getDanhGiaChoDuyet(page - 1, size);
      
      setRatings(data.danhGia || []);
      setTotalItems(data.totalItems || 0);
      
      // Calculate stats
      const allRatings = data.danhGia || [];
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

  useEffect(() => {
    fetchRatings(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle approve/reject rating
  const handleApproveRating = async (id: number, approve: boolean) => {
    try {
      await ratingService.duyetDanhGia(id, approve);
      message.success(approve ? 'Đánh giá đã được duyệt' : 'Đánh giá đã bị từ chối');
      setShowApproveModal(false);
      setSelectedRating(null);
      fetchRatings(currentPage, pageSize);
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
          fetchRatings(currentPage, pageSize);
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
        <div className="customer-info">
          <Avatar icon={<UserOutlined />} />
          <div className="customer-details">
            <Text strong>{text}</Text>
            <Text type="secondary" className="customer-id">
              ID: {record.idNguoiDung}
            </Text>
          </div>
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

  return (
    <div className="rating-management">
      <div className="page-header">
        <Title level={2}>
          <StarOutlined /> Quản lý đánh giá
        </Title>
        <Text type="secondary">
          Duyệt và quản lý đánh giá từ khách hàng
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-section">
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
      </Row>

      {/* Filters */}
      <Card className="filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên khách hàng hoặc mẫu xe"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => fetchRatings(currentPage, pageSize)}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="cho_duyet">Chờ duyệt</Option>
              <Option value="da_duyet">Đã duyệt</Option>
              <Option value="bi_tu_choi">Bị từ chối</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => fetchRatings(currentPage, pageSize)}
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Ratings Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={ratings}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đánh giá`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
        />
      </Card>

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
                <Avatar icon={<UserOutlined />} size={48} />
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
