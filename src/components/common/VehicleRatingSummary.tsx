import React, { useState, useEffect } from 'react';
import { Rate, Tooltip } from 'antd';
import { ratingService } from '../../services/ratingService';
import '../../styles/VehicleRatingSummary.css';

interface VehicleRatingSummaryProps {
  mauXeId: number;
  showCount?: boolean;
  size?: 'small' | 'default';
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

  useEffect(() => {
    const fetchRatingSummary = async () => {
      try {
        setLoading(true);
        const data = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 1);
        setAverageRating(data.trungBinhSao || 0);
        setRatingCount(data.totalItems || 0);
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
  }, [mauXeId]);

  if (loading) {
    return (
      <div className={`rating-summary loading ${size} ${className}`}>
        <Rate disabled value={0} />
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
