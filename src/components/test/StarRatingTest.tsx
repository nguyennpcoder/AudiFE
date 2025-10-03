import React from 'react';
import StarRating from '../common/StarRating';

const StarRatingTest: React.FC = () => {
  const testRatings = [4.5, 4.0, 3.7, 2.3, 1.8, 0.5];

  return (
    <div style={{ padding: '20px' }}>
      <h2>StarRating Test - Half Star Display</h2>
      {testRatings.map((rating) => (
        <div key={rating} style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ width: '60px', fontWeight: 'bold' }}>{rating} stars:</span>
          <StarRating rating={rating} allowHalf readonly />
          <span style={{ color: '#666' }}>
            (Expected: {Math.floor(rating)} full + {(rating % 1) >= 0.5 ? '1 half' : '0 half'})
          </span>
        </div>
      ))}
      
      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Expected Results:</h3>
        <ul>
          <li><strong>4.5:</strong> ⭐⭐⭐⭐⭐ (4 full + 1 half)</li>
          <li><strong>4.0:</strong> ⭐⭐⭐⭐☆ (4 full + 0 half)</li>
          <li><strong>3.7:</strong> ⭐⭐⭐⭐☆ (3 full + 1 half)</li>
          <li><strong>2.3:</strong> ⭐⭐☆☆☆ (2 full + 0 half)</li>
          <li><strong>1.8:</strong> ⭐⭐☆☆☆ (1 full + 1 half)</li>
          <li><strong>0.5:</strong> ⭐☆☆☆☆ (0 full + 1 half)</li>
        </ul>
      </div>
    </div>
  );
};

export default StarRatingTest;