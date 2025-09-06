import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Form, message, Modal, Avatar, Divider, Typography, Space, Tag, Rate } from 'antd';
import { StarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { ratingService, DanhGia, DanhGiaRequest } from '../../services/ratingService';
import '../../styles/VehicleRating.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;


interface VehicleRatingProps {
  mauXeId: number;
  tenMauXe: string;
  onRatingSubmit?: () => void;
}

const VehicleRating: React.FC<VehicleRatingProps> = ({ 
  mauXeId, 
  tenMauXe, 
  onRatingSubmit 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  
  const [danhGiaList, setDanhGiaList] = useState<DanhGia[]>([]);
  const [trungBinhSao, setTrungBinhSao] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [userRating, setUserRating] = useState<DanhGia | null>(null);

  // Fetch ratings for this vehicle
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 10);
      
      setDanhGiaList(data.danhGia || []);
      setTrungBinhSao(data.trungBinhSao || 0);
      
      // Check if current user has already rated
      if (isAuthenticated && user) {
        const userRating = data.danhGia?.find((rating: DanhGia) => 
          rating.idNguoiDung === user.userId
        );
        setUserHasRated(!!userRating);
        setUserRating(userRating || null);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      message.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [mauXeId, isAuthenticated, user]);

  // Submit new rating
  const handleSubmitRating = async (values: any) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      const ratingData: DanhGiaRequest = {
        idNguoiDung: user?.userId || 0,
        idMauXe: mauXeId,
        soSao: values.soSao,
        tieuDe: values.tieuDe,
        noiDung: values.noiDung,
        daMua: values.daMua || false
      };

      await ratingService.themDanhGia(ratingData);
      
      message.success('Đánh giá của bạn đã được gửi và đang chờ duyệt');
      form.resetFields();
      setShowRatingForm(false);
      fetchRatings(); // Refresh ratings
      onRatingSubmit?.();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      message.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (trangThai: string) => {
    switch (trangThai) {
      case 'da_duyet':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
      case 'cho_duyet':
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
      case 'bi_tu_choi':
        return <Tag color="red">Bị từ chối</Tag>;
      default:
        return <Tag>{trangThai}</Tag>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="vehicle-rating-container">
      {/* Rating Summary */}
      <Card className="rating-summary-card">
        <div className="rating-summary">
          <div className="rating-overview">
            <div className="average-rating">
              <StarRating 
                rating={trungBinhSao} 
                size="large" 
                readonly 
                showValue 
              />
              <Text className="rating-text">
                {trungBinhSao.toFixed(1)} trên 5 sao
              </Text>
            </div>
            <div className="rating-stats">
              <Text type="secondary">
                Dựa trên {danhGiaList.length} đánh giá
              </Text>
            </div>
          </div>
          
          <div className="rating-actions">
            {isAuthenticated ? (
              userHasRated ? (
                <div className="user-rating-info">
                  <Text>Bạn đã đánh giá: </Text>
                  <StarRating 
                    rating={userRating?.soSao || 0} 
                    size="small" 
                    readonly 
                  />
                  <Text type="secondary">
                    ({getStatusTag(userRating?.trangThai || 'cho_duyet')})
                  </Text>
                </div>
              ) : (
                <Button 
                  type="primary" 
                  icon={<StarOutlined />}
                  onClick={() => setShowRatingForm(true)}
                >
                  Đánh giá xe
                </Button>
              )
            ) : (
              <Button 
                type="primary" 
                icon={<StarOutlined />}
                onClick={() => message.warning('Vui lòng đăng nhập để đánh giá')}
              >
                Đánh giá xe
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Rating Form Modal */}
      <Modal
        title={`Đánh giá ${tenMauXe}`}
        open={showRatingForm}
        onCancel={() => setShowRatingForm(false)}
        footer={null}
        width={600}
        className="rating-form-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRating}
          className="rating-form"
        >
          <Form.Item
            name="soSao"
            label="Đánh giá sao"
            rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item
            name="tieuDe"
            label="Tiêu đề đánh giá"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 100, message: 'Tiêu đề không được quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tiêu đề đánh giá..." />
          </Form.Item>

          <Form.Item
            name="noiDung"
            label="Nội dung đánh giá"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung đánh giá' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Chia sẻ trải nghiệm của bạn về chiếc xe này..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="daMua"
            valuePropName="checked"
          >
            <label>
              <input type="checkbox" /> Tôi đã mua chiếc xe này
            </label>
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => setShowRatingForm(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                Gửi đánh giá
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reviews List */}
      <Card 
        title={`Đánh giá từ khách hàng (${danhGiaList.length})`}
        className="reviews-card"
        loading={loading}
      >
        {danhGiaList.length === 0 ? (
          <div className="no-reviews">
            <Text type="secondary">Chưa có đánh giá nào cho mẫu xe này</Text>
          </div>
        ) : (
          <div className="reviews-list">
            {danhGiaList.map((danhGia) => (
              <div key={danhGia.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <Avatar icon={<UserOutlined />} />
                    <div className="reviewer-details">
                      <Text strong>{danhGia.tenNguoiDung}</Text>
                      <div className="review-meta">
                        <StarRating 
                          rating={danhGia.soSao} 
                          size="small" 
                          readonly 
                        />
                        <Text type="secondary">
                          {formatDate(danhGia.ngayTao)}
                        </Text>
                        {danhGia.daMua && (
                          <Tag color="blue">Đã mua</Tag>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusTag(danhGia.trangThai)}
                </div>
                
                <div className="review-content">
                  {danhGia.tieuDe && (
                    <Title level={5} className="review-title">
                      {danhGia.tieuDe}
                    </Title>
                  )}
                  <Paragraph className="review-text">
                    {danhGia.noiDung}
                  </Paragraph>
                </div>
                
                <Divider />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default VehicleRating;
