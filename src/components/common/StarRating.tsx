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
  allowHalf?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  readonly = false,
  showValue = false,
  onChange,
  className = '',
  allowHalf = false
}) => {
  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      onChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    // Debug log to check rating value
    if (allowHalf && rating % 1 !== 0) {
      console.log('StarRating Debug:', {
        rating,
        floor: Math.floor(rating),
        ceil: Math.ceil(rating),
        decimal: rating % 1,
        allowHalf
      });
    }
    
    for (let i = 1; i <= maxRating; i++) {
      let isFilled, isHalfFilled;
      
      if (allowHalf) {
        // For 4.5: stars 1,2,3,4 are filled, star 5 is half-filled
        const decimalPart = rating % 1;
        const floorRating = Math.floor(rating);
        const ceilRating = Math.ceil(rating);
        
        isFilled = i <= floorRating;
        // Show half star if current star index equals ceiling of rating and there's a decimal part > 0
        isHalfFilled = i === ceilRating && decimalPart > 0;
        
        // Debug: Log when we should show half star
        if (i === ceilRating && decimalPart > 0) {
          console.log(`Should show half star for rating ${rating}:`, {
            i,
            ceilRating,
            decimalPart,
            isHalfFilled
          });
        }
        
        // Debug log for each star
        if (rating % 1 !== 0) {
          console.log(`Star ${i}:`, {
            isFilled,
            isHalfFilled,
            decimalPart,
            floorRating,
            ceilRating,
            rating
          });
        }
      } else {
        isFilled = i <= Math.round(rating);
        isHalfFilled = false;
      }
      
      stars.push(
        <span
          key={i}
          className={`star ${size} ${!readonly ? 'clickable' : ''}`}
          onClick={() => handleStarClick(i)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          {isFilled ? (
            <StarFilled className="star-filled" />
          ) : isHalfFilled ? (
            <div className="star-half">
              <StarOutlined className="star-outline" />
              <div className="star-half-fill">
                <StarFilled className="star-filled" />
              </div>
            </div>
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