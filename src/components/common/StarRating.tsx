import React from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import '../../styles/StarRating.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  showValue?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  readonly = false,
  showValue = false,
  onChange,
  className = ''
}) => {
  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      onChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      stars.push(
        <span
          key={i}
          className={`star ${size} ${!readonly ? 'clickable' : ''}`}
          onClick={() => handleStarClick(i)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          {isFilled ? (
            <StarFilled className="star-filled" />
          ) : (
            <StarOutlined className="star-outline" />
          )}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`star-rating ${className}`}>
      <div className="stars-container">
        {renderStars()}
      </div>
      {showValue && (
        <span className="rating-value">
          {rating.toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  );
};

export default StarRating;
