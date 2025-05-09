import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin.css';
import axios from 'axios';

// Khai báo kiểu dữ liệu cho người dùng
interface User {
  id: number;
  email: string;
  ho: string;
  ten: string;
  soDienThoai: string;
  vaiTro: string;
  trangThai: boolean;
  ngayTao: string;
  ngayCapNhat: string;
}

// Khai báo kiểu dữ liệu cho màn hình
interface UsersScreenState {
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedRole: string;
  selectedStatus: string;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: string;
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  currentUser: User | null;
  newUser: User;
}

const UserManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Thiết lập trạng thái cho màn hình
  const [state, setState] = useState<UsersScreenState>({
    users: [],
    filteredUsers: [],
    isLoading: true,
    error: null,
    searchTerm: '',
    selectedRole: '',
    selectedStatus: '',
    currentPage: 1,
    itemsPerPage: 10,
    sortField: 'id',
    sortDirection: 'asc',
    showAddModal: false,
    showEditModal: false,
    showDeleteModal: false,
    currentUser: null,
    newUser: {
      id: 0,
      email: '',
      ho: '',
      ten: '',
      soDienThoai: '',
      vaiTro: 'khach_hang',
      trangThai: true,
      ngayTao: '',
      ngayCapNhat: ''
    }
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

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    fetchUsers();
  }, []);

  // API call để lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      console.log("Using token:", token);
      
      const response = await fetch('http://localhost:8080/api/v1/nguoi-dung', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'omit' // Thay đổi từ 'include' thành 'omit'
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Không thể tải danh sách người dùng: ${response.status} - ${text}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      
      setState(prev => ({ 
        ...prev, 
        users: data, 
        filteredUsers: data,
        isLoading: false 
      }));
    } catch (error) {
      console.error("API call error:", error);
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
    filterUsers(searchTerm, state.selectedRole, state.selectedStatus);
  };

  // Xử lý thay đổi lọc theo vai trò
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setState(prev => ({ ...prev, selectedRole }));
    filterUsers(state.searchTerm, selectedRole, state.selectedStatus);
  };

  // Xử lý thay đổi lọc theo trạng thái
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value;
    setState(prev => ({ ...prev, selectedStatus }));
    filterUsers(state.searchTerm, state.selectedRole, selectedStatus);
  };

  // Lọc danh sách người dùng theo các tiêu chí
  const filterUsers = (search: string, role: string, status: string) => {
    let filtered = state.users;
    
    // Lọc theo từ khóa tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        `${user.ho} ${user.ten}`.toLowerCase().includes(searchLower) ||
        user.soDienThoai?.toLowerCase().includes(searchLower)
      );
    }
    
    // Lọc theo vai trò
    if (role) {
      filtered = filtered.filter(user => user.vaiTro === role);
    }
    
    // Lọc theo trạng thái
    if (status !== '') {
      const isActive = status === 'active';
      filtered = filtered.filter(user => user.trangThai === isActive);
    }
    
    setState(prev => ({ 
      ...prev, 
      filteredUsers: filtered,
      currentPage: 1 // Reset về trang đầu tiên khi lọc
    }));
  };

  // Sắp xếp danh sách người dùng
  const handleSort = (field: string) => {
    const newDirection = state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    
    const sortedUsers = [...state.filteredUsers].sort((a, b) => {
      const valueA = a[field as keyof User];
      const valueB = b[field as keyof User];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return newDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return newDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return newDirection === 'asc'
          ? valueA === valueB ? 0 : valueA ? 1 : -1
          : valueA === valueB ? 0 : valueA ? -1 : 1;
      }
      
      return 0;
    });
    
    setState(prev => ({ 
      ...prev, 
      filteredUsers: sortedUsers,
      sortField: field,
      sortDirection: newDirection
    }));
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Tổng số trang
  const totalPages = Math.ceil(state.filteredUsers.length / state.itemsPerPage);
  
  // Lấy danh sách người dùng của trang hiện tại
  const currentUsers = state.filteredUsers.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  // Xử lý hiển thị modal thêm người dùng
  const handleShowAddModal = () => {
    setState(prev => ({ 
      ...prev, 
      showAddModal: true,
      newUser: {
        id: 0,
        email: '',
        ho: '',
        ten: '',
        soDienThoai: '',
        vaiTro: 'khach_hang',
        trangThai: true,
        ngayTao: '',
        ngayCapNhat: ''
      }
    }));
  };

  // Xử lý đóng modal thêm người dùng
  const handleCloseAddModal = () => {
    setState(prev => ({ ...prev, showAddModal: false }));
  };

  // Xử lý thay đổi thông tin người dùng mới
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setState(prev => ({
      ...prev,
      newUser: {
        ...prev.newUser,
        [name]: finalValue
      }
    }));
  };

  // Xử lý thêm người dùng mới
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/v1/nguoi-dung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.newUser)
      });
      
      if (!response.ok) {
        throw new Error('Không thể thêm người dùng');
      }
      
      await fetchUsers();
      setState(prev => ({ ...prev, showAddModal: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý hiển thị modal chỉnh sửa người dùng
  const handleShowEditModal = (user: User) => {
    setState(prev => ({ 
      ...prev, 
      showEditModal: true,
      currentUser: { ...user }
    }));
  };

  // Xử lý đóng modal chỉnh sửa người dùng
  const handleCloseEditModal = () => {
    setState(prev => ({ ...prev, showEditModal: false }));
  };

  // Xử lý thay đổi thông tin người dùng đang chỉnh sửa
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!state.currentUser) return;
    
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser!,
        [name]: finalValue
      }
    }));
  };

  // Xử lý cập nhật người dùng
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentUser) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`/api/v1/nguoi-dung/${state.currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.currentUser)
      });
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật người dùng');
      }
      
      await fetchUsers();
      setState(prev => ({ ...prev, showEditModal: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý hiển thị modal xóa người dùng
  const handleShowDeleteModal = (user: User) => {
    setState(prev => ({ 
      ...prev, 
      showDeleteModal: true,
      currentUser: user
    }));
  };

  // Xử lý đóng modal xóa người dùng
  const handleCloseDeleteModal = () => {
    setState(prev => ({ ...prev, showDeleteModal: false }));
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    if (!state.currentUser) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`/api/v1/nguoi-dung/${state.currentUser.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa người dùng');
      }
      
      await fetchUsers();
      setState(prev => ({ ...prev, showDeleteModal: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Hiển thị vai trò người dùng
  const renderRole = (role: string) => {
    switch (role) {
      case 'quan_tri':
        return <span className="role admin">Quản trị</span>;
      case 'ban_hang':
        return <span className="role sales">Bán hàng</span>;
      case 'ho_tro':
        return <span className="role support">Hỗ trợ</span>;
      default:
        return <span className="role customer">Khách hàng</span>;
    }
  };

  // Hiển thị trạng thái người dùng
  const renderStatus = (status: boolean) => {
    return status 
      ? <span className="status active">Hoạt động</span>
      : <span className="status inactive">Không hoạt động</span>;
  };

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
                <a href="/admin/users" className="admin-nav-item active">
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
                <a href="/admin/orders" className="admin-nav-item">
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
              <span className="admin-section-icon"><i className="fas fa-users"></i></span>
              Quản lý người dùng
            </h2>
            
            {/* Thanh công cụ và bộ lọc */}
            <div className="admin-toolbar">
              <div className="admin-search">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm người dùng" 
                  value={state.searchTerm}
                  onChange={handleSearchChange}
                />
                <i className="fas fa-search"></i>
              </div>
              
              <div className="admin-filters">
                <select 
                  value={state.selectedRole} 
                  onChange={handleRoleFilterChange}
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="khach_hang">Khách hàng</option>
                  <option value="quan_tri">Quản trị</option>
                  <option value="ban_hang">Bán hàng</option>
                  <option value="ho_tro">Hỗ trợ</option>
                </select>
                
                <select 
                  value={state.selectedStatus} 
                  onChange={handleStatusFilterChange}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
                
                <button 
                  className="btn-add" 
                  onClick={handleShowAddModal}
                >
                  <i className="fas fa-plus"></i> Thêm mới
                </button>
              </div>
            </div>
            
            {/* Bảng danh sách người dùng */}
            {state.isLoading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i> Đang tải...
              </div>
            ) : state.error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {state.error}
              </div>
            ) : (
              <>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('id')}>
                          ID 
                          {state.sortField === 'id' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th onClick={() => handleSort('email')}>
                          Email
                          {state.sortField === 'email' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th onClick={() => handleSort('ten')}>
                          Họ và tên
                          {state.sortField === 'ten' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th onClick={() => handleSort('soDienThoai')}>
                          Số điện thoại
                          {state.sortField === 'soDienThoai' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th onClick={() => handleSort('vaiTro')}>
                          Vai trò
                          {state.sortField === 'vaiTro' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th onClick={() => handleSort('trangThai')}>
                          Trạng thái
                          {state.sortField === 'trangThai' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th onClick={() => handleSort('ngayTao')}>
                          Ngày đăng ký
                          {state.sortField === 'ngayTao' && (
                            <i className={`fas fa-sort-${state.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="no-data">Không có dữ liệu</td>
                        </tr>
                      ) : (
                        currentUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{`${user.ho} ${user.ten}`}</td>
                            <td>{user.soDienThoai || "—"}</td>
                            <td>{renderRole(user.vaiTro)}</td>
                            <td>{renderStatus(user.trangThai)}</td>
                            <td>{new Date(user.ngayTao).toLocaleDateString('vi-VN')}</td>
                            <td className="action-buttons">
                              <button 
                                className="btn-view" 
                                title="Xem chi tiết"
                                onClick={() => handleShowEditModal(user)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn-edit" 
                                title="Chỉnh sửa"
                                onClick={() => handleShowEditModal(user)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn-delete" 
                                title="Xóa"
                                onClick={() => handleShowDeleteModal(user)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="admin-pagination">
                    <button 
                      onClick={() => handlePageChange(1)}
                      disabled={state.currentPage === 1}
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button 
                      onClick={() => handlePageChange(state.currentPage - 1)}
                      disabled={state.currentPage === 1}
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    
                    <span className="page-info">
                      Trang {state.currentPage} / {totalPages}
                    </span>
                    
                    <button 
                      onClick={() => handlePageChange(state.currentPage + 1)}
                      disabled={state.currentPage === totalPages}
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button 
                      onClick={() => handlePageChange(totalPages)}
                      disabled={state.currentPage === totalPages}
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Modal thêm người dùng */}
      {state.showAddModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Thêm người dùng mới</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseAddModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={state.newUser.email}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ho">Họ <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="ho" 
                      name="ho"
                      value={state.newUser.ho}
                      onChange={handleNewUserChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="ten">Tên <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="ten" 
                      name="ten"
                      value={state.newUser.ten}
                      onChange={handleNewUserChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="soDienThoai">Số điện thoại</label>
                    <input 
                      type="tel" 
                      id="soDienThoai" 
                      name="soDienThoai"
                      value={state.newUser.soDienThoai}
                      onChange={handleNewUserChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="vaiTro">Vai trò <span className="required">*</span></label>
                    <select 
                      id="vaiTro" 
                      name="vaiTro"
                      value={state.newUser.vaiTro}
                      onChange={handleNewUserChange}
                    >
                      <option value="khach_hang">Khách hàng</option>
                      <option value="quan_tri">Quản trị</option>
                      <option value="ban_hang">Bán hàng</option>
                      <option value="ho_tro">Hỗ trợ</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="matKhau">Mật khẩu <span className="required">*</span></label>
                  <input 
                    type="password" 
                    id="matKhau" 
                    name="matKhau"
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="trangThai" 
                    name="trangThai"
                    checked={state.newUser.trangThai}
                    onChange={handleNewUserChange}
                  />
                  <label htmlFor="trangThai">Hoạt động</label>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCloseAddModal}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save"
                  >
                    Thêm người dùng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal chỉnh sửa người dùng */}
      {state.showEditModal && state.currentUser && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Chỉnh sửa người dùng</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseEditModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleUpdateUser}>
                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input 
                    type="email" 
                    id="edit-email" 
                    name="email"
                    value={state.currentUser.email}
                    onChange={handleEditUserChange}
                    readOnly
                  />
                  <small>Email không thể thay đổi</small>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-ho">Họ <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="edit-ho" 
                      name="ho"
                      value={state.currentUser.ho}
                      onChange={handleEditUserChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-ten">Tên <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="edit-ten" 
                      name="ten"
                      value={state.currentUser.ten}
                      onChange={handleEditUserChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-soDienThoai">Số điện thoại</label>
                    <input 
                      type="tel" 
                      id="edit-soDienThoai" 
                      name="soDienThoai"
                      value={state.currentUser.soDienThoai || ''}
                      onChange={handleEditUserChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-vaiTro">Vai trò <span className="required">*</span></label>
                    <select 
                      id="edit-vaiTro" 
                      name="vaiTro"
                      value={state.currentUser.vaiTro}
                      onChange={handleEditUserChange}
                    >
                      <option value="khach_hang">Khách hàng</option>
                      <option value="quan_tri">Quản trị</option>
                      <option value="ban_hang">Bán hàng</option>
                      <option value="ho_tro">Hỗ trợ</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-matKhau">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    id="edit-matKhau" 
                    name="matKhau"
                    onChange={handleEditUserChange}
                  />
                  <small>Để trống nếu không muốn thay đổi mật khẩu</small>
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="edit-trangThai" 
                    name="trangThai"
                    checked={state.currentUser.trangThai}
                    onChange={handleEditUserChange}
                  />
                  <label htmlFor="edit-trangThai">Hoạt động</label>
                </div>
                
                <div className="user-info-section">
                  <h3>Thông tin bổ sung</h3>
                  <p>
                    <strong>ID:</strong> {state.currentUser.id}
                  </p>
                  <p>
                    <strong>Ngày đăng ký:</strong> {new Date(state.currentUser.ngayTao).toLocaleString('vi-VN')}
                  </p>
                  <p>
                    <strong>Cập nhật lần cuối:</strong> {new Date(state.currentUser.ngayCapNhat).toLocaleString('vi-VN')}
                  </p>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCloseEditModal}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal xóa người dùng */}
      {state.showDeleteModal && state.currentUser && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseDeleteModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="confirm-message">
                Bạn có chắc chắn muốn xóa người dùng <strong>{state.currentUser.ho} {state.currentUser.ten}</strong> ({state.currentUser.email})?
              </p>
              <p className="warning-message">
                <i className="fas fa-exclamation-triangle"></i> Lưu ý: Hành động này không thể hoàn tác!
              </p>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={handleCloseDeleteModal}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="button" 
                  className="btn-delete"
                  onClick={handleDeleteUser}
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

export default UserManagement;