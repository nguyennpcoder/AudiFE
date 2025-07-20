import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Admin.css';
import { marketingService, KhuyenMai, DieuKienKhuyenMai } from '../../../services/marketingService';
import AdminHeader from './AdminHeader';

// Interfaces
interface MarketingScreenState {
  khuyenMaiList: KhuyenMai[];
  filteredKhuyenMai: KhuyenMai[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedStatus: string;
  selectedType: string;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: string;
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  currentKhuyenMai: KhuyenMai | null;
  newKhuyenMai: Partial<KhuyenMai>;
  totalItems: number;
  totalPages: number;
}

const MarketingManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [state, setState] = useState<MarketingScreenState>({
    khuyenMaiList: [],
    filteredKhuyenMai: [],
    isLoading: true,
    error: null,
    searchTerm: '',
    selectedStatus: '',
    selectedType: '',
    currentPage: 1,
    itemsPerPage: 10,
    sortField: 'ngayKetThuc',
    sortDirection: 'desc',
    showAddModal: false,
    showEditModal: false,
    showDeleteModal: false,
    currentKhuyenMai: null,
    newKhuyenMai: {
      ten: '',
      moTa: '',
      loaiGiamGia: 'phan_tram',
      giaTriGiam: 0,
      ngayBatDau: '',
      ngayKetThuc: '',
      maKhuyenMai: '',
      apDungCho: 'tat_ca_mau',
      giaTriToiThieu: 0,
      gioiHanSuDung: 0,
      danhSachDieuKien: []
    },
    totalItems: 0,
    totalPages: 0
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch khuyến mãi data
  const fetchKhuyenMai = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await marketingService.getAllKhuyenMai(
        state.currentPage - 1,
        state.itemsPerPage,
        state.sortField,
        state.sortDirection
      );
      setState(prev => ({
        ...prev,
        khuyenMaiList: response.khuyenMai,
        filteredKhuyenMai: response.khuyenMai,
        totalItems: response.tongItem,
        totalPages: response.tongTrang,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching khuyến mãi:', error);
      setState(prev => ({
        ...prev,
        error: 'Không thể tải danh sách khuyến mãi',
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    fetchKhuyenMai();
  }, [state.currentPage, state.itemsPerPage, state.sortField, state.sortDirection]);

  // Filter functions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setState(prev => ({ ...prev, searchTerm }));
    filterKhuyenMai(searchTerm, state.selectedStatus, state.selectedType);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value;
    setState(prev => ({ ...prev, selectedStatus }));
    filterKhuyenMai(state.searchTerm, selectedStatus, state.selectedType);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setState(prev => ({ ...prev, selectedType }));
    filterKhuyenMai(state.searchTerm, state.selectedStatus, selectedType);
  };

  const filterKhuyenMai = (search: string, status: string, type: string) => {
    let filtered = state.khuyenMaiList;

    if (search) {
      filtered = filtered.filter(km => 
        km.ten.toLowerCase().includes(search.toLowerCase()) ||
        km.maKhuyenMai?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      if (status === 'con_hieu_luc') {
        filtered = filtered.filter(km => km.conHieuLuc);
      } else if (status === 'het_hieu_luc') {
        filtered = filtered.filter(km => !km.conHieuLuc);
      }
    }

    if (type) {
      filtered = filtered.filter(km => km.loaiGiamGia === type);
    }

    setState(prev => ({ ...prev, filteredKhuyenMai: filtered }));
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Modal functions
  const handleShowAddModal = () => {
    setState(prev => ({
      ...prev,
      showAddModal: true,
      newKhuyenMai: {
        ten: '',
        moTa: '',
        loaiGiamGia: 'phan_tram',
        giaTriGiam: 0,
        ngayBatDau: '',
        ngayKetThuc: '',
        maKhuyenMai: '',
        apDungCho: 'tat_ca_mau',
        giaTriToiThieu: 0,
        gioiHanSuDung: 0,
        danhSachDieuKien: []
      }
    }));
  };

  // Xử lý hiển thị modal chỉnh sửa khuyến mãi
  const handleShowEditModal = (khuyenMai: KhuyenMai) => {
    setState(prev => ({
      ...prev,
      showEditModal: true,
      currentKhuyenMai: khuyenMai,
      newKhuyenMai: { ...khuyenMai }
    }));
  };

  const handleShowDeleteModal = (khuyenMai: KhuyenMai) => {
    setState(prev => ({
      ...prev,
      showDeleteModal: true,
      currentKhuyenMai: khuyenMai
    }));
  };

  const handleCloseModals = () => {
    setState(prev => ({
      ...prev,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      currentKhuyenMai: null
    }));
  };

  // CRUD operations
  const handleCreateKhuyenMai = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketingService.createKhuyenMai(state.newKhuyenMai as Omit<KhuyenMai, 'id' | 'soLanDaDung' | 'conHieuLuc' | 'trangThai'>);
      handleCloseModals();
      fetchKhuyenMai();
    } catch (error) {
      console.error('Error creating khuyến mãi:', error);
    }
  };

  const handleUpdateKhuyenMai = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentKhuyenMai) return;
    try {
      // Chuẩn bị dữ liệu để gửi
      const updateData = {
        ten: state.newKhuyenMai.ten,
        moTa: state.newKhuyenMai.moTa,
        loaiGiamGia: state.newKhuyenMai.loaiGiamGia,
        giaTriGiam: state.newKhuyenMai.giaTriGiam,
        ngayBatDau: state.newKhuyenMai.ngayBatDau,
        ngayKetThuc: state.newKhuyenMai.ngayKetThuc,
        maKhuyenMai: state.newKhuyenMai.maKhuyenMai,
        apDungCho: state.newKhuyenMai.apDungCho,
        giaTriToiThieu: state.newKhuyenMai.giaTriToiThieu,
        gioiHanSuDung: state.newKhuyenMai.gioiHanSuDung,
        trangThai: state.newKhuyenMai.trangThai, // Đảm bảo gửi giá trị này
        danhSachDieuKien: state.newKhuyenMai.danhSachDieuKien || []
      };
      
      console.log('Sending update data:', updateData);
      console.log('trangThai value:', updateData.trangThai);
      
      await marketingService.updateKhuyenMai(state.currentKhuyenMai.id, updateData);
      handleCloseModals();
      fetchKhuyenMai();
    } catch (error) {
      console.error('Error updating khuyến mãi:', error);
    }
  };

  const handleDeleteKhuyenMai = async () => {
    if (!state.currentKhuyenMai) return;
    try {
      await marketingService.deleteKhuyenMai(state.currentKhuyenMai.id);
      handleCloseModals();
      fetchKhuyenMai();
    } catch (error) {
      console.error('Error deleting khuyến mãi:', error);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (conHieuLuc: boolean, ngayKetThuc: string) => {
    const today = new Date();
    const endDate = new Date(ngayKetThuc);
    
    if (!conHieuLuc || endDate < today) {
      return <span className="status inactive">Hết hiệu lực</span>;
    }
    
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      return <span className="status warning">Còn {daysLeft} ngày</span>;
    }
    
    return <span className="status active">Còn hiệu lực</span>;
  };

  const getTypeText = (loaiGiamGia: string) => {
    switch (loaiGiamGia) {
      case 'phan_tram':
        return 'Giảm %';
      case 'so_tien_co_dinh':
        return 'Giảm tiền';
      case 'tuy_chon_mien_phi':
        return 'Tùy chọn miễn phí';
      default:
        return loaiGiamGia;
    }
  };

  const getStatusText = (trangThai: number) => {
    return trangThai === 1 ? 'Còn hiệu lực' : 'Hết hiệu lực';
  };

  const getStatusColor = (trangThai: number) => {
    return trangThai === 1 ? '#52c41a' : '#ff4d4f';
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await marketingService.updateKhuyenMaiStatus(id, newStatus);
      fetchKhuyenMai();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Calculate current users for pagination
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const currentKhuyenMai = state.filteredKhuyenMai.slice(startIndex, endIndex);
  const totalPages = Math.ceil(state.filteredKhuyenMai.length / state.itemsPerPage);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 0 }}>
      <AdminHeader pageTitle="Quản lý Marketing" />
    
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0 0 0', minHeight: '100vh' }}>
        <div className="admin-section" style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', padding: '32px 32px 24px 32px', marginBottom: 32 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Tìm kiếm khuyến mãi..."
                value={state.searchTerm}
                onChange={handleSearchChange}
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
            <select
              value={state.selectedStatus}
              onChange={handleStatusFilterChange}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                color: 'rgb(107, 114, 128)',
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="con_hieu_luc">Còn hiệu lực</option>
              <option value="het_hieu_luc">Hết hiệu lực</option>
            </select>
            <select
              value={state.selectedType}
              onChange={handleTypeFilterChange}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                color: 'rgb(107, 114, 128)',
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả loại</option>
              <option value="phan_tram">Giảm %</option>
              <option value="so_tien_co_dinh">Giảm tiền</option>
              <option value="tuy_chon_mien_phi">Tùy chọn miễn phí</option>
            </select>
            <button
              className="btn-add"
              onClick={handleShowAddModal}
              style={{
                background: '#1890ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className="fas fa-plus"></i> Thêm mới
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', borderRadius: 12, background: '#fafbfc' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tên khuyến mãi</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Loại giảm</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Giá trị</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Thời gian</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Trạng thái</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Sử dụng</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Đang tải...</td>
                  </tr>
                ) : state.error ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>{state.error}</td>
                  </tr>
                ) : currentKhuyenMai.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  currentKhuyenMai.map((khuyenMai, idx) => (
                    <tr
                      key={khuyenMai.id}
                      className="table-row-fadein"
                      style={{
                        animationDelay: `${idx * 120}ms`,
                        background: '#fff',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      <td style={{ padding: '10px 8px' }}>
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{khuyenMai.ten}</div>
                          {khuyenMai.maKhuyenMai && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Mã: {khuyenMai.maKhuyenMai}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span>{getTypeText(khuyenMai.loaiGiamGia)}</span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ fontWeight: 500 }}>
                          {khuyenMai.loaiGiamGia === 'phan_tram' 
                            ? `${khuyenMai.giaTriGiam}%`
                            : formatPrice(khuyenMai.giaTriGiam)
                          }
                        </div>
                        {khuyenMai.giaTriToiThieu && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Tối thiểu: {formatPrice(khuyenMai.giaTriToiThieu)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Từ: {formatDate(khuyenMai.ngayBatDau)}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Đến: {formatDate(khuyenMai.ngayKetThuc)}</div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span 
                          style={{ 
                            color: getStatusColor(khuyenMai.trangThai),
                            fontWeight: 'bold'
                          }}
                        >
                          {getStatusText(khuyenMai.trangThai)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{khuyenMai.soLanDaDung}</div>
                          {khuyenMai.gioiHanSuDung && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              / {khuyenMai.gioiHanSuDung}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          minWidth: 120,
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}>
                          <button className="btn-view" title="Xem chi tiết" onClick={() => { setIsEditMode(false); handleShowEditModal(khuyenMai); }}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn-edit" title="Chỉnh sửa" onClick={() => { setIsEditMode(true); handleShowEditModal(khuyenMai); }}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn-delete" title="Xóa" onClick={() => handleShowDeleteModal(khuyenMai)}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination" style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button 
                onClick={() => handlePageChange(1)}
                disabled={state.currentPage === 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: state.currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: state.currentPage === 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: state.currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: state.currentPage === 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              
              <span style={{ fontSize: 14, color: '#555' }}>
                Trang {state.currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === totalPages}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: state.currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: state.currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={state.currentPage === totalPages}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: state.currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: state.currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(state.showAddModal || state.showEditModal) && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>
                {state.showAddModal 
                  ? 'Tạo khuyến mãi mới' 
                  : isEditMode 
                    ? 'Chỉnh sửa khuyến mãi' 
                    : 'Xem chi tiết khuyến mãi'
                }
              </h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseModals}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={state.showAddModal ? handleCreateKhuyenMai : handleUpdateKhuyenMai}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ten">Tên khuyến mãi <span className="required">*</span></label>
                    <input
                      type="text"
                      id="ten"
                      name="ten"
                      value={state.newKhuyenMai.ten || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, ten: e.target.value }
                      }))}
                      required
                      readOnly={!state.showAddModal && !isEditMode}
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
                    <label htmlFor="maKhuyenMai">Mã khuyến mãi</label>
                    <input
                      type="text"
                      id="maKhuyenMai"
                      name="maKhuyenMai"
                      value={state.newKhuyenMai.maKhuyenMai || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, maKhuyenMai: e.target.value }
                      }))}
                      readOnly={!state.showAddModal && !isEditMode}
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
                  <label htmlFor="moTa">Mô tả</label>
                  <textarea
                    id="moTa"
                    name="moTa"
                    value={state.newKhuyenMai.moTa || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      newKhuyenMai: { ...prev.newKhuyenMai, moTa: e.target.value }
                    }))}
                    rows={3}
                    readOnly={!state.showAddModal && !isEditMode}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      resize: 'vertical',
                      color: '#333',
                    }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="loaiGiamGia">Loại giảm giá <span className="required">*</span></label>
                    <select
                      id="loaiGiamGia"
                      name="loaiGiamGia"
                      value={state.newKhuyenMai.loaiGiamGia || 'phan_tram'}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, loaiGiamGia: e.target.value as any }
                      }))}
                      required
                      disabled={!state.showAddModal && !isEditMode}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    >
                      <option value="phan_tram">Giảm theo phần trăm</option>
                      <option value="so_tien_co_dinh">Giảm số tiền cố định</option>
                      <option value="tuy_chon_mien_phi">Tùy chọn miễn phí</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="giaTriGiam">Giá trị giảm <span className="required">*</span></label>
                    <input
                      type="number"
                      id="giaTriGiam"
                      name="giaTriGiam"
                      value={state.newKhuyenMai.giaTriGiam || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, giaTriGiam: parseFloat(e.target.value) || 0 }
                      }))}
                      required
                      min="0"
                      step="0.01"
                      readOnly={!state.showAddModal && !isEditMode}
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
                    <label htmlFor="ngayBatDau">Ngày bắt đầu <span className="required">*</span></label>
                    <input
                      type="date"
                      id="ngayBatDau"
                      name="ngayBatDau"
                      value={state.newKhuyenMai.ngayBatDau || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, ngayBatDau: e.target.value }
                      }))}
                      required
                      readOnly={!state.showAddModal && !isEditMode}
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
                    <label htmlFor="ngayKetThuc">Ngày kết thúc <span className="required">*</span></label>
                    <input
                      type="date"
                      id="ngayKetThuc"
                      name="ngayKetThuc"
                      value={state.newKhuyenMai.ngayKetThuc || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, ngayKetThuc: e.target.value }
                      }))}
                      required
                      readOnly={!state.showAddModal && !isEditMode}
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
                    <label htmlFor="apDungCho">Áp dụng cho <span className="required">*</span></label>
                    <select
                      id="apDungCho"
                      name="apDungCho"
                      value={state.newKhuyenMai.apDungCho || 'tat_ca_mau'}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, apDungCho: e.target.value as any }
                      }))}
                      required
                      disabled={!state.showAddModal && !isEditMode}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    >
                      <option value="tat_ca_mau">Tất cả mẫu xe</option>
                      <option value="mau_cu_the">Mẫu xe cụ thể</option>
                      <option value="dong_cu_the">Dòng xe cụ thể</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="gioiHanSuDung">Giới hạn sử dụng</label>
                    <input
                      type="number"
                      id="gioiHanSuDung"
                      name="gioiHanSuDung"
                      value={state.newKhuyenMai.gioiHanSuDung || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        newKhuyenMai: { ...prev.newKhuyenMai, gioiHanSuDung: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                      readOnly={!state.showAddModal && !isEditMode}
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
                  <label htmlFor="giaTriToiThieu">Giá trị tối thiểu</label>
                  <input
                    type="number"
                    id="giaTriToiThieu"
                    name="giaTriToiThieu"
                    value={state.newKhuyenMai.giaTriToiThieu || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      newKhuyenMai: { ...prev.newKhuyenMai, giaTriToiThieu: parseFloat(e.target.value) || 0 }
                    }))}
                    min="0"
                    step="1000"
                    readOnly={!state.showAddModal && !isEditMode}
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

                {state.showEditModal && state.currentKhuyenMai && (
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="trangThai" 
                      name="trangThai"
                      checked={state.newKhuyenMai.trangThai === 1}
                      onChange={(e) => {
                        console.log('Checkbox changed:', e.target.checked);
                        setState(prev => ({
                          ...prev,
                          newKhuyenMai: { 
                            ...prev.newKhuyenMai, 
                            trangThai: e.target.checked ? 1 : 0 
                          }
                        }));
                      }}
                      disabled={!isEditMode}
                      style={{
                        width: 'auto',
                        marginRight: 8,
                      }}
                    />
                    <label htmlFor="trangThai" style={{ fontSize: 15, color: '#333' }}>
                      Còn hiệu lực
                    </label>
                  </div>
                )}

                {state.showEditModal && state.currentKhuyenMai && (
                  <div className="user-info-section">
                    <h3>Thông tin bổ sung</h3>
                    <p><strong>ID:</strong> {state.currentKhuyenMai.id}</p>
                    <p><strong>Số lần đã sử dụng:</strong> {state.currentKhuyenMai.soLanDaDung}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span 
                        style={{ 
                          color: getStatusColor(state.currentKhuyenMai.trangThai),
                          fontWeight: 'bold',
                          marginLeft: '8px'
                        }}
                      >
                        {getStatusText(state.currentKhuyenMai.trangThai)}
                      </span>
                    </p>
                    <p><strong>Loại giảm:</strong> {getTypeText(state.currentKhuyenMai.loaiGiamGia)}</p>
                    <p><strong>Giá trị:</strong> {
                      state.currentKhuyenMai.loaiGiamGia === 'phan_tram' 
                        ? `${state.currentKhuyenMai.giaTriGiam}%`
                        : formatPrice(state.currentKhuyenMai.giaTriGiam)
                    }</p>
                    <p><strong>Thời gian:</strong> {formatDate(state.currentKhuyenMai.ngayBatDau)} - {formatDate(state.currentKhuyenMai.ngayKetThuc)}</p>
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCloseModals}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontSize: 15,
                      fontWeight: 600,
                      marginRight: 10,
                    }}
                  >
                    Hủy bỏ
                  </button>
                  {(state.showAddModal || isEditMode) && (
                    <button 
                      type="submit" 
                      className="btn-save"
                      style={{
                        background: '#1890ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {state.showAddModal ? 'Tạo khuyến mãi' : 'Cập nhật'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {state.showDeleteModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseModals}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: 15, color: '#333', marginBottom: 10 }}>
                Bạn có chắc chắn muốn xóa khuyến mãi <strong>{state.currentKhuyenMai?.ten}</strong>?
              </p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
                <i className="fas fa-exclamation-triangle"></i> Lưu ý: Hành động này không thể hoàn tác!
              </p>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={handleCloseModals}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 15,
                    fontWeight: 600,
                    marginRight: 10,
                  }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="button" 
                  className="btn-delete"
                  onClick={handleDeleteKhuyenMai}
                  style={{
                    background: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingManagement;