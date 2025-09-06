import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getAllDealerships, getDealershipById, Dealership } from '../../../services/dealershipService';
import DealershipCard from '../../../components/sections/DealershipCard';
import '../../../styles/Dealership.css';

const DealershipPage: React.FC = () => {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(6);
  const params = useParams<{ id?: string }>();

  // Tối ưu hóa scroll to top function với useCallback
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Tối ưu hóa fetch dealerships với useCallback
  const fetchDealerships = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching dealerships...');
    try {
      const data = await getAllDealerships();
      console.log('Dealerships data:', data);
      setDealerships(data);
      setTotalItems(data.length);
      setTotalPages(Math.ceil(data.length / pageSize));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin đại lý';
      setError(errorMessage);
      console.error('Error fetching dealerships:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    scrollToTop();
    fetchDealerships();
  }, [scrollToTop, fetchDealerships]);

  // Tối ưu hóa handlePageChange với useCallback
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    scrollToTop();
  }, [scrollToTop]);

  // Tối ưu hóa getCurrentPageDealerships với useMemo
  const getCurrentPageDealerships = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return dealerships.slice(startIndex, endIndex);
  }, [dealerships, currentPage, pageSize]);

  // Tối ưu hóa getPageNumbers với useMemo
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push(-1);
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Tối ưu hóa loading state
  if (loading) {
    return (
      <div className="audi-dealership-container">
        <div className="audi-dealership-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
        </div>
        <div className="audi-dealership-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="audi-dealership-card skeleton-card">
              <div className="skeleton skeleton-map"></div>
              <div className="audi-dealership-card-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tối ưu hóa error state
  if (error) {
    return (
      <div className="audi-dealership-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchDealerships}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="audi-dealership-container fade-in">
      <div className="audi-dealership-header">
        <h1 className="audi-dealership-title">
          Mạng lưới đại lý
          <span className="audi-dealership-brand">Audi</span>
        </h1>
        <p className="audi-dealership-subtitle">
          Khám phá mạng lưới đại lý Audi trên toàn quốc và tìm đại lý gần bạn nhất
        </p>
      </div>

      {/* Debug info
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '10px', 
          margin: '20px', 
          borderRadius: '8px',
          fontSize: '12px',
          color: '#fff'
        }}>
          Debug: Loading: {loading.toString()}, Error: {error || 'none'}, Dealerships: {dealerships.length}
        </div>
      )} */}

      {dealerships.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>Chưa có đại lý nào</h3>
          <p>Hãy quay lại sau để xem thông tin đại lý</p>
        </div>
      ) : (
        <>
          <div className="audi-dealership-stats">
            <span className="stats-item">
              <strong>{totalItems}</strong> đại lý
            </span>
            <span className="stats-divider">•</span>
            <span className="stats-item">Trải dài toàn quốc</span>
          </div>
          
          <div className="audi-dealership-grid">
            {getCurrentPageDealerships.map((dealership, index) => (
              <DealershipCard 
                key={dealership.id} 
                dealership={dealership}
                index={index}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="audi-dealership-pagination">
              {/* Previous button */}
              <button 
                className={`pagination-btn ${currentPage === 0 ? 'disabled' : ''}`}
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Trang trước"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                </svg>
                <span className="btn-text">Trước</span>
              </button>
              
              {/* Page info */}
              <div className="pagination-info">
                <span className="page-info">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <span className="items-info">
                  ({((currentPage * pageSize) + 1)}-{Math.min((currentPage + 1) * pageSize, totalItems)} / {totalItems} đại lý)
                </span>
              </div>
              
              {/* Page numbers */}
              <div className="page-numbers">
                {getPageNumbers.map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === -1 ? (
                      <span className="page-ellipsis">...</span>
                    ) : (
                      <button
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                        aria-label={`Trang ${pageNum + 1}`}
                      >
                        {pageNum + 1}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Next button */}
              <button 
                className={`pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Trang tiếp"
              >
                <span className="btn-text">Sau</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DealershipPage; 