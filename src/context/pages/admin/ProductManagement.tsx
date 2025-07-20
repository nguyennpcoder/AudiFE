import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Admin.css';
import axios from 'axios';

import AdminHeader from './AdminHeader';

// Backend URL constant for image paths
const BACKEND_URL = 'http://localhost:8080';

// Add this at the top of the file, after the imports
const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+No image</dGV4dD48L3N2Zz4=";

// Khai báo kiểu dữ liệu cho dòng xe
interface DongXe {
  id: number;
  ten: string;
  moTa: string;
  phanLoai: string;
  duongDanAnh: string;
}

// Khai báo kiểu dữ liệu cho mẫu xe
interface MauXe {
  id: number;
  idDong: number;
  tenDong: string;
  tenMau: string;
  namSanXuat: number;
  giaCoban: number;
  moTa: string;
  thongSoKyThuat: string;
  conHang: boolean;
  ngayRaMat: string;
}

// Add this interface near the other interfaces at the top of the file
interface HinhAnhXe {
  id: number;
  idMauXe: number;
  duongDanAnh: string;
  loaiHinh: string;
}

// Khai báo kiểu dữ liệu cho màn hình
interface ProductsScreenState {
  dongXeList: DongXe[];
  mauXeList: MauXe[];
  filteredProducts: MauXe[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedPhanLoai: string;
  selectedYear: string;
  selectedStatus: string;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: string;
  showAddModal: boolean;
  showAddSeriesModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  currentProduct: MauXe | null;
  newProduct: MauXe;
  currentDongXe: DongXe | null;
  newDongXe: DongXe;
  productImages: any[];
}

// Khai báo hằng số URL từ biến môi trường
const STATIC_URL = import.meta.env.VITE_STATIC_RESOURCES_URL || 'http://localhost:8080';

const ProductManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Thiết lập trạng thái cho màn hình
  const [state, setState] = useState<ProductsScreenState>({
    dongXeList: [],
    mauXeList: [],
    filteredProducts: [],
    isLoading: true,
    error: null,
    searchTerm: '',
    selectedPhanLoai: '',
    selectedYear: '',
    selectedStatus: '',
    currentPage: 1,
    itemsPerPage: 10,
    sortField: 'id',
    sortDirection: 'asc',
    showAddModal: false,
    showAddSeriesModal: false,
    showEditModal: false,
    showDeleteModal: false,
    currentProduct: null,
    newProduct: {
      id: 0,
      idDong: 0,
      tenDong: '',
      tenMau: '',
      namSanXuat: new Date().getFullYear(),
      giaCoban: 0,
      moTa: '',
      thongSoKyThuat: '',
      conHang: true,
      ngayRaMat: '',
    },
    currentDongXe: null,
    newDongXe: {
      id: 0,
      ten: '',
      moTa: '',
      phanLoai: 'Sedan',
      duongDanAnh: '',
    },
    productImages: [],
  });
  
  // Add a new state for tracking newly added images at the top of your component, near other state declarations
  const [newlyAddedImages, setNewlyAddedImages] = useState<HinhAnhXe[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredImgPos, setHoveredImgPos] = useState<{ x: number; y: number } | null>(null);
  
  // 1. Thêm state mới để lưu ảnh đại diện từng sản phẩm
  const [productThumbnailMap, setProductThumbnailMap] = useState<Record<number, string>>({});

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

  // Lấy danh sách dòng xe và mẫu xe từ API
  useEffect(() => {
    checkServerConnection();
    fetchCarSeries();
    fetchCarModels();
  }, []);

  // API call để lấy danh sách dòng xe
  const fetchCarSeries = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/dong-xe', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải danh sách dòng xe: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        dongXeList: data,
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

  // 2. Hàm lấy ảnh đại diện cho tất cả sản phẩm
  const preloadProductThumbnails = async (products: MauXe[]) => {
    const token = localStorage.getItem('token');
    const map: Record<number, string> = {};

    // Duyệt từng sản phẩm, lấy ảnh ngoại thất
    await Promise.all(products.map(async (product) => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/hinh-anh/mau-xe/${product.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) return;
        const images = await res.json();
        // Ưu tiên ảnh ngoại thất, nếu không có thì lấy ảnh đầu tiên
        const exteriorImg = images.find((img: any) => img.loaiHinh === 'ngoai_that') || images[0];
        if (exteriorImg) {
          // Nếu đường dẫn là /src/assets thì bỏ qua (ảnh demo)
          if (!exteriorImg.duongDanAnh.startsWith('/src/assets/')) {
            map[product.id] = exteriorImg.duongDanAnh.startsWith('http')
              ? exteriorImg.duongDanAnh
              : `${BACKEND_URL}${exteriorImg.duongDanAnh.startsWith('/') ? '' : '/'}${exteriorImg.duongDanAnh}`;
          }
        }
      } catch (e) {
        // Bỏ qua lỗi từng sản phẩm
      }
    }));

    setProductThumbnailMap(map);
  };

  // 3. Khi fetchCarModels xong thì preload thumbnail
  const fetchCarModels = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/mau-xe', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`Không thể tải danh sách mẫu xe: ${response.status}`);
      const data = await response.json();
      setState(prev => ({
        ...prev,
        mauXeList: data,
        filteredProducts: data,
        isLoading: false
      }));
      // Preload thumbnail cho tất cả sản phẩm
      preloadProductThumbnails(data);
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
    filterProducts(searchTerm, state.selectedPhanLoai, state.selectedYear, state.selectedStatus);
  };

  // Xử lý thay đổi lọc theo phân loại
  const handlePhanLoaiFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPhanLoai = e.target.value;
    setState(prev => ({ ...prev, selectedPhanLoai }));
    filterProducts(state.searchTerm, selectedPhanLoai, state.selectedYear, state.selectedStatus);
  };

  // Xử lý thay đổi lọc theo năm sản xuất
  const handleYearFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value;
    setState(prev => ({ ...prev, selectedYear }));
    filterProducts(state.searchTerm, state.selectedPhanLoai, selectedYear, state.selectedStatus);
  };

  // Xử lý thay đổi lọc theo trạng thái
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value;
    setState(prev => ({ ...prev, selectedStatus }));
    filterProducts(state.searchTerm, state.selectedPhanLoai, state.selectedYear, selectedStatus);
  };

  // Lọc danh sách sản phẩm theo các tiêu chí
  const filterProducts = (search: string, phanLoai: string, year: string, status: string) => {
    let filtered = state.mauXeList;
    
    // Lọc theo từ khóa tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => 
        product.tenMau.toLowerCase().includes(searchLower) ||
        product.tenDong.toLowerCase().includes(searchLower)
      );
    }
    
    // Lọc theo phân loại dòng xe
    if (phanLoai) {
      // Lấy danh sách ID dòng xe thuộc phân loại được chọn
      const dongXeIds = state.dongXeList
        .filter(dongXe => dongXe.phanLoai === phanLoai)
        .map(dongXe => dongXe.id);
      
      filtered = filtered.filter(product => dongXeIds.includes(product.idDong));
    }
    
    // Lọc theo năm sản xuất
    if (year) {
      const yearNumber = parseInt(year);
      filtered = filtered.filter(product => product.namSanXuat === yearNumber);
    }
    
    // Lọc theo trạng thái
    if (status !== '') {
      const isAvailable = status === 'available';
      filtered = filtered.filter(product => product.conHang === isAvailable);
    }
    
    setState(prev => ({ 
      ...prev, 
      filteredProducts: filtered,
      currentPage: 1 // Reset về trang đầu tiên khi lọc
    }));
  };

  // Sắp xếp danh sách sản phẩm
  const handleSort = (field: string) => {
    const newDirection = state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    
    const sortedProducts = [...state.filteredProducts].sort((a, b) => {
      const valueA = a[field as keyof MauXe];
      const valueB = b[field as keyof MauXe];
      
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
      filteredProducts: sortedProducts,
      sortField: field,
      sortDirection: newDirection
    }));
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Tổng số trang
  const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
  
  // Lấy danh sách sản phẩm của trang hiện tại
  const currentProducts = state.filteredProducts.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  // Xử lý hiển thị modal thêm mẫu xe
  const handleShowAddModal = () => {
    setState(prev => ({ 
      ...prev, 
      showAddModal: true,
      newProduct: {
        id: 0,
        idDong: prev.dongXeList.length > 0 ? prev.dongXeList[0].id : 0,
        tenDong: prev.dongXeList.length > 0 ? prev.dongXeList[0].ten : '',
        tenMau: '',
        namSanXuat: new Date().getFullYear(),
        giaCoban: 0,
        moTa: '',
        thongSoKyThuat: '',
        conHang: true,
        ngayRaMat: '',
      }
    }));
  };

  // Xử lý hiển thị modal thêm dòng xe
  const handleShowAddSeriesModal = () => {
    setState(prev => ({ 
      ...prev, 
      showAddSeriesModal: true,
      newDongXe: {
        id: 0,
        ten: '',
        moTa: '',
        phanLoai: 'Sedan',
        duongDanAnh: '',
      }
    }));
  };

  // Xử lý đóng modal thêm mẫu xe
  const handleCloseAddModal = () => {
    setState(prev => ({ ...prev, showAddModal: false }));
  };

  // Xử lý đóng modal thêm dòng xe
  const handleCloseAddSeriesModal = () => {
    setState(prev => ({ ...prev, showAddSeriesModal: false }));
  };

  // Xử lý thay đổi thông tin mẫu xe mới
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'idDong') {
      const selectedDongXe = state.dongXeList.find(dongXe => dongXe.id === parseInt(value));
      setState(prev => ({
        ...prev,
        newProduct: {
          ...prev.newProduct,
          idDong: parseInt(value),
          tenDong: selectedDongXe ? selectedDongXe.ten : ''
        }
      }));
    } else {
      let finalValue: any = value;
      if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        finalValue = parseFloat(value);
      }
      
      setState(prev => ({
        ...prev,
        newProduct: {
          ...prev.newProduct,
          [name]: finalValue
        }
      }));
    }
  };

  // Xử lý thay đổi thông tin dòng xe mới
  const handleNewDongXeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setState(prev => ({
      ...prev,
      newDongXe: {
        ...prev.newDongXe,
        [name]: value
      }
    }));
  };

  // Xử lý thêm mẫu xe mới
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/mau-xe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.newProduct)
      });
      
      if (!response.ok) {
        throw new Error('Không thể thêm mẫu xe');
      }
      
      await fetchCarModels();
      setState(prev => ({ ...prev, showAddModal: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý thêm dòng xe mới
  const handleAddDongXe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/dong-xe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.newDongXe)
      });
      
      if (!response.ok) {
        throw new Error('Không thể thêm dòng xe');
      }
      
      await fetchCarSeries();
      setState(prev => ({ ...prev, showAddSeriesModal: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý hiển thị modal chỉnh sửa sản phẩm
  const handleShowEditModal = async (product: MauXe, edit: boolean) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Lấy thông tin hình ảnh sản phẩm
      const productImages = await fetchProductImages(product.id);
      
      setState(prev => ({ 
        ...prev, 
        showEditModal: true,
        currentProduct: { ...product },
        productImages: productImages || [],
        isLoading: false
      }));
      setIsEditMode(edit);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý đóng modal chỉnh sửa sản phẩm
  const handleCloseEditModal = async () => {
    // Remove newly added images that weren't saved
    if (newlyAddedImages.length > 0) {
      const token = localStorage.getItem('token');
      
      for (const image of newlyAddedImages) {
        try {
          // Delete the image from the server
          await fetch(`http://localhost:8080/api/v1/hinh-anh/${image.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error("Error deleting newly added image:", error);
        }
      }
      
      // Reset newly added images
      setNewlyAddedImages([]);
    }
    
    setState(prev => ({ 
      ...prev, 
      showEditModal: false,
      // Revert to the original product images before new additions
      productImages: prev.productImages.filter(
        img => !newlyAddedImages.some(newImg => newImg.id === img.id)
      )
    }));
  };

  // Xử lý thay đổi thông tin sản phẩm đang chỉnh sửa
  const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!state.currentProduct) return;
    
    const { name, value, type } = e.target;
    
    if (name === 'idDong') {
      const selectedDongXe = state.dongXeList.find(dongXe => dongXe.id === parseInt(value));
      setState(prev => ({
        ...prev,
        currentProduct: {
          ...prev.currentProduct!,
          idDong: parseInt(value),
          tenDong: selectedDongXe ? selectedDongXe.ten : ''
        }
      }));
    } else {
      let finalValue: any = value;
      if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        finalValue = parseFloat(value);
      }
      
      setState(prev => ({
        ...prev,
        currentProduct: {
          ...prev.currentProduct!,
          [name]: finalValue
        }
      }));
    }
  };

  // Xử lý cập nhật sản phẩm
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentProduct) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      // First, update the product details
      const productResponse = await fetch(`http://localhost:8080/api/v1/mau-xe/${state.currentProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.currentProduct)
      });
      
      if (!productResponse.ok) {
        throw new Error('Không thể cập nhật mẫu xe');
      }

      // Fetch the original images before update
      const originalImages = await fetchProductImages(state.currentProduct.id);

      // Identify and delete images that are no longer in the current state
      for (const originalImage of originalImages) {
        const isImageStillExists = state.productImages.some(img => img.id === originalImage.id);
        
        if (!isImageStillExists) {
          // If image is not in the current list, delete it from the server
          await fetch(`http://localhost:8080/api/v1/hinh-anh/${originalImage.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      // Refresh the product data to ensure we have the latest state
      await fetchCarModels();
      const updatedImages = await fetchProductImages(state.currentProduct.id);
      
      // Clear newly added images
      setNewlyAddedImages([]);
      
      setState(prev => ({ 
        ...prev, 
        showEditModal: false,
        productImages: updatedImages || [],
        isLoading: false 
      }));
    } catch (error) {
      console.error("Error updating product:", error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Xử lý hiển thị modal xóa sản phẩm
  const handleShowDeleteModal = (product: MauXe) => {
    setState(prev => ({ 
      ...prev, 
      showDeleteModal: true,
      currentProduct: product
    }));
  };

  // Xử lý đóng modal xóa sản phẩm
  const handleCloseDeleteModal = () => {
    setState(prev => ({ ...prev, showDeleteModal: false }));
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async () => {
    if (!state.currentProduct) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8080/api/v1/mau-xe/${state.currentProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa mẫu xe');
      }
      
      await fetchCarModels();
      setState(prev => ({ ...prev, showDeleteModal: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Lấy tên dòng xe từ ID
  const getDongXeTen = (idDong: number) => {
    const dongXe = state.dongXeList.find(item => item.id === idDong);
    return dongXe ? dongXe.ten : 'N/A';
  };

  // Hiển thị trạng thái sản phẩm
  const renderStatus = (status: boolean) => {
    return status 
      ? <span className="status active">Còn hàng</span>
      : <span className="status inactive">Hết hàng</span>;
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Bổ sung thêm các hàm API cho hình ảnh sản phẩm
  const fetchProductImages = async (productId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8080/api/v1/hinh-anh/mau-xe/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải hình ảnh sản phẩm: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Product images data:", data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return data;
    } catch (error) {
      console.error("API call error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      return [];
    }
  };

  // Thêm hàm kiểm tra tồn kho sản phẩm
  const checkProductInventory = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8080/api/v1/ton-kho/kiem-tra/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể kiểm tra tồn kho: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API call error:", error);
      return null;
    }
  };

  // Thêm hàm xem đại lý có sản phẩm
  const getDealersWithProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8080/api/v1/dai-ly/mau-xe/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Không thể lấy danh sách đại lý: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API call error:", error);
      return [];
    }
  };

  // Thêm hàm upload hình ảnh sản phẩm
  const uploadProductImage = async (file: File, productId: number, imageType: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('idMauXe', productId.toString());
      formData.append('loaiHinh', imageType);
      
      const response = await fetch('http://localhost:8080/api/v1/hinh-anh/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải lên hình ảnh: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Track newly added images with full details
      setNewlyAddedImages(prev => [...prev, {
        ...data,
        tempId: Date.now() // Add a unique identifier
      }]);
      
      // Refresh the images
      const updatedImages = await fetchProductImages(productId);
      setState(prev => ({ 
        ...prev, 
        productImages: updatedImages || [],
        isLoading: false 
      }));
      
      return data;
    } catch (error) {
      console.error("API call error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  };

  // Thêm hàm này vào component để hiển thị thông tin tồn kho khi xem chi tiết sản phẩm
  const handleViewInventory = async (product: MauXe) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Lấy thông tin tồn kho
      const inventoryData = await checkProductInventory(product.id);
      
      // Lấy danh sách đại lý có sản phẩm
      const dealersWithProduct = await getDealersWithProduct(product.id);
      
      // Hiển thị thông tin trong modal hoặc chuyển hướng đến trang tồn kho
      console.log("Inventory data:", inventoryData);
      console.log("Dealers with product:", dealersWithProduct);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Đây là nơi để hiển thị thông tin tồn kho nếu cần
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi', 
        isLoading: false 
      }));
    }
  };

  // Add this function just after your component definition
  const checkServerConnection = () => {
    fetch('http://localhost:8080/api/v1/ping', { 
      method: 'HEAD',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    })
      .then(() => console.log('✓ Backend server is accessible'))
      .catch(err => {
        console.warn('⚠️ Cannot verify backend connection:', err.message);
        // Continue with the app despite connection issues
      });
  };

  // Thêm hàm để lấy ảnh dưới dạng Base64 - fix URL handling
  const fetchImageAsBase64 = async (url: string) => {
    if (!url) return FALLBACK_IMAGE;
    
    try {
      const token = localStorage.getItem('token');
      
      // Fix 1: Check if this is a path for an RS model and add special handling
      let fullUrl = url;
      if (url.includes('/RS') || url.includes('rs5') || url.includes('rs7')) {
        console.log("RS model image detected:", url);
        // Special handling for RS models - try different URL formation
        fullUrl = url.startsWith('http') 
          ? url 
          : url.startsWith('/') 
            ? `${BACKEND_URL}${url}` 
            : `${BACKEND_URL}/${url}`;
      } else {
        // Regular URL handling for other models
        fullUrl = url.startsWith('http') 
          ? url 
          : url.startsWith('/') 
            ? `${BACKEND_URL}${url}` 
            : `${BACKEND_URL}/${url}`;
      }
      
      console.log("Fetching image from:", fullUrl);
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to fetch image:", e, "URL:", url);
      return FALLBACK_IMAGE;
    }
  };

  // Sửa phần hiển thị ảnh để dùng ảnh Base64
  // Thêm state mới để lưu ảnh Base64
  const [imageDataMap, setImageDataMap] = useState<Record<string, string>>({});

  // Trong useEffect hoặc khi lấy được danh sách ảnh
  useEffect(() => {
    const loadImagesAsBase64 = async () => {
      if (state.productImages.length > 0) {
        console.log("Loading images:", state.productImages);
        const imageMap: Record<string, string> = {};
        for (const image of state.productImages) {
          if (image.duongDanAnh) {
            try {
              imageMap[image.id] = await fetchImageAsBase64(image.duongDanAnh) as string;
            } catch (err) {
              console.error("Error loading image:", err);
              imageMap[image.id] = FALLBACK_IMAGE;
            }
          } else {
            imageMap[image.id] = FALLBACK_IMAGE;
          }
        }
        setImageDataMap(imageMap);
      }
    };
    
    if (state.productImages.length > 0) {
      loadImagesAsBase64();
    }
  }, [state.productImages]);

  // 1. Thêm component ImageWithFallback tương tự như trong FeaturedProducts
  const ImageWithFallback: React.FC<{
    src: string;
    alt: string;
    fallbackSrc: string;
    imageType?: string;
  }> = ({ src, alt, fallbackSrc, imageType }) => {
    const [imgSrc, setImgSrc] = useState<string>(src);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
      console.log(`ImageWithFallback received src: "${src}", type: "${imageType}"`);
      
      // Fix the issue with /src/assets/ paths getting resolved to the frontend URL
      if (src.startsWith('/src/assets/')) {
        // Dùng fallback thay thế
        setImgSrc(fallbackSrc);
        return;
      }
      
      // Xử lý path của RS models đặc biệt - vấn đề có thể do path khác nhau
      if ((src.includes('RS') || src.includes('rs5') || src.includes('rs7')) && 
          imageType === 'noi_that') {
        console.log("Handling special RS interior image:", src);
        // Thử một số path khác nhau nếu cần
        if (src.startsWith('/')) {
          setImgSrc(`${BACKEND_URL}${src}`);
        } else {
          setImgSrc(`${BACKEND_URL}/${src}`);
        }
      } else {
        // Xử lý URL thông thường
        if (src.startsWith('http')) {
          setImgSrc(src);
        } else if (src.startsWith('/')) {
          setImgSrc(`${BACKEND_URL}${src}`);
        } else {
          setImgSrc(`${BACKEND_URL}/${src}`);
        }
      }
      
      setHasError(false);
    }, [src, fallbackSrc, imageType]);

    return (
      <img
        src={imgSrc}
        alt={alt}
        onError={(e) => {
          console.error(`Image load failed for src: ${imgSrc}`, e);
          if (!hasError) {
            console.log(`Switching to fallback: ${fallbackSrc}`);
            setHasError(true);
            setImgSrc(fallbackSrc);
          }
        }}
        onLoad={() => console.log(`Image loaded successfully: ${imgSrc}`)}
        style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'cover' }}
      />
    );
  };

  // Modify the deleteProductImage function to be more explicit
  const deleteProductImage = (imageId: number) => {
    // Explicitly remove the image from productImages
    setState(prev => ({
      ...prev,
      productImages: prev.productImages.filter(img => img.id !== imageId)
    }));
  };

  const mouseMoveTimeout = useRef<NodeJS.Timeout | null>(null);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 0 }}>
      <AdminHeader pageTitle="Quản lý sản phẩm" />
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 0 0 0',
          minHeight: '100vh',
        }}
      >
        <div
          className="admin-section"
          style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
            padding: '32px 32px 24px 32px',
            marginBottom: 32,
          }}
        >
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm"
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
              value={state.selectedPhanLoai}
              onChange={handlePhanLoaiFilterChange}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                color: 'rgb(107, 114, 128)',
                fontSize: 15,
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả dòng xe</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
              <option value="Sportback">Sportback</option>
              <option value="Dien">Xe điện</option>
            </select>
            <select
              value={state.selectedYear}
              onChange={handleYearFilterChange}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                color: 'rgb(107, 114, 128)',
                fontSize: 15,
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả năm sản xuất</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
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
              <option value="available">Còn hàng</option>
              <option value="unavailable">Hết hàng</option>
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
              <i className="fas fa-plus"></i> Thêm mẫu xe
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', borderRadius: 12, background: '#fafbfc' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tên mẫu xe</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Dòng xe</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Năm SX</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Giá cơ bản</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Trạng thái</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  currentProducts.map((product, idx) => (
                    <tr
                      key={product.id}
                      className="table-row-fadein"
                      style={{
                        animationDelay: `${idx * 120}ms`, // mỗi dòng hiện ra sau dòng trước 120ms
                        background: '#fff',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseEnter={e => {
                        setHoveredRow(product.id);
                        setHoveredImgPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={e => {
                        if (mouseMoveTimeout.current) return;
                        mouseMoveTimeout.current = setTimeout(() => {
                          setHoveredImgPos({ x: e.clientX, y: e.clientY });
                          mouseMoveTimeout.current = null;
                        }, 16); // ~60fps
                      }}
                      onMouseLeave={() => {
                        setHoveredRow(null);
                        setHoveredImgPos(null);
                      }}
                    >
                      <td style={{ padding: '10px 8px' }}>{product.id}</td>
                      <td style={{ padding: '10px 8px' }}>{product.tenMau}</td>
                      <td style={{ padding: '10px 8px' }}>{product.tenDong}</td>
                      <td style={{ padding: '10px 8px' }}>{product.namSanXuat}</td>
                      <td style={{ padding: '10px 8px' }}>{formatPrice(product.giaCoban)}</td>
                      <td style={{ padding: '10px 8px' }}>{renderStatus(product.conHang)}</td>
                      <td
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          minWidth: 160,
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
                            onClick={() => handleShowEditModal(product, false)}
                            onMouseEnter={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseMove={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseLeave={e => {
                              const tr = e.currentTarget.closest('tr');
                              if (tr && tr.matches(':hover')) {
                                setHoveredRow(product.id);
                                setHoveredImgPos({ x: e.clientX, y: e.clientY });
                              }
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn-edit"
                            title="Chỉnh sửa"
                            onClick={() => handleShowEditModal(product, true)}
                            onMouseEnter={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseMove={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseLeave={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-inventory"
                            title="Xem tồn kho"
                            onClick={() => handleViewInventory(product)}
                            onMouseEnter={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseMove={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseLeave={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                          >
                            <i className="fas fa-warehouse"></i>
                          </button>
                          <button
                            className="btn-delete"
                            title="Xóa"
                            onClick={() => handleShowDeleteModal(product)}
                            onMouseEnter={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseMove={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                            onMouseLeave={() => { setHoveredRow(null); setHoveredImgPos(null); }}
                          >
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
      
      {/* Modal thêm dòng xe */}
      {state.showAddSeriesModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Thêm dòng xe mới</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseAddSeriesModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleAddDongXe}>
                <div className="form-group">
                  <label htmlFor="ten">Tên dòng xe <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="ten" 
                    name="ten"
                    value={state.newDongXe.ten}
                    onChange={handleNewDongXeChange}
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
                  <label htmlFor="phanLoai">Phân loại <span className="required">*</span></label>
                  <select 
                    id="phanLoai" 
                    name="phanLoai"
                    value={state.newDongXe.phanLoai}
                    onChange={handleNewDongXeChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                    }}
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Sportback">Sportback</option>
                    <option value="Dien">Xe điện</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="moTa">Mô tả</label>
                  <textarea 
                    id="moTa" 
                    name="moTa"
                    value={state.newDongXe.moTa}
                    onChange={handleNewDongXeChange}
                    rows={4}
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
                  <label htmlFor="duongDanAnh">Đường dẫn ảnh</label>
                  <input 
                    type="text" 
                    id="duongDanAnh" 
                    name="duongDanAnh"
                    value={state.newDongXe.duongDanAnh}
                    onChange={handleNewDongXeChange}
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
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCloseAddSeriesModal}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
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
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
                    }}
                  >
                    Thêm dòng xe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal thêm mẫu xe */}
      {state.showAddModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Thêm mẫu xe mới</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseAddModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label htmlFor="idDong">Dòng xe <span className="required">*</span></label>
                  <select 
                    id="idDong" 
                    name="idDong"
                    value={state.newProduct.idDong}
                    onChange={handleNewProductChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                    }}
                  >
                    {state.dongXeList.map(dongXe => (
                      <option key={dongXe.id} value={dongXe.id}>{dongXe.ten}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tenMau">Tên mẫu xe <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="tenMau" 
                    name="tenMau"
                    value={state.newProduct.tenMau}
                    onChange={handleNewProductChange}
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
                    <label htmlFor="namSanXuat">Năm sản xuất <span className="required">*</span></label>
                    <input 
                      type="number" 
                      id="namSanXuat" 
                      name="namSanXuat"
                      value={state.newProduct.namSanXuat}
                      onChange={handleNewProductChange}
                      min="2000"
                      max="2050"
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
                    <label htmlFor="giaCoban">Giá cơ bản (VNĐ) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      id="giaCoban" 
                      name="giaCoban"
                      value={state.newProduct.giaCoban}
                      onChange={handleNewProductChange}
                      min="0"
                      step="1000000"
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
                
                <div className="form-group">
                  <label htmlFor="moTa">Mô tả</label>
                  <textarea 
                    id="moTa" 
                    name="moTa"
                    value={state.newProduct.moTa}
                    onChange={handleNewProductChange}
                    rows={4}
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
                  <label htmlFor="thongSoKyThuat">Thông số kỹ thuật (JSON)</label>
                  <textarea 
                    id="thongSoKyThuat" 
                    name="thongSoKyThuat"
                    value={state.newProduct.thongSoKyThuat}
                    onChange={handleNewProductChange}
                    rows={5}
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
                    <label htmlFor="ngayRaMat">Ngày ra mắt</label>
                    <input 
                      type="date" 
                      id="ngayRaMat" 
                      name="ngayRaMat"
                      value={state.newProduct.ngayRaMat}
                      onChange={handleNewProductChange}
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
                  
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="conHang" 
                      name="conHang"
                      checked={state.newProduct.conHang}
                      onChange={handleNewProductChange}
                      style={{
                        width: 'auto',
                        marginRight: '8px',
                      }}
                    />
                    <label htmlFor="conHang" style={{ fontSize: 15 }}>Còn hàng</label>
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
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
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
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
                    }}
                  >
                    Thêm mẫu xe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal chỉnh sửa mẫu xe */}
      {state.showEditModal && state.currentProduct && (
        <div className="admin-modal">
          <div className="admin-modal-content admin-modal-large">
            <div className="admin-modal-header">
              <h2>{isEditMode ? 'Chỉnh sửa mẫu xe' : 'Xem chi tiết mẫu xe'}</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseEditModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label htmlFor="edit-idDong">Dòng xe <span className="required">*</span></label>
                  <select 
                    id="edit-idDong" 
                    name="idDong"
                    value={state.currentProduct.idDong}
                    onChange={handleEditProductChange}
                    required
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                    }}
                  >
                    {state.dongXeList.map(dongXe => (
                      <option key={dongXe.id} value={dongXe.id}>{dongXe.ten}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-tenMau">Tên mẫu xe <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="edit-tenMau" 
                    name="tenMau"
                    value={state.currentProduct.tenMau}
                    onChange={handleEditProductChange}
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
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-namSanXuat">Năm sản xuất <span className="required">*</span></label>
                    <input 
                      type="number" 
                      id="edit-namSanXuat" 
                      name="namSanXuat"
                      value={state.currentProduct.namSanXuat}
                      onChange={handleEditProductChange}
                      min="2000"
                      max="2050"
                      required
                      disabled={!isEditMode}
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
                    <label htmlFor="edit-giaCoban">Giá cơ bản (VNĐ) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      id="edit-giaCoban" 
                      name="giaCoban"
                      value={state.currentProduct.giaCoban}
                      onChange={handleEditProductChange}
                      min="0"
                      step="1000000"
                      required
                      disabled={!isEditMode}
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
                
                <div className="form-group">
                  <label htmlFor="edit-moTa">Mô tả</label>
                  <textarea 
                    id="edit-moTa" 
                    name="moTa"
                    value={state.currentProduct.moTa}
                    onChange={handleEditProductChange}
                    rows={4}
                    readOnly={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      color: 'rgb(107, 114, 128)',
                      fontSize: 15,
                      background: '#fafbfc',
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-thongSoKyThuat">Thông số kỹ thuật (JSON)</label>
                  <textarea 
                    id="edit-thongSoKyThuat" 
                    name="thongSoKyThuat"
                    value={state.currentProduct.thongSoKyThuat}
                    onChange={handleEditProductChange}
                    rows={5}
                    readOnly={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      color: 'rgb(107, 114, 128)',
                      fontSize: 15,
                      background: '#fafbfc',
                    }}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-ngayRaMat">Ngày ra mắt</label>
                    <input 
                      type="date" 
                      id="edit-ngayRaMat" 
                      name="ngayRaMat"
                      value={state.currentProduct.ngayRaMat}
                      onChange={handleEditProductChange}
                      disabled={!isEditMode}
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
                  
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="edit-conHang" 
                      name="conHang"
                      checked={state.currentProduct.conHang}
                      onChange={handleEditProductChange}
                      disabled={!isEditMode}
                      style={{
                        width: 'auto',
                        marginRight: '8px',
                      }}
                    />
                    <label htmlFor="edit-conHang" style={{ fontSize: 15 }}>Còn hàng</label>
                  </div>
                </div>
                
                <div className="product-info-section">
                  <h3>Thông tin bổ sung</h3>
                  <p>
                    <strong>ID:</strong> {state.currentProduct.id}
                  </p>
                </div>
                
                <div className="form-group">
                  <label>Hình ảnh sản phẩm</label>
                  <div className="product-images-container">
                    {state.productImages.length > 0 ? (
                      state.productImages.map((image, index) => {
                        return (
                          <div key={image.id} className="product-image-item">
                            <div className="image-wrapper">
                              {/* Nút xóa ảnh chỉ hiển thị khi edit */}
                              {isEditMode && (
                                <button 
                                  className="image-delete-btn" 
                                  onClick={() => deleteProductImage(image.id)}
                                  title="Xóa hình ảnh"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                              <ImageWithFallback 
                                src={image.duongDanAnh}
                                alt={`${state.currentProduct?.tenMau || 'Product'} ${index + 1}`}
                                fallbackSrc={FALLBACK_IMAGE}
                                imageType={image.loaiHinh}
                              />
                            </div>
                            <div className="image-type">{image.loaiHinh || 'Unknown'}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-images">Không có hình ảnh</div>
                    )}
                  </div>
                  
                  {/* CHỈ HIỂN THỊ KHI EDIT */}
                  {isEditMode && (
                    <div className="upload-image-section">
                      <input 
                        type="file" 
                        id="image-upload" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0] && state.currentProduct) {
                            let imageType = 'noi_that';
                            const isRSModel = state.currentProduct.tenMau.includes('RS') || 
                                              state.currentProduct.tenDong.includes('RS');
                            imageType = isRSModel ? 'interior' : 'noi_that';
                            uploadProductImage(e.target.files[0], state.currentProduct.id, imageType)
                              .then((result) => {
                                if (result && state.currentProduct) {
                                  fetchProductImages(state.currentProduct.id).then(images => {
                                    setState(prev => ({ ...prev, productImages: images || [] }));
                                  });
                                }
                              });
                          }
                        }} 
                      />
                      <label htmlFor="image-upload" className="btn-upload">
                        <i className="fas fa-upload"></i> Tải lên hình ảnh mới
                      </label>
                    </div>
                  )}
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
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
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
                        fontWeight: 600,
                        fontSize: 15,
                        boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)',
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
      
      {/* Modal xóa sản phẩm */}
      {state.showDeleteModal && state.currentProduct && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Xóa sản phẩm</h2>
              <button 
                className="admin-modal-close"
                onClick={handleCloseDeleteModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
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
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn-delete"
                  onClick={handleDeleteProduct}
                  style={{
                    background: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px 0 rgba(255,77,79,0.10)',
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hoveredRow && hoveredImgPos && (() => {
        const imgUrl = productThumbnailMap[hoveredRow];
        if (!imgUrl) return null;
        // Điều chỉnh offset cho hợp lý
        const offsetX = -350; // lệch phải nhẹ
        const offsetY = -130; // lên trên một nửa chiều cao ảnh (90px/2)
        return (
          <div
            className="product-hover-image"
            style={{
              position: 'fixed',
              left: hoveredImgPos.x + offsetX,
              top: hoveredImgPos.y + offsetY,
              zIndex: 9999,
              pointerEvents: 'none',
              transform: `translate3d(0,0,0)`,
              transition: 'transform 0.08s cubic-bezier(0.4,0,0.2,1)'
            }}
          >
            <img src={imgUrl} alt="" />
          </div>
        );
      })()}
    </div>
  );
};

export default ProductManagement;