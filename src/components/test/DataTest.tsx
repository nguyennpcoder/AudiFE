import React, { useState, useEffect } from 'react';
import { ratingService } from '../../services/ratingService';
import StarRating from '../common/StarRating';

const DataTest: React.FC = () => {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getAllDanhGia(0, 10);
      console.log('Fetched ratings data:', data);
      setRatings(data.danhGia || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Data Test - Kiểm tra dữ liệu rating từ backend</h2>
      
      <button onClick={fetchRatings} disabled={loading} style={{ marginBottom: '20px' }}>
        {loading ? 'Loading...' : 'Refresh Data'}
      </button>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Raw Data:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(ratings, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3>Rating Display Test:</h3>
        {ratings.map((rating, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            padding: '10px',
            border: '1px solid #ddd',
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            <div style={{ minWidth: '200px' }}>
              <strong>{rating.tenNguoiDung}</strong> - {rating.tenMauXe}
            </div>
            <div style={{ minWidth: '100px' }}>
              Rating: <strong>{rating.soSao}</strong> (Type: {typeof rating.soSao})
            </div>
            <StarRating rating={rating.soSao} size="small" readonly allowHalf />
            <div style={{ fontSize: '12px', color: '#666' }}>
              Floor: {Math.floor(rating.soSao)}, Ceil: {Math.ceil(rating.soSao)}, Decimal: {(rating.soSao % 1).toFixed(1)}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px' }}>
        <h4>Debug Info:</h4>
        <p>1. Kiểm tra Console để thấy raw data</p>
        <p>2. Xem các giá trị rating có phải là số thập phân không</p>
        <p>3. Kiểm tra xem StarRating có hiển thị nửa sao không</p>
        <p>4. Nếu rating là số nguyên (4, 3, 2, 1) thì sẽ không có nửa sao</p>
        <p>5. Nếu rating là số thập phân (4.5, 3.5, 2.5, 1.5) thì sẽ có nửa sao</p>
      </div>
    </div>
  );
};

export default DataTest;
