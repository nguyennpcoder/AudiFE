import React from 'react';
import StarRating from '../common/StarRating';

const SimpleRatingTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Simple Rating Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test 4.5 stars:</h3>
        <StarRating rating={4.5} size="large" readonly allowHalf showValue />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Expected: 4 full stars + 1 half star
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test 3.5 stars:</h3>
        <StarRating rating={3.5} size="large" readonly allowHalf showValue />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Expected: 3 full stars + 1 half star
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test 2.5 stars:</h3>
        <StarRating rating={2.5} size="large" readonly allowHalf showValue />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Expected: 2 full stars + 1 half star
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test 1.5 stars:</h3>
        <StarRating rating={1.5} size="large" readonly allowHalf showValue />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Expected: 1 full star + 1 half star
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test 0.5 stars:</h3>
        <StarRating rating={0.5} size="large" readonly allowHalf showValue />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Expected: 0 full stars + 1 half star
        </div>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h4>Debug Info:</h4>
        <p>1. Mở Developer Tools (F12)</p>
        <p>2. Xem Console để thấy debug logs</p>
        <p>3. Kiểm tra xem có thấy nửa sao không</p>
        <p>4. Nếu không thấy nửa sao, kiểm tra CSS trong Elements tab</p>
      </div>
    </div>
  );
};

export default SimpleRatingTest;
