import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Form, message, Modal, Avatar, Divider, Typography, Space, Tag, Rate } from 'antd';
import { StarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { ratingService, DanhGia, DanhGiaRequest } from '../../services/ratingService';
import '../../styles/VehicleRating.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// Thêm constant cho BACKEND_URL
const BACKEND_URL = 'http://localhost:8080';

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

  // Thêm hàm getUserAvatarUrl giống như trong BlogDetail
  const getUserAvatarUrl = (avatarPath?: string) => {
    console.log('getUserAvatarUrl called with:', avatarPath);
    
    if (!avatarPath || avatarPath === 'null' || avatarPath === 'undefined') {
      console.log('No avatar path, using default');
      return '/avatar-default.png';
    }
    
    // If it's already a full URL (from Google, Facebook, etc.), return as is
    if (avatarPath.startsWith('http')) {
      console.log('Full URL detected:', avatarPath);
      return avatarPath;
    }
    
    // If it starts with /, it's a relative path
    if (avatarPath.startsWith('/')) {
      const url = `${BACKEND_URL}${avatarPath}`;
      console.log('Relative path converted to:', url);
      return url;
    }
    
    // If it contains uploads/images/avatar_user, it's already a full path
    if (avatarPath.includes('uploads/images/avatar_user/')) {
      const url = `${BACKEND_URL}/${avatarPath}`;
      console.log('Full path with uploads converted to:', url);
      return url;
    }
    
    // Otherwise, assume it's a filename and build the full URL
    const url = `${BACKEND_URL}/uploads/images/avatar_user/${avatarPath}`;
    console.log('Filename converted to:', url);
    return url;
  };

  // Fetch ratings for this vehicle
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 10);
      
      setDanhGiaList(data.danhGia || []);
      setTrungBinhSao(data.trungBinhSao || 0);
      
      // Debug log để kiểm tra dữ liệu rating
      console.log('VehicleRating - Raw data from backend:', data);
      console.log('VehicleRating - Trung binh sao:', data.trungBinhSao, 'Type:', typeof data.trungBinhSao);
      if (data.danhGia && data.danhGia.length > 0) {
        data.danhGia.forEach((rating: DanhGia, index: number) => {
          console.log(`VehicleRating - Rating ${index + 1}:`, {
            id: rating.id,
            soSao: rating.soSao,
            type: typeof rating.soSao,
            tenNguoiDung: rating.tenNguoiDung,
            trangThai: rating.trangThai
          });
        });
      }
      
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
      
      // Ensure rating value is a number (support half stars like 2.5, 3.5)
      const soSaoValue = typeof values.soSao === 'number' ? values.soSao : parseFloat(values.soSao);
      
      // Debug log để kiểm tra giá trị rating từ form
      console.log('VehicleRating - Form values:', values);
      console.log('VehicleRating - Rating value from form:', soSaoValue, 'Type:', typeof soSaoValue);
      
      // Validate rating is between 0.5 and 5.0
      if (isNaN(soSaoValue) || soSaoValue < 0.5 || soSaoValue > 5) {
        message.error('Số sao không hợp lệ. Vui lòng chọn từ 0.5 đến 5 sao.');
        setSubmitting(false);
        return;
      }
      
      const ratingData: DanhGiaRequest = {
        idNguoiDung: user?.userId || 0,
        idMauXe: mauXeId,
        soSao: soSaoValue, // Use validated number value
        tieuDe: values.tieuDe,
        noiDung: values.noiDung,
        daMua: values.daMua || false
      };
      
      console.log('VehicleRating - Rating data to send:', ratingData);

      const newRating = await ratingService.themDanhGia(ratingData);
      
      // Debug log để kiểm tra response từ backend
      console.log('VehicleRating - Response from backend:', newRating);
      console.log('VehicleRating - Rating value from backend:', newRating?.soSao, 'Type:', typeof newRating?.soSao);
      
      message.success('Đánh giá của bạn đã được gửi và đang chờ duyệt');
      form.resetFields();
      setShowRatingForm(false);
      
      // Thêm đánh giá mới vào danh sách để hiển thị ngay lập tức
      if (newRating) {
        setDanhGiaList(prev => [newRating, ...prev]);
        setUserHasRated(true);
        setUserRating(newRating);
        
        // Cập nhật lại trung bình sao
        const updatedData = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 10);
        setTrungBinhSao(updatedData.trungBinhSao || 0);
      }
      
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
                rating={typeof trungBinhSao === 'string' ? parseFloat(trungBinhSao) : trungBinhSao} 
                size="large" 
                readonly 
                showValue
                allowHalf
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
                    rating={typeof userRating?.soSao === 'string' ? parseFloat(userRating.soSao) : (userRating?.soSao || 0)} 
                    size="small" 
                    readonly 
                    allowHalf
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
                  <Avatar 
  src={getUserAvatarUrl(danhGia.avatarNguoiDung)}
  icon={<UserOutlined />}
  onError={() => {
    console.log('Avatar failed to load, using default icon');
    return true;
  }}
/>
                    <div className="reviewer-details">
                      <Text strong>{danhGia.tenNguoiDung}</Text>
                      <div className="review-meta">
                        <StarRating 
                          rating={typeof danhGia.soSao === 'string' ? parseFloat(danhGia.soSao) : danhGia.soSao} 
                          size="small" 
                          readonly 
                          allowHalf
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
