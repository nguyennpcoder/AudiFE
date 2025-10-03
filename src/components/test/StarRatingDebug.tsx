import React from 'react';
import StarRating from '../common/StarRating';

const StarRatingDebug: React.FC = () => {
  const testRatings = [4.5, 3.5, 2.5, 1.5, 0.5, 4.0, 3.0, 2.0, 1.0, 0.0];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h2>Star Rating Debug Test</h2>
      <p>Kiểm tra hiển thị nửa sao với các giá trị khác nhau:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {testRatings.map((rating, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            padding: '15px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ minWidth: '80px', fontWeight: 'bold' }}>
              {rating} sao:
            </div>
            <StarRating 
              rating={rating} 
              size="large" 
              readonly 
              allowHalf 
              showValue
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              Floor: {Math.floor(rating)}, Ceil: {Math.ceil(rating)}, Decimal: {(rating % 1).toFixed(1)}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h3>Test với dữ liệu thực tế từ RatingManagement:</h3>
        <p>Nếu bạn có dữ liệu rating thực tế với giá trị .5, hãy thêm vào đây để test:</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
          <span>4.5 sao:</span>
          <StarRating rating={4.5} size="large" readonly allowHalf showValue />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
          <span>3.5 sao:</span>
          <StarRating rating={3.5} size="large" readonly allowHalf showValue />
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px' }}>
          <h4>Debug Info:</h4>
          <p>Mở Developer Tools (F12) và xem Console để thấy debug logs</p>
          <p>Kiểm tra xem có thấy nửa sao không. Nếu không thấy, có thể có vấn đề với CSS hoặc logic.</p>
        </div>
      </div>
    </div>
  );
};

export default StarRatingDebug;
