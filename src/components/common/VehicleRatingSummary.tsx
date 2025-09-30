import React, { useState, useEffect } from 'react';
import { Rate, Tooltip } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../../services/ratingService';
import '../../styles/VehicleRatingSummary.css';

interface VehicleRatingSummaryProps {
  mauXeId: number;
  showCount?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

const VehicleRatingSummary: React.FC<VehicleRatingSummaryProps> = ({
  mauXeId,
  showCount = true,
  size = 'default',
  className = ''
}) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchRatingSummary = async () => {
      try {
        setLoading(true);
        
        // Fetch average rating
        const avgData = await ratingService.getTrungBinhSaoMauXe(mauXeId);
        let avgRating = avgData.trungBinhSao || 0;
        
        // Fetch rating count
        const ratingData = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 1);
        let count = ratingData.totalItems || 0;
        
        // If user is authenticated, check if they have a pending rating
        // and include it in the average calculation
        if (isAuthenticated && user) {
          const userRatings = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 100);
          const userRating = userRatings.danhGia?.find(
            rating => rating.idNguoiDung === user.userId
          );
          
          // If user has a rating that's not included in the public average
          // (e.g. pending approval), adjust the average
          if (userRating && userRatings.trungBinhSao !== undefined) {
            avgRating = userRatings.trungBinhSao;
            count = userRatings.danhGia.length;
          }
        }
        
        setAverageRating(avgRating);
        setRatingCount(count);
      } catch (error) {
        console.error('Error fetching rating summary:', error);
        // Set default values on error
        setAverageRating(0);
        setRatingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRatingSummary();
  }, [mauXeId, isAuthenticated, user]);

  if (loading) {
    return (
      <div className={`rating-summary loading ${size} ${className}`}>
        <Rate disabled value={0} className={`rating-stars ${size}`} />
        {showCount && <span className="rating-count">...</span>}
      </div>
    );
  }

  const ratingTooltip = ratingCount > 0 
    ? `${averageRating.toFixed(1)} sao từ ${ratingCount} đánh giá`
    : 'Chưa có đánh giá';

  return (
    <Tooltip title={ratingTooltip}>
      <div className={`rating-summary ${size} ${className}`}>
        <Rate 
          disabled 
          value={averageRating} 
          allowHalf
          className={`rating-stars ${size}`}
        />
        {showCount && ratingCount > 0 && (
          <span className="rating-count">
            ({ratingCount})
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default VehicleRatingSummary;