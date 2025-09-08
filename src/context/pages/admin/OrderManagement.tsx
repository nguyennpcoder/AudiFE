import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Admin.css';

import AdminHeader from './AdminHeader';

// Khai báo kiểu dữ liệu cho đơn hàng
interface DonHang {
  id: number;
  idNguoiDung: number;
  tenNguoiDung: string;
  idDaiLy: number;
  tenDaiLy: string;
  ngayDat: string;
  trangThai: string;
  tongTien: number;
  ngayGiaoDuKien: string;
  ngayGiaoThucTe: string;
  phuongThucThanhToan: string;
  ghiChu: string;
  idKhuyenMai?: number;
  tenKhuyenMai?: string;
  tienGiam?: number;
  chiTietDonHangDTOs: ChiTietDonHang[];
}

// Khai báo kiểu dữ liệu cho chi tiết đơn hàng
interface ChiTietDonHang {
  id: number;
  idDonHang: number;
  idMauXe: number;
  tenMauXe: string;
  soLuong: number;
  giaBan: number;
  mauSac: string;
  noiThat: string;
  options: string;
}

// Khai báo kiểu dữ liệu cho hồ sơ trả góp
interface HoSoTraGop {
  id: number;
  idDonHang: number;
  nguoiMuaHo: string;
  soDienThoaiNguoiMuaHo: string;
  emailNguoiMuaHo: string;
  diaChiNguoiMuaHo: string;
  nganHangDoiTac: string;
  soTienVay: number;
  laiSuat: number;
  kyHanThang: number;
  traHangThang: number;
  trangThai: string;
  ngayNopHoSo: string;
  ngayQuyetDinh: string;
  ghiChu: string;
  lyDoTuChoi: string;
}

const OrderManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DonHang | null>(null);
  const [viewing, setViewing] = useState<DonHang | null>(null);
  const [filterTrangThai, setFilterTrangThai] = useState<string | undefined>();
  const [filterDaiLy, setFilterDaiLy] = useState<string | undefined>();
  const [filterMonth, setFilterMonth] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  
  // Thêm states cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // States cho các modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHoSoModal, setShowHoSoModal] = useState(false);
  const [currentHoSo, setCurrentHoSo] = useState<HoSoTraGop | null>(null);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'QUAN_TRI') {
      alert('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/don-hang', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải danh sách đơn hàng: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error: any) {
      alert(error.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (idDonHang: number, trangThai: string) => {
    setFormLoading(true);
    setFormError(null);
    
    try {
      const token = localStorage.getItem('token');
      const order = data.find(o => o.id === idDonHang);
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      
      const updatedOrder = { ...order, trangThai };
      
      const response = await fetch(`http://localhost:8080/api/v1/don-hang/${idDonHang}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedOrder)
      });
      
      if (!response.ok) {
        throw new Error(`Không thể cập nhật trạng thái: ${response.status}`);
      }
      
      alert('Cập nhật trạng thái thành công');
      setShowUpdateModal(false);
      fetchData();
    } catch (error: any) {
      setFormError(error.message);
      alert(error.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/don-hang/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể xóa đơn hàng: ${response.status}`);
      }
      
      alert('Đã xóa');
      setShowDeleteModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const fetchHoSoTraGopByDonHang = async (idDonHang: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/tra-gop/don-hang/${idDonHang}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải hồ sơ trả góp: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setCurrentHoSo(data[0]);
        setShowHoSoModal(true);
      } else {
        alert("Đơn hàng này chưa có hồ sơ trả góp");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Lấy danh sách đại lý duy nhất
  const daiLyList = Array.from(new Set(data.map(order => order.idDaiLy)))
    .map(idDaiLy => {
      const daiLy = data.find(order => order.idDaiLy === idDaiLy);
      return {
        id: idDaiLy,
        ten: daiLy ? daiLy.tenDaiLy : `Đại lý ${idDaiLy}`
      };
    });

  const filteredData = data.filter(item =>
    (!filterTrangThai || item.trangThai === filterTrangThai) &&
    (!filterDaiLy || item.idDaiLy.toString() === filterDaiLy) &&
    (!filterMonth || (() => {
      if (!item.ngayDat) return false;
      const [year, monthNum] = filterMonth.split('-');
      const orderDate = new Date(item.ngayDat);
      return orderDate.getFullYear().toString() === year && 
            (orderDate.getMonth() + 1).toString().padStart(2, '0') === monthNum;
    })()) &&
    (!search || 
      item.tenNguoiDung.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().includes(search) ||
      item.tenDaiLy.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset về trang đầu khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTrangThai, filterDaiLy, filterMonth, search]);

  // Hiển thị trạng thái đơn hàng
  const renderOrderStatus = (status: string) => {
    switch (status) {
      case 'cho_xu_ly':
        return <span style={{
          display: 'inline-block',
          background: '#fff3cd',
          color: '#856404',
          borderRadius: 8,
          padding: '2px 14px',
          fontWeight: 600,
          fontSize: 14
        }}>Chờ xử lý</span>;
      case 'dang_xu_ly':
        return <span style={{
          display: 'inline-block',
          background: '#cce5ff',
          color: '#004085',
          borderRadius: 8,
          padding: '2px 14px',
          fontWeight: 600,
          fontSize: 14
        }}>Đang xử lý</span>;
      case 'da_thanh_toan':
        return <span style={{
          display: 'inline-block',
          background: '#d4edda',
          color: '#155724',
          borderRadius: 8,
          padding: '2px 14px',
          fontWeight: 600,
          fontSize: 14
        }}>Đã thanh toán</span>;
      case 'da_huy':
        return <span style={{
          display: 'inline-block',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: 8,
          padding: '2px 14px',
          fontWeight: 600,
          fontSize: 14
        }}>Đã hủy</span>;
      case 'da_giao':
        return <span style={{
          display: 'inline-block',
          background: '#d1ecf1',
          color: '#0c5460',
          borderRadius: 8,
          padding: '2px 14px',
          fontWeight: 600,
          fontSize: 14
        }}>Đã giao</span>;
      default:
        return <span style={{
          display: 'inline-block',
          background: '#e2e3e5',
          color: '#383d41',
          borderRadius: 8,
          padding: '2px 14px',
          fontWeight: 600,
          fontSize: 14
        }}>{status}</span>;
    }
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        background: '#f5f5f5', 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#f5f5f5', 
      height: '100vh', // Cố định chiều cao viewport
      overflow: 'hidden', // Không cho scroll
      padding: 0 
    }}>
      <AdminHeader pageTitle="Quản lý đơn hàng" />
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '32px 0 0 0',
        height: 'calc(100vh - 80px)', // Trừ đi chiều cao header
        overflow: 'hidden', // Không cho scroll
      }}>
        <div className="admin-section" style={{ 
          background: '#fff', 
          borderRadius: 18, 
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', 
          padding: '32px 32px 24px 32px', 
          marginBottom: 32,
          height: 'calc(100vh - 120px)', // Cố định chiều cao
          overflow: 'hidden', // Không cho scroll
        }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterTrangThai || ''}
              onChange={(e) => setFilterTrangThai(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333', // Thêm màu chữ đậm
              }}
            >
              <option value="" style={{ color: '#333' }}>Tất cả trạng thái</option>
              <option value="cho_xu_ly">Chờ xử lý</option>
              <option value="dang_xu_ly">Đang xử lý</option>
              <option value="da_thanh_toan">Đã thanh toán</option>
              <option value="da_giao">Đã giao</option>
              <option value="da_huy">Đã hủy</option>
            </select>
            
            <select
              value={filterDaiLy || ''}
              onChange={(e) => setFilterDaiLy(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333', // Thêm màu chữ đậm
              }}
            >
              <option value="" style={{ color: '#333' }}>Tất cả đại lý</option>
              {daiLyList.map(daiLy => (
                <option key={daiLy.id} value={daiLy.id.toString()}>
                  {daiLy.ten}
                </option>
              ))}
            </select>
            
            <select
              value={filterMonth || ''}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333', // Thêm màu chữ đậm
              }}
            >
              <option value="" style={{ color: '#333' }}>Tất cả thời gian</option>
              <option value="2023-12">Tháng 12/2023</option>
              <option value="2024-01">Tháng 01/2024</option>
              <option value="2024-02">Tháng 02/2024</option>
              <option value="2024-03">Tháng 03/2024</option>
              <option value="2024-04">Tháng 04/2024</option>
              <option value="2024-05">Tháng 05/2024</option>
            </select>
            
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 15,
                  background: '#fafbfc',
                }}
              />
            </div>
          </div>

          {/* Table Container - Cố định chiều cao */}
          <div style={{ 
            height: 'calc(100vh - 280px)', // Điều chỉnh chiều cao sau khi gỡ statistics
            overflow: 'hidden', // Không cho scroll
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Table */}
            <div style={{ 
              overflowX: 'auto', 
              borderRadius: 12, 
              background: '#fafbfc',
              flex: 1, // Chiếm hết không gian còn lại
              minHeight: 0 // Quan trọng cho flex
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate', 
                borderSpacing: 0,
                height: '100%' // Chiếm hết chiều cao
              }}>
                <thead>
                  <tr style={{ background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '8%' }}>Mã đơn</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '18%' }}>Khách hàng</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '18%' }}>Đại lý</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '15%' }}>Ngày đặt</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', width: '15%' }}>Tổng tiền</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', width: '14%' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        textAlign: 'center', 
                        padding: '100px 24px',
                        color: '#888',
                        height: '300px'
                      }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className="table-row-fadein"
                        style={{ 
                          background: '#fff', 
                          borderBottom: '1px solid #f0f0f0',
                          animationDelay: `${idx * 120}ms`,
                          height: '50px'
                        }}
                      >
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.id}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          maxWidth: '0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <span title={item.tenNguoiDung}>
                            {item.tenNguoiDung}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          maxWidth: '0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <span title={item.tenDaiLy}>
                            {item.tenDaiLy}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatDate(item.ngayDat)}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          textAlign: 'right',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatPrice(item.tongTien)}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {renderOrderStatus(item.trangThai)}
                        </td>
                        <td style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          minWidth: 160,
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}>
                            <button 
                              className="btn-view" 
                              title="Xem chi tiết" 
                              onClick={() => setViewing(item)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn-edit" 
                              title="Cập nhật trạng thái" 
                              onClick={() => { setEditing(item); setShowUpdateModal(true); }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {item.phuongThucThanhToan === 'tra_gop' && (
                              <button 
                                className="btn-loan" 
                                title="Xem hồ sơ trả góp" 
                                onClick={() => fetchHoSoTraGopByDonHang(item.id)}
                                style={{
                                  background: '#17a2b8',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                  fontWeight: 600,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minWidth: 36,
                                  height: 36,
                                }}
                              >
                                <i className="fas fa-file-invoice-dollar"></i>
                              </button>
                            )}
                            <button
                              className="btn-delete"
                              title="Xóa đơn hàng"
                              onClick={() => { setEditing(item); setShowDeleteModal(true); }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Thêm các row trống để cố định chiều cao khi data ít */}
                  {currentData.length > 0 && currentData.length < 10 && 
                    Array.from({ length: 10 - currentData.length }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '50px', background: '#fff' }}>
                        <td colSpan={7} style={{ padding: '10px 8px' }}></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination - Cố định ở dưới */}
            <div className="admin-pagination" style={{ 
              marginTop: 16, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 8,
              flexShrink: 0 // Không co lại
            }}>
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              
              <span style={{ fontSize: 14, color: '#555' }}>
                Trang {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal View - Xem chi tiết đơn hàng */}
      {viewing && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            padding: 0,
            minWidth: 600,
            maxWidth: 700,
          }}>
            <div
              className="admin-modal-header"
              style={{
                background: 'linear-gradient(90deg, #1890ff 0%, #43a047 100%)',
                borderRadius: '18px 18px 0 0',
                padding: '22px 32px 18px 32px',
                color: '#fff',
                fontWeight: 700,
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: 0
              }}
            >
              <span>Chi tiết đơn hàng {viewing.id}</span>
              <button
                onClick={() => setViewing(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form style={{ padding: '28px 32px 0 32px' }}>
              {/* Thông tin đơn hàng */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Khách hàng</label>
                  <input
                    type="text"
                    value={viewing.tenNguoiDung}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Đại lý</label>
                  <input
                    type="text"
                    value={viewing.tenDaiLy}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Ngày đặt & Trạng thái */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Ngày đặt</label>
                  <input
                    type="text"
                    value={formatDate(viewing.ngayDat)}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Trạng thái</label>
                  <input
                    type="text"
                    value={viewing.trangThai}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Tổng tiền & Phương thức thanh toán */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Tổng tiền</label>
                  <input
                    type="text"
                    value={formatPrice(viewing.tongTien)}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Phương thức thanh toán</label>
                  <input
                    type="text"
                    value={viewing.phuongThucThanhToan === 'tra_gop' ? 'Trả góp' : 
                           viewing.phuongThucThanhToan === 'chuyen_khoan' ? 'Chuyển khoản' : 'Tiền mặt'}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Chi tiết sản phẩm */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Chi tiết sản phẩm</label>
                <div style={{ 
                  background: '#f8f9fa', 
                  borderRadius: 8, 
                  padding: '16px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {viewing.chiTietDonHangDTOs.map((item, index) => (
                    <div key={item.id} style={{ 
                      borderBottom: index < viewing.chiTietDonHangDTOs.length - 1 ? '1px solid #e9ecef' : 'none',
                      paddingBottom: index < viewing.chiTietDonHangDTOs.length - 1 ? '12px' : '0',
                      marginBottom: index < viewing.chiTietDonHangDTOs.length - 1 ? '12px' : '0'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.tenMauXe}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Màu: {item.mauSac} | Nội thất: {item.noiThat} | Số lượng: {item.soLuong} | Giá: {formatPrice(item.giaBan)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ height: 24 }} /> {/* Khoảng cách dưới cùng */}
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Status */}
      {showUpdateModal && editing && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Cập nhật trạng thái đơn hàng {editing.id}</h2>
              <button
                className="admin-modal-close"
                onClick={() => { setShowUpdateModal(false); setEditing(null); }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ marginBottom: 20 }}>
                <p style={{ marginBottom: 16, fontSize: 16, color: '#666' }}>
                  Trạng thái hiện tại: {renderOrderStatus(editing.trangThai)}
                </p>
                <p style={{ marginBottom: 16, fontSize: 16, color: '#666' }}>
                  Chọn trạng thái mới:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    onClick={() => handleUpdateStatus(editing.id, 'cho_xu_ly')}
                    disabled={formLoading}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#fff3cd',
                      color: '#856404',
                      fontWeight: 600,
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Chờ xử lý
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(editing.id, 'dang_xu_ly')}
                    disabled={formLoading}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#cce5ff',
                      color: '#004085',
                      fontWeight: 600,
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Đang xử lý
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(editing.id, 'da_thanh_toan')}
                    disabled={formLoading}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#d4edda',
                      color: '#155724',
                      fontWeight: 600,
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Đã thanh toán
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(editing.id, 'da_giao')}
                    disabled={formLoading}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#d1ecf1',
                      color: '#0c5460',
                      fontWeight: 600,
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Đã giao
                  </button>
                </div>
              </div>
              
              {formError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: 8,
                  marginBottom: 16,
                  color: '#721c24',
                  fontSize: 14
                }}>
                  {formError}
                </div>
              )}
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => { setShowUpdateModal(false); setEditing(null); }}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                    marginRight: 10,
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-save"
                  disabled={formLoading}
                  style={{
                    background: formLoading ? '#ccc' : '#43a047',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px 0 rgba(67,160,71,0.10)',
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {formLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && editing && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Xóa đơn hàng</h2>
              <button
                className="admin-modal-close"
                onClick={() => { setShowDeleteModal(false); setEditing(null); }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ 
                textAlign: 'center', 
                padding: '20px 0',
                color: '#666'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ 
                  fontSize: 48, 
                  color: '#ffc107', 
                  marginBottom: 16 
                }}></i>
                <p style={{ marginBottom: 8, fontSize: 16 }}>
                  Bạn có chắc chắn muốn xóa đơn hàng {editing.id}?
                </p>
                <p style={{ fontSize: 14, opacity: 0.8 }}>
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => { setShowDeleteModal(false); setEditing(null); }}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                    marginRight: 10,
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => handleDelete(editing.id)}
                  style={{
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px 0 rgba(220,53,69,0.10)',
                  }}
                >
                  Xóa đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hồ sơ trả góp */}
      {showHoSoModal && currentHoSo && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            padding: 0,
            minWidth: 600,
            maxWidth: 700,
          }}>
            <div
              className="admin-modal-header"
              style={{
                background: 'linear-gradient(90deg, #1890ff 0%, #43a047 100%)',
                borderRadius: '18px 18px 0 0',
                padding: '22px 32px 18px 32px',
                color: '#fff',
                fontWeight: 700,
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: 0
              }}
            >
              <span>Hồ sơ trả góp {currentHoSo.id}</span>
              <button
                onClick={() => { setShowHoSoModal(false); setCurrentHoSo(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form style={{ padding: '28px 32px 0 32px' }}>
              {/* Thông tin hồ sơ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Mã đơn hàng</label>
                  <input
                    type="text"
                    value={currentHoSo.idDonHang}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Trạng thái</label>
                  <input
                    type="text"
                    value={currentHoSo.trangThai === 'dang_xu_ly' ? 'Đang xử lý' :
                           currentHoSo.trangThai === 'da_phe_duyet' ? 'Đã phê duyệt' :
                           currentHoSo.trangThai === 'da_tu_choi' ? 'Đã từ chối' :
                           currentHoSo.trangThai === 'hoan_thanh' ? 'Hoàn thành' : currentHoSo.trangThai}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Ngày nộp & Ngày quyết định */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Ngày nộp hồ sơ</label>
                  <input
                    type="text"
                    value={formatDate(currentHoSo.ngayNopHoSo)}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Ngày quyết định</label>
                  <input
                    type="text"
                    value={currentHoSo.ngayQuyetDinh ? formatDate(currentHoSo.ngayQuyetDinh) : 'Chưa có'}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Số tiền vay & Lãi suất */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Số tiền vay</label>
                  <input
                    type="text"
                    value={formatPrice(currentHoSo.soTienVay)}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Lãi suất</label>
                  <input
                    type="text"
                    value={`${currentHoSo.laiSuat}%/năm`}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Kỳ hạn & Trả hàng tháng */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Kỳ hạn</label>
                  <input
                    type="text"
                    value={`${currentHoSo.kyHanThang} tháng`}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Trả hàng tháng</label>
                  <input
                    type="text"
                    value={formatPrice(currentHoSo.traHangThang)}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              
              {/* Ngân hàng đối tác */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Ngân hàng đối tác</label>
                <input
                  type="text"
                  value={currentHoSo.nganHangDoiTac}
                  readOnly
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 15,
                    background: '#fafbfc',
                    color: '#333',
                    width: '100%',
                    fontWeight: 500,
                  }}
                />
              </div>
              
              {/* Thông tin người mua hộ */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Thông tin người mua hộ</label>
                <div style={{ 
                  background: '#f8f9fa', 
                  borderRadius: 8, 
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Họ tên:</strong> {currentHoSo.nguoiMuaHo}
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Số điện thoại:</strong> {currentHoSo.soDienThoaiNguoiMuaHo}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Email:</strong> {currentHoSo.emailNguoiMuaHo}
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Địa chỉ:</strong> {currentHoSo.diaChiNguoiMuaHo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ghi chú */}
              {currentHoSo.ghiChu && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Ghi chú</label>
                  <textarea
                    value={currentHoSo.ghiChu}
                    readOnly
                    rows={3}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#f5f5f5',
                      color: '#222',
                      width: '100%',
                      fontWeight: 500,
                      resize: 'none',
                    }}
                  />
                </div>
              )}
              
              {/* Lý do từ chối */}
              {currentHoSo.trangThai === 'da_tu_choi' && currentHoSo.lyDoTuChoi && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Lý do từ chối</label>
                  <textarea
                    value={currentHoSo.lyDoTuChoi}
                    readOnly
                    rows={3}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#ffebee',
                      color: '#c62828',
                      width: '100%',
                      fontWeight: 500,
                      resize: 'none',
                    }}
                  />
                </div>
              )}
              
              <div style={{ height: 24 }} /> {/* Khoảng cách dưới cùng */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;