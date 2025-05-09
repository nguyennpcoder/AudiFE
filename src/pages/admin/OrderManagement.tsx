import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin.css';

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

// Khai báo kiểu dữ liệu cho màn hình
interface OrdersScreenState {
  donHangList: DonHang[];
  filteredOrders: DonHang[];
  hoSoTraGopList: HoSoTraGop[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTrangThai: string;
  selectedDaiLy: string;
  selectedMonth: string;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: string;
  showViewModal: boolean;
  showDeleteModal: boolean;
  showUpdateModal: boolean;
  showHoSoModal: boolean;
  currentOrder: DonHang | null;
  currentHoSo: HoSoTraGop | null;
}

const OrderManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Thiết lập trạng thái cho màn hình
  const [state, setState] = useState<OrdersScreenState>({
    donHangList: [],
    filteredOrders: [],
    hoSoTraGopList: [],
    isLoading: true,
    error: null,
    searchTerm: '',
    selectedTrangThai: '',
    selectedDaiLy: '',
    selectedMonth: '',
    currentPage: 1,
    itemsPerPage: 10,
    sortField: 'ngayDat',
    sortDirection: 'desc',
    showViewModal: false,
    showDeleteModal: false,
    showUpdateModal: false,
    showHoSoModal: false,
    currentOrder: null,
    currentHoSo: null
  });
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Lấy chữ cái đầu làm avatar
  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0);
    }
    return 'A';
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Lấy danh sách đơn hàng từ API
  useEffect(() => {
    fetchOrders();
  }, []);

  // API call để lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
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
      
      const data = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        donHangList: data,
        filteredOrders: data,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // API call để lấy danh sách hồ sơ trả góp
  const fetchHoSoTraGop = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/tra-gop', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải danh sách hồ sơ trả góp: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        hoSoTraGopList: data.content || data,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Lấy hồ sơ trả góp của đơn hàng
  const fetchHoSoTraGopByDonHang = async (idDonHang: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
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
        setState(prev => ({ 
          ...prev, 
          currentHoSo: data[0],
          showHoSoModal: true,
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          currentHoSo: null,
          isLoading: false 
        }));
        alert("Đơn hàng này chưa có hồ sơ trả góp");
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // API call để cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (idDonHang: number, trangThai: string) => {
    if (!state.currentOrder) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const updatedOrder = {
        ...state.currentOrder,
        trangThai: trangThai
      };
      
      const response = await fetch(`http://localhost:8080/api/v1/don-hang/${idDonHang}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedOrder)
      });
      
      if (!response.ok) {
        throw new Error(`Không thể cập nhật trạng thái đơn hàng: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cập nhật lại danh sách đơn hàng
      await fetchOrders();
      
      setState(prev => ({ 
        ...prev, 
        currentOrder: data,
        showUpdateModal: false,
        isLoading: false 
      }));
      
      alert("Cập nhật trạng thái đơn hàng thành công");
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // API call để xóa đơn hàng
  const deleteOrder = async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
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
      
      // Cập nhật lại danh sách đơn hàng
      await fetchOrders();
      
      setState(prev => ({ 
        ...prev, 
        showDeleteModal: false,
        isLoading: false 
      }));
      
      alert("Xóa đơn hàng thành công");
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý thay đổi trường tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setState(prev => ({ ...prev, searchTerm }));
    filterOrders(searchTerm, state.selectedTrangThai, state.selectedDaiLy, state.selectedMonth);
  };

  // Xử lý thay đổi lọc theo trạng thái
  const handleTrangThaiFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTrangThai = e.target.value;
    setState(prev => ({ ...prev, selectedTrangThai }));
    filterOrders(state.searchTerm, selectedTrangThai, state.selectedDaiLy, state.selectedMonth);
  };

  // Xử lý thay đổi lọc theo đại lý
  const handleDaiLyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDaiLy = e.target.value;
    setState(prev => ({ ...prev, selectedDaiLy }));
    filterOrders(state.searchTerm, state.selectedTrangThai, selectedDaiLy, state.selectedMonth);
  };

  // Xử lý thay đổi lọc theo tháng
  const handleMonthFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value;
    setState(prev => ({ ...prev, selectedMonth }));
    filterOrders(state.searchTerm, state.selectedTrangThai, state.selectedDaiLy, selectedMonth);
  };

  // Lọc danh sách đơn hàng theo các tiêu chí
  const filterOrders = (search: string, trangThai: string, daiLy: string, month: string) => {
    let filtered = state.donHangList;
    
    // Lọc theo từ khóa tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(order => 
        order.tenNguoiDung.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower) ||
        order.tenDaiLy.toLowerCase().includes(searchLower)
      );
    }
    
    // Lọc theo trạng thái
    if (trangThai) {
      filtered = filtered.filter(order => order.trangThai === trangThai);
    }
    
    // Lọc theo đại lý
    if (daiLy) {
      filtered = filtered.filter(order => order.idDaiLy.toString() === daiLy);
    }
    
    // Lọc theo tháng
    if (month) {
      const [year, monthNum] = month.split('-');
      filtered = filtered.filter(order => {
        if (!order.ngayDat) return false;
        const orderDate = new Date(order.ngayDat);
        return orderDate.getFullYear().toString() === year && 
              (orderDate.getMonth() + 1).toString().padStart(2, '0') === monthNum;
      });
    }
    
    setState(prev => ({ 
      ...prev, 
      filteredOrders: filtered,
      currentPage: 1 // Reset về trang đầu tiên khi lọc
    }));
  };

  // Sắp xếp danh sách đơn hàng
  const handleSort = (field: string) => {
    const newDirection = state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    
    const sortedOrders = [...state.filteredOrders].sort((a, b) => {
      const valueA = a[field as keyof DonHang];
      const valueB = b[field as keyof DonHang];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return newDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return newDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (field === 'ngayDat') {
        const dateA = valueA ? new Date(valueA as string).getTime() : 0;
        const dateB = valueB ? new Date(valueB as string).getTime() : 0;
        return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      return 0;
    });
    
    setState(prev => ({ 
      ...prev, 
      filteredOrders: sortedOrders,
      sortField: field,
      sortDirection: newDirection
    }));
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Tổng số trang
  const totalPages = Math.ceil(state.filteredOrders.length / state.itemsPerPage);
  
  // Lấy danh sách đơn hàng của trang hiện tại
  const currentOrders = state.filteredOrders.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  // Xử lý hiển thị modal xem chi tiết đơn hàng
  const handleShowViewModal = (order: DonHang) => {
    setState(prev => ({ 
      ...prev, 
      showViewModal: true,
      currentOrder: order
    }));
  };

  // Xử lý đóng modal xem chi tiết
  const handleCloseViewModal = () => {
    setState(prev => ({ ...prev, showViewModal: false }));
  };

  // Xử lý hiển thị modal cập nhật trạng thái
  const handleShowUpdateModal = (order: DonHang) => {
    setState(prev => ({ 
      ...prev, 
      showUpdateModal: true,
      currentOrder: order
    }));
  };

  // Xử lý đóng modal cập nhật trạng thái
  const handleCloseUpdateModal = () => {
    setState(prev => ({ ...prev, showUpdateModal: false }));
  };

  // Xử lý hiển thị modal xóa đơn hàng
  const handleShowDeleteModal = (order: DonHang) => {
    setState(prev => ({ 
      ...prev, 
      showDeleteModal: true,
      currentOrder: order
    }));
  };

  // Xử lý đóng modal xóa đơn hàng
  const handleCloseDeleteModal = () => {
    setState(prev => ({ ...prev, showDeleteModal: false }));
  };

  // Xử lý đóng modal hồ sơ trả góp
  const handleCloseHoSoModal = () => {
    setState(prev => ({ ...prev, showHoSoModal: false }));
  };

  // Hiển thị trạng thái đơn hàng
  const renderOrderStatus = (status: string) => {
    switch (status) {
      case 'cho_xu_ly':
        return <span className="status cho_xu_ly">Chờ xử lý</span>;
      case 'dang_xu_ly':
        return <span className="status dang_xu_ly">Đang xử lý</span>;
      case 'da_thanh_toan':
        return <span className="status da_thanh_toan">Đã thanh toán</span>;
      case 'da_huy':
        return <span className="status da_huy">Đã hủy</span>;
      case 'da_giao':
        return <span className="status da_giao">Đã giao</span>;
      case 'da_dat_coc':
        return <span className="status da_dat_coc">Đã đặt cọc</span>;
      case 'san_sang_giao':
        return <span className="status san_sang_giao">Sẵn sàng giao</span>;
      default:
        return <span className="status">{status}</span>;
    }
  };

  // Hiển thị trạng thái hồ sơ trả góp
  const renderHoSoStatus = (status: string) => {
    switch (status) {
      case 'dang_xu_ly':
        return <span className="status pending">Đang xử lý</span>;
      case 'da_phe_duyet':
        return <span className="status completed">Đã phê duyệt</span>;
      case 'da_tu_choi':
        return <span className="status cancelled">Đã từ chối</span>;
      case 'hoan_thanh':
        return <span className="status delivered">Hoàn thành</span>;
      default:
        return <span className="status">{status}</span>;
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

  // Danh sách đại lý (có thể lấy từ API)
  const daiLyList = Array.from(new Set(state.donHangList.map(order => order.idDaiLy)))
    .map(idDaiLy => {
      const daiLy = state.donHangList.find(order => order.idDaiLy === idDaiLy);
      return {
        id: idDaiLy,
        ten: daiLy ? daiLy.tenDaiLy : `Đại lý ${idDaiLy}`
      };
    });

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-logo">
          <button 
            className="admin-toggle-menu" 
            onClick={toggleSidebar} 
            aria-label="Toggle sidebar"
            title="Ẩn/Hiện menu"
          >
            <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-times'}`}></i>
          </button>
          <h1>Audi Management System</h1>
        </div>
        
        <div className="admin-user-dropdown">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {getInitials()}
            </div>
            <span>Xin chào, {user?.fullName || 'Admin'}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', opacity: 0.7 }}></i>
          </div>
          
          <div className="admin-user-dropdown-content">
            <a href="#profile" className="admin-user-menu-item">
              <i className="fas fa-user"></i>
              <span>Hồ sơ cá nhân</span>
            </a>
            <a href="#settings" className="admin-user-menu-item">
              <i className="fas fa-cog"></i>
              <span>Cài đặt</span>
            </a>
            <button onClick={handleLogout} className="admin-user-menu-item logout">
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="admin-content">
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="admin-nav">
            <ul>
              <li>
                <a href="/admin/dashboard" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-tachometer-alt"></i></span>
                  <span className="admin-nav-text">Tổng quan</span>
                </a>
              </li>
              <li>
                <a href="/admin/users" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-users"></i></span>
                  <span className="admin-nav-text">Quản lý người dùng</span>
                </a>
              </li>
              <li>
                <a href="/admin/products" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-car"></i></span>
                  <span className="admin-nav-text">Quản lý sản phẩm</span>
                </a>
              </li>
              <li>
                <a href="/admin/orders" className="admin-nav-item active">
                  <span className="admin-nav-icon"><i className="fas fa-shopping-cart"></i></span>
                  <span className="admin-nav-text">Quản lý đơn hàng</span>
                </a>
              </li>
              <li>
                <a href="/admin/dealers" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-store"></i></span>
                  <span className="admin-nav-text">Quản lý đại lý</span>
                </a>
              </li>
              <li>
                <a href="/admin/inventory" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-warehouse"></i></span>
                  <span className="admin-nav-text">Quản lý tồn kho</span>
                </a>
              </li>
              <li>
                <a href="/admin/marketing" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-bullhorn"></i></span>
                  <span className="admin-nav-text">Quản lý marketing</span>
                </a>
              </li>
              <li>
                <a href="/admin/blog" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-newspaper"></i></span>
                  <span className="admin-nav-text">Quản lý bài viết</span>
                </a>
              </li>
              <li>
                <a href="/admin/support" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-headset"></i></span>
                  <span className="admin-nav-text">Quản lý hỗ trợ</span>
                </a>
              </li>
              <li>
                <a href="/admin/settings" className="admin-nav-item">
                  <span className="admin-nav-icon"><i className="fas fa-cog"></i></span>
                  <span className="admin-nav-text">Cài đặt hệ thống</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-main">
          <div className="admin-section">
            <h2>
              <span className="admin-section-icon"><i className="fas fa-shopping-cart"></i></span>
              Quản lý đơn hàng
            </h2>
            
            {/* Thanh công cụ và bộ lọc */}
            <div className="admin-toolbar">
              <div className="admin-search">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm đơn hàng" 
                  value={state.searchTerm}
                  onChange={handleSearchChange}
                />
                <i className="fas fa-search"></i>
              </div>
              
              <div className="admin-filters">
                <select 
                  value={state.selectedTrangThai} 
                  onChange={handleTrangThaiFilterChange}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="cho_xu_ly">Chờ xử lý</option>
                  <option value="dang_xu_ly">Đang xử lý</option>
                  <option value="da_thanh_toan">Đã thanh toán</option>
                  <option value="da_giao">Đã giao</option>
                  <option value="da_huy">Đã hủy</option>
                </select>
                
                <select 
                  value={state.selectedDaiLy} 
                  onChange={handleDaiLyFilterChange}
                >
                  <option value="">Tất cả đại lý</option>
                  {daiLyList.map(daiLy => (
                    <option key={daiLy.id} value={daiLy.id.toString()}>
                      {daiLy.ten}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={state.selectedMonth} 
                  onChange={handleMonthFilterChange}
                >
                  <option value="">Tất cả thời gian</option>
                  <option value="2023-12">Tháng 12/2023</option>
                  <option value="2024-01">Tháng 01/2024</option>
                  <option value="2024-02">Tháng 02/2024</option>
                  <option value="2024-03">Tháng 03/2024</option>
                  <option value="2024-04">Tháng 04/2024</option>
                  <option value="2024-05">Tháng 05/2024</option>
                </select>
              </div>
            </div>
            
            {/* Bảng danh sách đơn hàng */}
            {state.isLoading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i> Đang tải...
              </div>
            ) : state.error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {state.error}
              </div>
            ) : state.filteredOrders.length === 0 ? (
              <div className="no-data">
                <i className="fas fa-inbox"></i>
                <p>Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('id')}>
                        Mã đơn hàng
                        {state.sortField === 'id' && (
                          <i className={`fas fa-chevron-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('tenNguoiDung')}>
                        Khách hàng
                        {state.sortField === 'tenNguoiDung' && (
                          <i className={`fas fa-chevron-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('tenDaiLy')}>
                        Đại lý
                        {state.sortField === 'tenDaiLy' && (
                          <i className={`fas fa-chevron-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('ngayDat')}>
                        Ngày đặt
                        {state.sortField === 'ngayDat' && (
                          <i className={`fas fa-chevron-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('tongTien')}>
                        Tổng tiền
                        {state.sortField === 'tongTien' && (
                          <i className={`fas fa-chevron-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('trangThai')}>
                        Trạng thái
                        {state.sortField === 'trangThai' && (
                          <i className={`fas fa-chevron-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.tenNguoiDung}</td>
                        <td>{order.tenDaiLy}</td>
                        <td>{formatDate(order.ngayDat)}</td>
                        <td>{formatPrice(order.tongTien)}</td>
                        <td>{renderOrderStatus(order.trangThai)}</td>
                        <td>
                          <div className="admin-action-buttons">
                            <button 
                              onClick={() => handleShowViewModal(order)} 
                              className="admin-action-btn view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              onClick={() => handleShowUpdateModal(order)} 
                              className="admin-action-btn edit"
                              title="Cập nhật trạng thái"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {order.phuongThucThanhToan === 'tra_gop' && (
                              <button 
                                onClick={() => fetchHoSoTraGopByDonHang(order.id)} 
                                className="admin-action-btn loan"
                                title="Xem hồ sơ trả góp"
                              >
                                <i className="fas fa-file-invoice-dollar"></i>
                              </button>
                            )}
                            <button 
                              onClick={() => handleShowDeleteModal(order)} 
                              className="admin-action-btn delete"
                              title="Xóa đơn hàng"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Phân trang */}
            {!state.isLoading && state.filteredOrders.length > 0 && (
              <div className="admin-pagination">
                <button 
                  className="admin-pagination-btn"
                  disabled={state.currentPage === 1}
                  onClick={() => handlePageChange(state.currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => (
                    page === 1 || 
                    page === totalPages || 
                    (page >= state.currentPage - 1 && page <= state.currentPage + 1)
                  ))
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="admin-pagination-ellipsis">...</span>
                      )}
                      <button 
                        className={`admin-pagination-btn ${state.currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button 
                  className="admin-pagination-btn"
                  disabled={state.currentPage === totalPages}
                  onClick={() => handlePageChange(state.currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Modal xem chi tiết đơn hàng */}
      {state.showViewModal && state.currentOrder && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Chi tiết đơn hàng {state.currentOrder.id}</h3>
              <button 
                className="admin-modal-close" 
                onClick={handleCloseViewModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-order-details">
                <div className="admin-order-info">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="admin-order-info-grid">
                    <div>
                      <p><strong>Khách hàng:</strong> {state.currentOrder.tenNguoiDung}</p>
                      <p><strong>Đại lý:</strong> {state.currentOrder.tenDaiLy}</p>
                      <p><strong>Ngày đặt:</strong> {formatDate(state.currentOrder.ngayDat)}</p>
                      <p><strong>Ngày giao dự kiến:</strong> {formatDate(state.currentOrder.ngayGiaoDuKien)}</p>
                      {state.currentOrder.ngayGiaoThucTe && (
                        <p><strong>Ngày giao thực tế:</strong> {formatDate(state.currentOrder.ngayGiaoThucTe)}</p>
                      )}
                    </div>
                    <div>
                      <p><strong>Trạng thái:</strong> {renderOrderStatus(state.currentOrder.trangThai)}</p>
                      <p><strong>Phương thức thanh toán:</strong> {
                        state.currentOrder.phuongThucThanhToan === 'tra_gop' 
                          ? 'Trả góp' 
                          : state.currentOrder.phuongThucThanhToan === 'chuyen_khoan' 
                            ? 'Chuyển khoản' 
                            : 'Tiền mặt'
                      }</p>
                      <p><strong>Tổng tiền:</strong> {formatPrice(state.currentOrder.tongTien)}</p>
                      {state.currentOrder.tenKhuyenMai && (
                        <p><strong>Khuyến mãi:</strong> {state.currentOrder.tenKhuyenMai} ({formatPrice(state.currentOrder.tienGiam || 0)})</p>
                      )}
                    </div>
                  </div>
                  {state.currentOrder.ghiChu && (
                    <div className="admin-order-note">
                      <p><strong>Ghi chú:</strong> {state.currentOrder.ghiChu}</p>
                    </div>
                  )}
                </div>
                
                <div className="admin-order-items">
                  <h4>Chi tiết sản phẩm</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Màu sắc</th>
                        <th>Nội thất</th>
                        <th>Options</th>
                        <th>Số lượng</th>
                        <th>Giá bán</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.currentOrder.chiTietDonHangDTOs.map(item => (
                        <tr key={item.id}>
                          <td>{item.tenMauXe}</td>
                          <td>{item.mauSac}</td>
                          <td>{item.noiThat}</td>
                          <td>{item.options}</td>
                          <td>{item.soLuong}</td>
                          <td>{formatPrice(item.giaBan)}</td>
                          <td>{formatPrice(item.giaBan * item.soLuong)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={6} className="text-right"><strong>Tổng cộng:</strong></td>
                        <td>{formatPrice(state.currentOrder.tongTien)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal cập nhật trạng thái đơn hàng */}
      {state.showUpdateModal && state.currentOrder && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Cập nhật trạng thái đơn hàng {state.currentOrder.id}</h3>
              <button 
                className="admin-modal-close" 
                onClick={handleCloseUpdateModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-update-status">
                <p>Trạng thái hiện tại: {renderOrderStatus(state.currentOrder.trangThai)}</p>
                <p>Chọn trạng thái mới:</p>
                <div className="admin-status-buttons">
                  <button 
                    className={`admin-status-btn pending ${state.currentOrder.trangThai === 'cho_xu_ly' ? 'active' : ''}`}
                    onClick={() => state.currentOrder && updateOrderStatus(state.currentOrder.id, 'cho_xu_ly')}
                  >
                    Chờ xử lý
                  </button>
                  <button 
                    className={`admin-status-btn in-progress ${state.currentOrder.trangThai === 'dang_xu_ly' ? 'active' : ''}`}
                    onClick={() => state.currentOrder && updateOrderStatus(state.currentOrder.id, 'dang_xu_ly')}
                  >
                    Đang xử lý
                  </button>
                  <button 
                    className={`admin-status-btn completed ${state.currentOrder.trangThai === 'da_thanh_toan' ? 'active' : ''}`}
                    onClick={() => state.currentOrder && updateOrderStatus(state.currentOrder.id, 'da_thanh_toan')}
                  >
                    Đã thanh toán
                  </button>
                  <button 
                    className={`admin-status-btn delivered ${state.currentOrder.trangThai === 'da_giao' ? 'active' : ''}`}
                    onClick={() => state.currentOrder && updateOrderStatus(state.currentOrder.id, 'da_giao')}
                  >
                    Đã giao
                  </button>
                  <button 
                    className={`admin-status-btn cancelled ${state.currentOrder.trangThai === 'da_huy' ? 'active' : ''}`}
                    onClick={() => state.currentOrder && updateOrderStatus(state.currentOrder.id, 'da_huy')}
                  >
                    Đã hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal xóa đơn hàng */}
      {state.showDeleteModal && state.currentOrder && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Xóa đơn hàng</h3>
              <button 
                className="admin-modal-close" 
                onClick={handleCloseDeleteModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-delete-confirm">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Bạn có chắc chắn muốn xóa đơn hàng {state.currentOrder.id}?</p>
                <p>Hành động này không thể hoàn tác.</p>
                <div className="admin-confirm-buttons">
                  <button 
                    className="admin-btn cancel" 
                    onClick={handleCloseDeleteModal}
                  >
                    Hủy
                  </button>
                  <button 
                    className="admin-btn delete" 
                    onClick={() => state.currentOrder && deleteOrder(state.currentOrder.id)}
                  >
                    Xóa đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal xem hồ sơ trả góp */}
      {state.showHoSoModal && state.currentHoSo && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Hồ sơ trả góp {state.currentHoSo.id}</h3>
              <button 
                className="admin-modal-close" 
                onClick={handleCloseHoSoModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-loan-details">
                <div className="admin-loan-info">
                  <h4>Thông tin hồ sơ</h4>
                  <div className="admin-loan-info-grid">
                    <div>
                      <p><strong>Mã đơn hàng:</strong> {state.currentHoSo.idDonHang}</p>
                      <p><strong>Trạng thái:</strong> {renderHoSoStatus(state.currentHoSo.trangThai)}</p>
                      <p><strong>Ngày nộp hồ sơ:</strong> {formatDate(state.currentHoSo.ngayNopHoSo)}</p>
                      {state.currentHoSo.ngayQuyetDinh && (
                        <p><strong>Ngày quyết định:</strong> {formatDate(state.currentHoSo.ngayQuyetDinh)}</p>
                      )}
                      <p><strong>Ngân hàng đối tác:</strong> {state.currentHoSo.nganHangDoiTac}</p>
                    </div>
                    <div>
                      <p><strong>Số tiền vay:</strong> {formatPrice(state.currentHoSo.soTienVay)}</p>
                      <p><strong>Lãi suất:</strong> {state.currentHoSo.laiSuat}%/năm</p>
                      <p><strong>Kỳ hạn:</strong> {state.currentHoSo.kyHanThang} tháng</p>
                      <p><strong>Trả hàng tháng:</strong> {formatPrice(state.currentHoSo.traHangThang)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="admin-loan-customer">
                  <h4>Thông tin người mua hộ</h4>
                  <div className="admin-loan-customer-info">
                    <p><strong>Họ tên:</strong> {state.currentHoSo.nguoiMuaHo}</p>
                    <p><strong>Số điện thoại:</strong> {state.currentHoSo.soDienThoaiNguoiMuaHo}</p>
                    <p><strong>Email:</strong> {state.currentHoSo.emailNguoiMuaHo}</p>
                    <p><strong>Địa chỉ:</strong> {state.currentHoSo.diaChiNguoiMuaHo}</p>
                  </div>
                </div>
                
                {state.currentHoSo.ghiChu && (
                  <div className="admin-loan-note">
                    <h4>Ghi chú</h4>
                    <p>{state.currentHoSo.ghiChu}</p>
                  </div>
                )}
                
                {state.currentHoSo.trangThai === 'da_tu_choi' && state.currentHoSo.lyDoTuChoi && (
                  <div className="admin-loan-rejection">
                    <h4>Lý do từ chối</h4>
                    <p>{state.currentHoSo.lyDoTuChoi}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;