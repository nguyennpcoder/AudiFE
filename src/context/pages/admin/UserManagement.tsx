import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Admin.css';
// import '../../../styles/AdminAnimations.css';
import axios from 'axios';
import { Breadcrumb, message } from 'antd'; // Thêm message vào đây
import { message as antdMessage } from 'antd'; // Thêm antdMessage vào đây

import AdminHeader from './AdminHeader';
import { buildAvatarUrl } from '../../../services/authService';

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
  dia_chi?: string;
  thanh_pho?: string;
  tinh?: string;
  ma_buu_dien?: string;
  quoc_gia?: string;
  matKhau?: string;
  avatarUrl?: string; // Thêm trường avatarUrl
  avatar?: string; // Thêm trường avatar
  anhDaiDien?: string; // Thêm trường anhDaiDien
  anh_dai_dien?: string; // Thêm trường anh_dai_dien
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
  
  // Thêm state cho animation success
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [userAvatarMap, setUserAvatarMap] = useState<Record<number, string>>({});
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [hoveredUserImgPos, setHoveredUserImgPos] = useState<{ x: number; y: number } | null>(null);
  
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
      
      // Map các trường từ camelCase sang snake_case
      const mappedData = data.map((user: any) => ({
        ...user,
        dia_chi: user.diaChi,
        thanh_pho: user.thanhPho,
        tinh: user.tinh,
        ma_buu_dien: user.maBuuDien,
        quoc_gia: user.quocGia,
        avatar: user.avatar || user.anhDaiDien || user.anh_dai_dien || '', // Thêm dòng này!
      }));

      setState(prev => ({ 
        ...prev, 
        users: mappedData, 
        filteredUsers: mappedData.filter((user: User) => user.vaiTro !== 'quan_tri'), // Loại bỏ user admin
        isLoading: false 
      }));
      preloadUserAvatars(mappedData);
    } catch (error) {
      console.error("API call error:", error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  const preloadUserAvatars = async (users: User[]) => {
    const map: Record<number, string> = {};
    for (const user of users) {
      const avatarRaw = user.avatarUrl || user.avatar || user.anhDaiDien || user.anh_dai_dien;
      if (avatarRaw) {
        map[user.id] = buildAvatarUrl(avatarRaw);
      } else {
        // Tạo avatar mặc định (ví dụ dùng dịch vụ avatar online hoặc ảnh local)
        map[user.id] = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.ho + ' ' + user.ten)}&background=0D8ABC&color=fff`;
      }
    }
    setUserAvatarMap(map);
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
    
    // Loại bỏ user có vai trò "quan_tri"
    filtered = filtered.filter(user => user.vaiTro !== 'quan_tri');

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
  
  // Lấy danh sách người dùng của trang hiện tại, loại bỏ admin
  const currentUsers = state.filteredUsers
    .filter(user => user.vaiTro !== 'quan_tri')
    .slice(
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
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault(); // Thêm dòng này để ngăn form submit mặc định
    
    if (!state.currentUser) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Chuẩn bị dữ liệu để gửi lên server
      const userDataToUpdate = {
        id: state.currentUser.id,
        email: state.currentUser.email,
        ho: state.currentUser.ho,
        ten: state.currentUser.ten,
        soDienThoai: state.currentUser.soDienThoai,
        vaiTro: state.currentUser.vaiTro,
        trangThai: state.currentUser.trangThai,
        // Map từ snake_case sang camelCase cho backend
        diaChi: state.currentUser.dia_chi,
        thanhPho: state.currentUser.thanh_pho,
        tinh: state.currentUser.tinh,
        maBuuDien: state.currentUser.ma_buu_dien,
        quocGia: state.currentUser.quoc_gia,
        avatar: state.currentUser.avatar || state.currentUser.avatarUrl || state.currentUser.anhDaiDien || state.currentUser.anh_dai_dien
      };
      
      const response = await fetch(`http://localhost:8080/api/v1/nguoi-dung/${state.currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(userDataToUpdate)
      });
      
      if (response.ok) {
        // Nếu user được mở khóa (từ false sang true), gọi unlock endpoint
        if (state.currentUser.trangThai) {
          try {
            const unlockResponse = await fetch(`http://localhost:8080/api/v1/auth/unlock-user/${state.currentUser.email}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user?.token}`
              }
            });
            
            if (unlockResponse.ok) {
              const unlockData = await unlockResponse.json();
              antdMessage.success(unlockData.message);
            } else {
              const errorData = await unlockResponse.json();
              antdMessage.warning(errorData.message);
            }
          } catch (unlockError) {
            console.error('Error unlocking user:', unlockError);
            antdMessage.warning('Cập nhật thành công nhưng có lỗi khi gửi email password mới');
          }
        }
        
        // Clear user cache after update
        await fetch(`http://localhost:8080/api/v1/auth/clear-cache/${state.currentUser.email}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        
        antdMessage.success('Cập nhật người dùng thành công!');
        
        // Cập nhật user trong danh sách hiện tại
        setState(prev => {
          const updatedUsers = prev.users.map(user => 
            user.id === state.currentUser!.id ? state.currentUser! : user
          );
          
          const updatedFilteredUsers = prev.filteredUsers.map(user => 
            user.id === state.currentUser!.id ? state.currentUser! : user
          );
          
          return {
            ...prev,
            users: updatedUsers,
            filteredUsers: updatedFilteredUsers,
            isLoading: false
          };
        });
        
        // Chuyển sang view mode ngay lập tức
        setIsEditMode(false);
        
      } else {
        const errorData = await response.json();
        antdMessage.error(errorData.message || 'Có lỗi xảy ra khi cập nhật người dùng');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      antdMessage.error('Có lỗi xảy ra khi cập nhật người dùng');
      setState(prev => ({ ...prev, isLoading: false }));
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

  // Tối ưu function unlock user với animation
  const handleUnlockUser = async (userEmail: string) => {
    try {
      // Hiển thị loading ngay lập tức
      const loadingKey = message.loading('Đang mở khóa tài khoản...', 0);
      
      const response = await fetch(`http://localhost:8080/api/v1/auth/unlock-user/${userEmail}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        // Tìm tên người dùng từ danh sách hiện tại
        const targetUser = state.users.find(u => u.email === userEmail);
        const userName = targetUser ? `${targetUser.ho} ${targetUser.ten}` : userEmail;
        
        // Đóng loading
        message.destroy();
        
        // Hiển thị animation success
        setSuccessMessage(`Mở khóa tài khoản thành công!\nĐã gửi mật khẩu mới về Email cho ${userName}`);
        setShowSuccessAnimation(true);
        
        // Ẩn animation sau 5 giây (tăng từ 3 giây)
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setSuccessMessage('');
        }, 5000);
        
        // Refresh user list ngay lập tức mà không cần đợi
        fetchUsers();
      } else {
        const errorData = await response.json();
        message.destroy();
        message.error(errorData.message || 'Có lỗi xảy ra khi mở khóa tài khoản');
      }
    } catch (error) {
      message.destroy();
      console.error('Error unlocking user:', error);
      message.error('Có lỗi xảy ra khi mở khóa tài khoản');
    }
  };

  // Tối ưu function lock user với message thông báo
  const handleLockUser = async (userEmail: string) => {
    try {
      // Hiển thị loading ngay lập tức
      const loadingKey = message.loading('Đang khóa tài khoản...', 0);
      
      const response = await fetch(`http://localhost:8080/api/v1/auth/lock-user/${userEmail}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        // Tìm tên người dùng từ danh sách hiện tại
        const targetUser = state.users.find(u => u.email === userEmail);
        const userName = targetUser ? `${targetUser.ho} ${targetUser.ten}` : userEmail;
        
        // Đóng loading và hiển thị thông báo thành công
        message.destroy();
        message.success(`Đã khóa tài khoản thành công cho ${userName}`);
        
        // Refresh user list ngay lập tức
        fetchUsers();
      } else {
        const errorData = await response.json();
        message.destroy();
        message.error(errorData.message || 'Có lỗi xảy ra khi khóa tài khoản');
      }
    } catch (error) {
      message.destroy();
      console.error('Error locking user:', error);
      message.error('Có lỗi xảy ra khi khóa tài khoản');
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
    <div style={{ 
      background: '#f5f5f5', 
      height: '100vh', // Cố định chiều cao viewport
      overflow: 'hidden', // Không cho scroll
      padding: 0 
    }}>
      <AdminHeader pageTitle="Quản lý người dùng" />
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
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng"
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
              value={state.selectedRole}
              onChange={handleRoleFilterChange}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                color: 'rgb(107, 114, 128)',
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="khach_hang">Khách hàng</option>
              {/* <option value="quan_tri">Quản trị</option> */}
              <option value="ban_hang">Bán hàng</option>
              <option value="ho_tro">Hỗ trợ</option>
            </select>
            <select
              value={state.selectedStatus}
              onChange={handleStatusFilterChange}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                color: 'rgb(107, 114, 128)',
                fontSize: 15,
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
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

          {/* Table Container - Cố định chiều cao */}
          <div style={{ 
            height: 'calc(100vh - 280px)', // Cố định chiều cao cho table
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
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Họ và tên</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Số điện thoại</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Vai trò</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Ngày đăng ký</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ 
                        textAlign: 'center', 
                        padding: '100px 24px', // Giảm padding
                        color: '#888',
                        height: '300px' // Giảm chiều cao
                      }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className="table-row-fadein"
                        style={{
                          animationDelay: `${idx * 120}ms`,
                          background: '#fff',
                          borderBottom: '1px solid #f0f0f0',
                          height: '50px' // Giảm chiều cao row
                        }}
                        onMouseEnter={e => {
                          setHoveredUserId(user.id);
                          setHoveredUserImgPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={e => {
                          setHoveredUserImgPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => {
                          setHoveredUserId(null);
                          setHoveredUserImgPos(null);
                        }}
                      >
                        <td style={{ padding: '10px 8px' }}>{user.id}</td>
                        <td style={{ padding: '10px 8px' }}>{user.email}</td>
                        <td style={{ padding: '10px 8px' }}>{`${user.ho} ${user.ten}`}</td>
                        <td style={{ padding: '10px 8px' }}>{user.soDienThoai || "—"}</td>
                        <td style={{ padding: '10px 8px' }}>{renderRole(user.vaiTro)}</td>
                        <td style={{ padding: '10px 8px' }}>{renderStatus(user.trangThai)}</td>
                        <td style={{ padding: '10px 8px' }}>{new Date(user.ngayTao).toLocaleDateString('vi-VN')}</td>
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
                            <button
                              className="btn-view"
                              title="Xem chi tiết"
                              onClick={() => { setIsEditMode(false); handleShowEditModal(user); }}
                              onMouseEnter={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                              onMouseMove={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                              onMouseLeave={e => {
                                const tr = e.currentTarget.closest('tr');
                                if (tr && tr.matches(':hover')) {
                                  setHoveredUserId(user.id);
                                  setHoveredUserImgPos({ x: e.clientX, y: e.clientY });
                                }
                              }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-edit"
                              title="Chỉnh sửa"
                              onClick={() => { setIsEditMode(true); handleShowEditModal(user); }}
                              onMouseEnter={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                              onMouseMove={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                              onMouseLeave={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {user.trangThai ? (
                              <button
                                className="btn-lock"
                                title="Khóa tài khoản"
                                onClick={() => handleLockUser(user.email)}
                                onMouseEnter={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                                onMouseMove={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                                onMouseLeave={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                                style={{
                                  background: '#ff7875',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  cursor: 'pointer',
                                }}
                              >
                                <i className="fas fa-lock"></i>
                              </button>
                            ) : (
                              <button
                                className="btn-unlock"
                                title="Mở khóa tài khoản"
                                onClick={() => handleUnlockUser(user.email)}
                                onMouseEnter={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                                onMouseMove={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                                onMouseLeave={() => { setHoveredUserId(null); setHoveredUserImgPos(null); }}
                                style={{
                                  background: '#52c41a',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  cursor: 'pointer',
                                }}
                              >
                                <i className="fas fa-unlock"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Thêm các row trống để cố định chiều cao khi data ít */}
                  {currentUsers.length > 0 && currentUsers.length < 10 && 
                    Array.from({ length: 10 - currentUsers.length }).map((_, index) => (
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
          </div>
        </div>
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
                  
                  <div className="form-group">
                    <label htmlFor="ten">Tên <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="ten" 
                      name="ten"
                      value={state.newUser.ten}
                      onChange={handleNewUserChange}
                      required
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
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="soDienThoai">Số điện thoại</label>
                    <input 
                      type="tel" 
                      id="soDienThoai" 
                      name="soDienThoai"
                      value={state.newUser.soDienThoai}
                      onChange={handleNewUserChange}
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
                  
                  <div className="form-group">
                    <label htmlFor="vaiTro">Vai trò <span className="required">*</span></label>
                    <select 
                      id="vaiTro" 
                      name="vaiTro"
                      value={state.newUser.vaiTro}
                      onChange={handleNewUserChange}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                      }}
                    >
                      <option value="khach_hang">Khách hàng</option>
                      <option value="ban_hang">Bán hàng</option>
                      <option value="ho_tro">Hỗ trợ</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCloseAddModal}
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
              <h2>{isEditMode ? 'Chỉnh sửa người dùng' : 'Xem chi tiết người dùng'}</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseEditModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleEditUser}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 24,
                    marginTop: 8
                  }}
                >
                  <img
                    src={buildAvatarUrl(
                      state.currentUser.avatar ||
                      state.currentUser.avatarUrl ||
                      state.currentUser.anhDaiDien ||
                      state.currentUser.anh_dai_dien
                    )}
                    alt="avatar"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #fff',
                      boxShadow: '0 2px 12px 0 rgba(24,144,255,0.10)',
                      marginBottom: 12,
                      background: '#f5f5f5'
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                    {state.currentUser.email}
                  </div>
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
                      readOnly={!isEditMode}
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
                  
                  <div className="form-group">
                    <label htmlFor="edit-ten">Tên <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="edit-ten" 
                      name="ten"
                      value={state.currentUser.ten}
                      onChange={handleEditUserChange}
                      required
                      readOnly={!isEditMode}
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
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-soDienThoai">Số điện thoại</label>
                    <input 
                      type="tel" 
                      id="edit-soDienThoai" 
                      name="soDienThoai"
                      value={state.currentUser.soDienThoai || ''}
                      onChange={handleEditUserChange}
                      readOnly={!isEditMode}
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
                  
                  <div className="form-group">
                    <label htmlFor="edit-vaiTro">Vai trò <span className="required">*</span></label>
                    <select 
                      id="edit-vaiTro" 
                      name="vaiTro"
                      value={state.currentUser.vaiTro}
                      onChange={handleEditUserChange}
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                      }}
                    >
                      <option value="khach_hang">Khách hàng</option>
                      <option value="ban_hang">Bán hàng</option>
                      <option value="ho_tro">Hỗ trợ</option>
                      {state.currentUser.vaiTro === 'quan_tri' && (
                        <option value="quan_tri">Quản trị</option>
                      )}
                    </select>
                  </div>
                </div>
                
                {/* BỎ checkbox trạng thái - xóa toàn bộ phần này */}
                {/* <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="edit-trangThai" 
                    name="trangThai"
                    checked={state.currentUser.trangThai}
                    onChange={handleEditUserChange}
                    disabled={!isEditMode}
                    style={{
                      width: 'auto',
                      marginRight: 8,
                    }}
                  />
                  <label htmlFor="edit-trangThai" style={{ fontSize: 15 }}>
                    Hoạt động
                  </label>
                </div> */}
                
                {/* BỎ điều kiện isEditMode, luôn render các trường này */}
                <div className="form-group">
                  <label htmlFor="edit-dia_chi">Địa chỉ</label>
                  <input
                    type="text"
                    id="edit-dia_chi"
                    name="dia_chi"
                    value={state.currentUser.dia_chi || ''}
                    onChange={handleEditUserChange}
                    readOnly={!isEditMode}
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
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-thanh_pho">Thành phố</label>
                    <input
                      type="text"
                      id="edit-thanh_pho"
                      name="thanh_pho"
                      value={state.currentUser.thanh_pho || ''}
                      onChange={handleEditUserChange}
                      readOnly={!isEditMode}
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
                  <div className="form-group">
                    <label htmlFor="edit-tinh">Tỉnh</label>
                    <input
                      type="text"
                      id="edit-tinh"
                      name="tinh"
                      value={state.currentUser.tinh || ''}
                      onChange={handleEditUserChange}
                      readOnly={!isEditMode}
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
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-ma_buu_dien">Mã bưu điện</label>
                    <input
                      type="text"
                      id="edit-ma_buu_dien"
                      name="ma_buu_dien"
                      value={state.currentUser.ma_buu_dien || ''}
                      onChange={handleEditUserChange}
                      readOnly={!isEditMode}
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
                  <div className="form-group">
                    <label htmlFor="edit-quoc_gia">Quốc gia</label>
                    <input
                      type="text"
                      id="edit-quoc_gia"
                      name="quoc_gia"
                      value={state.currentUser.quoc_gia || ''}
                      onChange={handleEditUserChange}
                      readOnly={!isEditMode}
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
                
                <div className="user-info-section">
                  <h3>Thông tin bổ sung</h3>
                  <p><strong>ID:</strong> {state.currentUser.id}</p>
                  <p><strong>Ngày đăng ký:</strong> {new Date(state.currentUser.ngayTao).toLocaleString('vi-VN')}</p>
                  <p><strong>Cập nhật lần cuối:</strong> {new Date(state.currentUser.ngayCapNhat).toLocaleString('vi-VN')}</p>
                  <p><strong>Email:</strong> {state.currentUser.email}</p>
                  <p><strong>Vai trò:</strong> {renderRole(state.currentUser.vaiTro)}</p>
                  <p><strong>Trạng thái:</strong> {renderStatus(state.currentUser.trangThai)}</p>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCloseEditModal}
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
                  {isEditMode && (
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
                      Cập nhật
                    </button>
                  )}
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
              <p style={{ fontSize: 15, color: '#333', marginBottom: 10 }}>
                Bạn có chắc chắn muốn xóa người dùng <strong>{state.currentUser.ho} {state.currentUser.ten}</strong> ({state.currentUser.email})?
              </p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
                <i className="fas fa-exclamation-triangle"></i> Lưu ý: Hành động này không thể hoàn tác!
              </p>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={handleCloseDeleteModal}
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
                  onClick={handleDeleteUser}
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
      {hoveredUserId && hoveredUserImgPos && (() => {
        const imgUrl = userAvatarMap[hoveredUserId];
        if (!imgUrl) return null;
        const offsetX = -323;
        const offsetY = -105;
        return (
          <div
            className="product-hover-image"
            style={{
              position: 'fixed',
              left: hoveredUserImgPos.x + offsetX,
              top: hoveredUserImgPos.y + offsetY,
              zIndex: 9999,
              pointerEvents: 'none',
              background: 'transparent', // Đảm bảo không có nền
              boxShadow: 'none',         // Không bóng nền
              borderRadius: 0            // Không bo tròn khung ngoài
            }}
          >
            <img
              src={imgUrl}
              alt="avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #fff', // Viền trắng mỏng
                boxShadow: '0 2px 12px 0 rgba(24,144,255,0.10)' // (tùy chọn, bóng nhẹ)
              }}
            />
          </div>
        );
      })()}
      
      {/* Animation Success Modal */}
      {showSuccessAnimation && (
        <div className="success-animation-modal">
          <div className="success-animation-content">
            {/* Video Animation - tăng kích thước */}
            <video
              autoPlay
              muted
              className="success-video"
              style={{
                width: 180,  // Tăng từ 120px
                height: 180,  // Tăng từ 120px
                marginBottom: 24,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            >
              <source src="/src/assets/Success.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Success Message */}
            <div className="success-message">
              {successMessage.split('\n').map((line, index) => (
                <div key={index} style={{ marginBottom: index < successMessage.split('\n').length - 1 ? 8 : 0 }}>
                  {line}
                </div>
              ))}
            </div>
            
            {/* Additional Info */}
            <div className="success-info">
              <i className="fas fa-info-circle"></i>
              Người dùng có thể đăng nhập ngay với mật khẩu mới
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;