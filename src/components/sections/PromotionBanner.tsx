import React, { useState, useEffect } from 'react';
import { marketingService, KhuyenMai } from '../../services/marketingService';
import { useNotification } from '../../context/NotificationContext';
import { GiftOutlined, PercentageOutlined, DollarOutlined } from '@ant-design/icons';

interface PromotionBannerProps {
  mauXeId?: number;
  tongGiaTri?: number;
  onSelectPromotion?: (promotion: KhuyenMai) => void;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ 
  mauXeId, 
  tongGiaTri = 0, 
  onSelectPromotion 
}) => {
  const [promotions, setPromotions] = useState<KhuyenMai[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<KhuyenMai | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPromotions();
  }, [mauXeId]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      let response;
      
      if (mauXeId) {
        // Lấy khuyến mãi cho mẫu xe cụ thể
        response = await marketingService.timKhuyenMaiChoMauXe(mauXeId);
        setPromotions(response);
      } else {
        // Lấy tất cả khuyến mãi còn hiệu lực
        const data = await marketingService.getKhuyenMaiConHieuLuc(0, 10);
        setPromotions(data.khuyenMai);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      showNotification('error', 'Không thể tải thông tin khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPromotion = async (promotion: KhuyenMai) => {
    try {
      if (mauXeId && tongGiaTri > 0) {
        // Kiểm tra xem khuyến mãi có áp dụng được không
        const isValid = await marketingService.kiemTraApDungKhuyenMai(
          promotion.id, 
          [mauXeId], 
          tongGiaTri
        );
        
        if (!isValid.hopLe) {
          showNotification('warning', 'Khuyến mãi này không áp dụng cho sản phẩm này');
          return;
        }
      }
      
      setSelectedPromotion(promotion);
      onSelectPromotion?.(promotion);
      showNotification('success', `Đã áp dụng khuyến mãi: ${promotion.ten}`);
    } catch (error) {
      console.error('Error applying promotion:', error);
      showNotification('error', 'Không thể áp dụng khuyến mãi');
    }
  };

  const getPromotionIcon = (loaiGiamGia: string) => {
    switch (loaiGiamGia) {
      case 'phan_tram':
        return <PercentageOutlined style={{ color: '#1890ff' }} />;
      case 'so_tien_co_dinh':
        return <DollarOutlined style={{ color: '#52c41a' }} />;
      case 'tuy_chon_mien_phi':
        return <GiftOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <GiftOutlined />;
    }
  };

  const formatPromotionValue = (promotion: KhuyenMai) => {
    switch (promotion.loaiGiamGia) {
      case 'phan_tram':
        return `Giảm ${promotion.giaTriGiam}%`;
      case 'so_tien_co_dinh':
        return `Giảm ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(promotion.giaTriGiam)}`;
      case 'tuy_chon_mien_phi':
        return 'Tùy chọn miễn phí';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div style={{ 
        background: '#f5f5f5', 
        padding: '16px', 
        borderRadius: '8px', 
        textAlign: 'center' 
      }}>
        Đang tải khuyến mãi...
      </div>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px', color: '#222' }}>
        <GiftOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
        Khuyến mãi hiện tại
      </h3>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            style={{
              background: selectedPromotion?.id === promotion.id ? '#e6f7ff' : '#fff',
              border: `2px solid ${selectedPromotion?.id === promotion.id ? '#1890ff' : '#f0f0f0'}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '200px',
              flex: '1'
            }}
            onClick={() => handleSelectPromotion(promotion)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              {getPromotionIcon(promotion.loaiGiamGia)}
              <span style={{ 
                fontWeight: 600, 
                marginLeft: '8px',
                color: selectedPromotion?.id === promotion.id ? '#1890ff' : '#222'
              }}>
                {promotion.ten}
              </span>
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '8px' 
            }}>
              {promotion.moTa}
            </div>
            
            <div style={{ 
              fontWeight: 600, 
              color: '#52c41a',
              marginBottom: '8px' 
            }}>
              {formatPromotionValue(promotion)}
            </div>
            
            {promotion.giaTriToiThieu && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '8px' 
              }}>
                Áp dụng cho đơn hàng từ {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(promotion.giaTriToiThieu)}
              </div>
            )}
            
            <div style={{ 
              fontSize: '12px', 
              color: '#999' 
            }}>
              Hết hạn: {formatDate(promotion.ngayKetThuc)}
            </div>
            
            {promotion.gioiHanSuDung && (
              <div style={{ 
                fontSize: '12px', 
                color: '#999',
                marginTop: '4px' 
              }}>
                Đã sử dụng: {promotion.soLanDaDung}/{promotion.gioiHanSuDung}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionBanner;