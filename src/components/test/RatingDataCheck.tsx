import React, { useState, useEffect } from 'react';
import { ratingService } from '../../services/ratingService';
import StarRating from '../common/StarRating';

const RatingDataCheck: React.FC = () => {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasHalfRatings, setHasHalfRatings] = useState(false);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getAllDanhGia(0, 100); // Lấy nhiều hơn để kiểm tra
      console.log('=== RATING DATA CHECK ===');
      console.log('Raw data from backend:', data);
      
      const allRatings = data.danhGia || [];
      setRatings(allRatings);
      
      // Kiểm tra xem có rating nào có phần thập phân không
      const halfRatings = allRatings.filter(rating => {
        const decimalPart = rating.soSao % 1;
        return decimalPart > 0;
      });
      
      console.log('Total ratings:', allRatings.length);
      console.log('Ratings with decimal parts:', halfRatings.length);
      console.log('Half ratings:', halfRatings);
      
      setHasHalfRatings(halfRatings.length > 0);
      
      // Log từng rating để debug
      allRatings.forEach((rating, index) => {
        console.log(`Rating ${index + 1}:`, {
          id: rating.id,
          soSao: rating.soSao,
          type: typeof rating.soSao,
          decimalPart: rating.soSao % 1,
          tenNguoiDung: rating.tenNguoiDung,
          tenMauXe: rating.tenMauXe
        });
      });
      
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
      <h2>Rating Data Check - Kiểm tra dữ liệu rating từ backend</h2>
      
      <button onClick={fetchRatings} disabled={loading} style={{ marginBottom: '20px' }}>
        {loading ? 'Loading...' : 'Refresh Data'}
      </button>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: hasHalfRatings ? '#d4edda' : '#f8d7da', borderRadius: '8px' }}>
        <h3>Kết quả kiểm tra:</h3>
        <p><strong>Tổng số rating:</strong> {ratings.length}</p>
        <p><strong>Có rating với phần thập phân:</strong> {hasHalfRatings ? 'CÓ' : 'KHÔNG'}</p>
        {!hasHalfRatings && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            ⚠️ KHÔNG có rating nào có phần thập phân! Đây có thể là nguyên nhân không hiển thị nửa sao.
          </p>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Danh sách tất cả ratings:</h3>
        {ratings.map((rating, index) => {
          const decimalPart = rating.soSao % 1;
          const isHalfRating = decimalPart > 0;
          
          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              padding: '10px',
              border: isHalfRating ? '2px solid #28a745' : '1px solid #ddd',
              marginBottom: '10px',
              borderRadius: '4px',
              background: isHalfRating ? '#f8fff9' : 'white'
            }}>
              <div style={{ minWidth: '200px' }}>
                <strong>{rating.tenNguoiDung}</strong> - {rating.tenMauXe}
              </div>
              <div style={{ minWidth: '150px' }}>
                Rating: <strong>{rating.soSao}</strong> (Type: {typeof rating.soSao})
                {isHalfRating && <span style={{ color: 'green', fontWeight: 'bold' }}> ⭐ HALF RATING</span>}
              </div>
              <StarRating rating={rating.soSao} size="small" readonly allowHalf />
              <div style={{ fontSize: '12px', color: '#666' }}>
                Floor: {Math.floor(rating.soSao)}, Ceil: {Math.ceil(rating.soSao)}, Decimal: {decimalPart.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px' }}>
        <h4>Debug Info:</h4>
        <p>1. Mở Developer Tools (F12) và xem Console</p>
        <p>2. Kiểm tra "RATING DATA CHECK" section</p>
        <p>3. Nếu không có rating nào có phần thập phân, thì backend đang trả về số nguyên</p>
        <p>4. Nếu có rating với phần thập phân nhưng không hiển thị nửa sao, thì có vấn đề với CSS/logic</p>
        <p>5. Rating màu xanh lá là rating có phần thập phân</p>
      </div>
    </div>
  );
};

export default RatingDataCheck;
