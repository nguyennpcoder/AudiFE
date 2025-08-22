import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Admin.css';
import axios from 'axios';
import { message } from 'antd';

import AdminHeader from './AdminHeader';

// Khai báo kiểu dữ liệu cho đại lý
interface Dealership {
  id: number;
  ten: string;
  diaChi: string;
  thanhPho: string;
  tinh: string;
  maBuuDien: string;
  quocGia: string;
  soDienThoai: string;
  email: string;
  gioLamViec: string;
  viTriDiaLy: string;
  laTrungTamDichVu: boolean;
  soLuongXeTonKho?: number;
}

const DealershipManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Dealership | null>(null);
  const [viewing, setViewing] = useState<Dealership | null>(null);
  const [filterThanhPho, setFilterThanhPho] = useState<string | undefined>();
  const [filterTinh, setFilterTinh] = useState<string | undefined>();
  const [filterLoai, setFilterLoai] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  
  // Thêm states cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1';

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'QUAN_TRI') {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dai-ly`);
      setData(response.data);
    } catch (error: any) {
      message.error('Không thể tải dữ liệu đại lý');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: FormData) => {
    setFormLoading(true);
    setFormError(null);
    
    try {
      if (editing) {
        const updateData = {
          ten: formData.get('ten'),
          diaChi: formData.get('diaChi'),
          thanhPho: formData.get('thanhPho'),
          tinh: formData.get('tinh'),
          maBuuDien: formData.get('maBuuDien'),
          quocGia: formData.get('quocGia'),
          soDienThoai: formData.get('soDienThoai'),
          email: formData.get('email'),
          gioLamViec: formData.get('gioLamViec'),
          viTriDiaLy: formData.get('viTriDiaLy'),
          laTrungTamDichVu: formData.get('laTrungTamDichVu') === 'true'
        };
        
        await axios.put(`${API_URL}/dai-ly/${editing.id}`, updateData);
        message.success('Cập nhật thành công');
        
        const updatedData = await axios.get(`${API_URL}/dai-ly`);
        setData(updatedData.data);
        
        const updatedDealership = updatedData.data.find((d: Dealership) => d.id === editing.id);
        if (updatedDealership) {
          setViewing(updatedDealership);
        }
        
        setShowForm(false);
        setEditing(null);
      } else {
        const newData = {
          ten: formData.get('ten'),
          diaChi: formData.get('diaChi'),
          thanhPho: formData.get('thanhPho'),
          tinh: formData.get('tinh'),
          maBuuDien: formData.get('maBuuDien'),
          quocGia: formData.get('quocGia'),
          soDienThoai: formData.get('soDienThoai'),
          email: formData.get('email'),
          gioLamViec: formData.get('gioLamViec'),
          viTriDiaLy: formData.get('viTriDiaLy'),
          laTrungTamDichVu: formData.get('laTrungTamDichVu') === 'true'
        };
        
        await axios.post(`${API_URL}/dai-ly`, newData);
        message.success('Thêm mới thành công');
        
        setShowForm(false);
        setEditing(null);
        fetchData();
      }
    } catch (error: any) {
      setFormError(error.message);
      message.error(error.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/dai-ly/${id}`);
      message.success('Đã xóa');
      fetchData();
    } catch (error: any) {
      message.error('Không thể xóa đại lý');
    }
  };

  const handleToggleServiceCenter = async (id: number, laTrungTamDichVu: boolean) => {
    try {
      const dealership = data.find(d => d.id === id);
      if (dealership) {
        await axios.put(`${API_URL}/dai-ly/${id}`, {
          ...dealership,
          laTrungTamDichVu: !laTrungTamDichVu
        });
        message.success(laTrungTamDichVu ? 'Đã chuyển thành đại lý bán hàng' : 'Đã chuyển thành trung tâm dịch vụ');
        fetchData();
      }
    } catch (error: any) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  // Lấy danh sách thành phố và tỉnh duy nhất
  const cities = [...new Set(data.map(d => d.thanhPho))].filter(Boolean);
  const provinces = [...new Set(data.map(d => d.tinh))].filter(Boolean);

  const filteredData = data.filter(item =>
    (!filterThanhPho || item.thanhPho === filterThanhPho) &&
    (!filterTinh || item.tinh === filterTinh) &&
    (!filterLoai || 
      (filterLoai === 'true' && item.laTrungTamDichVu) ||
      (filterLoai === 'false' && !item.laTrungTamDichVu)
    ) &&
    (!search || 
      item.ten.toLowerCase().includes(search.toLowerCase()) ||
      item.diaChi.toLowerCase().includes(search.toLowerCase()) ||
      item.thanhPho.toLowerCase().includes(search.toLowerCase()) ||
      item.soDienThoai.includes(search)
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
  }, [filterThanhPho, filterTinh, filterLoai, search]);

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
          <p>Đang tải dữ liệu đại lý...</p>
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
      <AdminHeader pageTitle="Quản lý Đại lý" />
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
            <button
              className="btn-add"
              onClick={() => { setShowForm(true); setEditing(null); }}
              style={{
                background: '#52c41a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 8px 0 rgba(82,196,26,0.10)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className="fas fa-plus"></i> Thêm đại lý
            </button>
            <select
              value={filterThanhPho || ''}
              onChange={(e) => setFilterThanhPho(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333', // Thêm màu chữ đậm
              }}
            >
              <option value="" style={{ color: '#333' }}>Tất cả thành phố</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={filterTinh || ''}
              onChange={(e) => setFilterTinh(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333', // Thêm màu chữ đậm
              }}
            >
              <option value="" style={{ color: '#333' }}>Tất cả tỉnh</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <select
              value={filterLoai || ''}
              onChange={(e) => setFilterLoai(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333', // Thêm màu chữ đậm
              }}
            >
              <option value="" style={{ color: '#333' }}>Tất cả loại</option>
              <option value="true">Trung tâm dịch vụ</option>
              <option value="false">Đại lý bán hàng</option>
            </select>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Tìm kiếm đại lý..."
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
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '5%' }}>ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Tên đại lý</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Địa chỉ</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Thành phố</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Tỉnh</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Số điện thoại</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Loại</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', width: '9%' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ 
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
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8,
                            overflow: 'hidden'
                          }}>
                            <span style={{ 
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={item.ten}>
                              {item.ten}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          maxWidth: '0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <span title={item.diaChi}>
                            {item.diaChi}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.thanhPho}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.tinh}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.soDienThoai}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            background: item.laTrungTamDichVu ? '#e8f5e9' : '#ffebee',
                            color: item.laTrungTamDichVu ? '#43a047' : '#e53935',
                            borderRadius: 8,
                            padding: '2px 14px',
                            fontWeight: 600,
                            fontSize: 14
                          }}>
                            {item.laTrungTamDichVu ? 'Trung tâm dịch vụ' : 'Đại lý bán hàng'}
                          </span>
                        </td>
                        <td style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          minWidth: 120,
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}>
                            <button 
                              className="btn-view" 
                              title="Xem" 
                              onClick={() => setViewing(item)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn-edit" 
                              title="Sửa" 
                              onClick={() => { setEditing(item); setShowForm(true); }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn-publish"
                              title={item.laTrungTamDichVu ? "Chuyển thành đại lý bán hàng" : "Chuyển thành trung tâm dịch vụ"}
                              onClick={() => handleToggleServiceCenter(item.id, item.laTrungTamDichVu)}
                              style={{
                                background: item.laTrungTamDichVu ? '#ff4d4f' : '#43a047',
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
                              <i className={`fas ${item.laTrungTamDichVu ? 'fa-store' : 'fa-tools'}`}></i>
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
                        <td colSpan={8} style={{ padding: '10px 8px' }}></td>
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
      
      {/* Modal Form Add/Edit */}
      {(showForm) && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>
                {editing ? "Sửa đại lý" : "Thêm đại lý"}
              </h2>
              <button
                className="admin-modal-close"
                onClick={() => { 
                  setShowForm(false); 
                  setEditing(null); 
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  // Tạo FormData từ form
                  const formData = new FormData(e.currentTarget);
                  
                  // Gọi handleSave với FormData
                  await handleSave(formData);
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ten">Tên đại lý <span className="required">*</span></label>
                    <input
                      type="text"
                      id="ten"
                      name="ten"
                      defaultValue={editing?.ten || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="soDienThoai">Số điện thoại <span className="required">*</span></label>
                    <input
                      type="tel"
                      id="soDienThoai"
                      name="soDienThoai"
                      defaultValue={editing?.soDienThoai || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="diaChi">Địa chỉ <span className="required">*</span></label>
                  <textarea
                    id="diaChi"
                    name="diaChi"
                    defaultValue={editing?.diaChi || ''}
                    rows={3}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                    }}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="thanhPho">Thành phố <span className="required">*</span></label>
                    <input
                      type="text"
                      id="thanhPho"
                      name="thanhPho"
                      defaultValue={editing?.thanhPho || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tinh">Tỉnh</label>
                    <input
                      type="text"
                      id="tinh"
                      name="tinh"
                      defaultValue={editing?.tinh || ''}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maBuuDien">Mã bưu điện <span className="required">*</span></label>
                    <input
                      type="text"
                      id="maBuuDien"
                      name="maBuuDien"
                      defaultValue={editing?.maBuuDien || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="quocGia">Quốc gia <span className="required">*</span></label>
                    <input
                      type="text"
                      id="quocGia"
                      name="quocGia"
                      defaultValue={editing?.quocGia || 'Việt Nam'}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={editing?.email || ''}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gioLamViec">Giờ làm việc</label>
                    <input
                      type="text"
                      id="gioLamViec"
                      name="gioLamViec"
                      defaultValue={editing?.gioLamViec || ''}
                      placeholder="VD: Thứ 2 - Thứ 6: 8:00 - 18:00"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="viTriDiaLy">Vị trí địa lý</label>
                  <input
                    type="text"
                    id="viTriDiaLy"
                    name="viTriDiaLy"
                    defaultValue={editing?.viTriDiaLy || ''}
                    placeholder="VD: Tọa độ GPS hoặc mô tả vị trí"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      id="laTrungTamDichVu"
                      name="laTrungTamDichVu"
                      defaultChecked={editing?.laTrungTamDichVu ?? true}
                      value="true"
                      style={{
                        marginRight: 8,
                        transform: 'scale(1.2)'
                      }}
                    />
                    Là trung tâm dịch vụ
                  </label>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowForm(false);
                    }}
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
                    type="submit"
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
                    {formLoading ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal View */}
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
              <span>Xem chi tiết đại lý</span>
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
              {/* Tên đại lý & Số điện thoại */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Tên đại lý</label>
                  <input
                    type="text"
                    value={viewing.ten}
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
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Số điện thoại</label>
                  <input
                    type="text"
                    value={viewing.soDienThoai}
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
              
              {/* Địa chỉ */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Địa chỉ</label>
                <input
                  type="text"
                  value={viewing.diaChi}
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
              
              {/* Thành phố & Tỉnh */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Thành phố</label>
                  <input
                    type="text"
                    value={viewing.thanhPho}
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
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Tỉnh</label>
                  <input
                    type="text"
                    value={viewing.tinh || 'Không có'}
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
              
              {/* Mã bưu điện & Quốc gia */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Mã bưu điện</label>
                  <input
                    type="text"
                    value={viewing.maBuuDien}
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
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Quốc gia</label>
                  <input
                    type="text"
                    value={viewing.quocGia}
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
              
              {/* Email & Giờ làm việc */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Email</label>
                  <input
                    type="text"
                    value={viewing.email || 'Không có'}
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
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Loại</label>
                  <input
                    type="text"
                    value={viewing.laTrungTamDichVu ? 'Trung tâm dịch vụ' : 'Đại lý bán hàng'}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: viewing.laTrungTamDichVu ? '#e8f5e9' : '#ffebee',
                      color: viewing.laTrungTamDichVu ? '#43a047' : '#e53935',
                      width: '100%',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
              
              {/* Giờ làm việc */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Giờ làm việc</label>
                <input
                  type="text"
                  value={viewing.gioLamViec || 'Không có'}
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
              
              {/* Vị trí địa lý */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Vị trí địa lý</label>
                <input
                  type="text"
                  value={viewing.viTriDiaLy || 'Không có'}
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
              
              <div style={{ height: 24 }} /> {/* Khoảng cách dưới cùng */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealershipManagement;