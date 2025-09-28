import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface StockInfo {
  idMau: number;
  tenMau: string;
  tongSoLuong: number;
  soLuongCoSan: number;
  chiTietTheoDaiLy: Array<{
    idDaiLy: number;
    tenDaiLy: string;
    thanhPho: string;
    soLuongCoSan: number;
    soDienThoai: string;
  }>;
}

const useProductStockChecker = (productId: number | null) => {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInStock, setIsInStock] = useState<boolean>(true);

  const checkStock = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<StockInfo>(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/ton-kho/kiem-tra/${productId}`
      );
      
      setStockInfo(response.data);
      setIsInStock(response.data.soLuongCoSan > 0);
    } catch (err: any) {
      console.error('Error checking product stock:', err);
      if (err.response) {
        // Server responded with error status
        setError(`Lỗi server: ${err.response.status} - ${err.response.data?.error || 'Không xác định'}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Something else happened
        setError(`Lỗi không xác định: ${err.message}`);
      }
      setIsInStock(false);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    checkStock();
  }, [checkStock]);

  return {
    stockInfo,
    isInStock,
    loading,
    error,
    refresh: checkStock
  };
};

export default useProductStockChecker;