import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Types
export interface BaiViet {
  id?: number;
  tieuDe: string;
  noiDung: string;
  danhMuc: string;
  theGan?: string[];
  anhDaiDien?: string;
  tenTacGia?: string;
  ngayDang?: string;
  daXuatBan?: boolean;
}

export interface BaiVietResponse {
  success: boolean;
  data?: BaiViet[];
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Helper function to get multipart headers
const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };
};

// Blog Service
export const blogService = {
  // Get all blog posts (admin)
  getAllBaiViet: async (): Promise<BaiViet[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      throw new Error('Không thể tải danh sách bài viết');
    }
  },

  // Get paginated blog posts (admin)
  getPagedBaiViet: async (page: number = 0, size: number = 10, sortBy: string = 'ngayDang', sortDir: string = 'desc') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/page`, {
        headers: getAuthHeaders(),
        params: { page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching paginated blog posts:', error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      throw new Error('Không thể tải danh sách bài viết');
    }
  },

  // Get public blog posts
  getPublicBaiViet: async (page: number = 0, size: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/public`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching public blog posts:', error);
      throw new Error('Không thể tải danh sách bài viết công khai');
    }
  },

  // Get blog post by ID
  getBaiVietById: async (id: number): Promise<BaiViet> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog post by ID:', error);
      throw new Error('Không thể tải thông tin bài viết');
    }
  },

  // Create new blog post with FormData
  createBaiViet: async (formData: FormData): Promise<BaiViet> => {
    try {
      console.log('Sending FormData to backend...');
      
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log('File:', key, value.name, value.size, value.type);
        } else {
          console.log('Field:', key, value);
        }
      }
      
      const response = await axios.post(`${API_BASE_URL}/bai-viet/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          // Không set Content-Type để browser tự động set với boundary
        },
      });
      
      console.log('Backend response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền tạo bài viết');
      }
      throw new Error('Không thể tạo bài viết');
    }
  },

  // Update blog post with FormData
  updateBaiViet: async (id: number, formData: FormData): Promise<BaiViet> => {
    try {
      console.log('Sending FormData to backend for update...');
      
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log('File:', key, value.name, value.size, value.type);
        } else {
          console.log('Field:', key, value);
        }
      }
      
      const response = await axios.put(`${API_BASE_URL}/bai-viet/${id}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          // Không set Content-Type để browser tự động set với boundary
        },
      });
      
      console.log('Backend response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền cập nhật bài viết');
      }
      throw new Error('Không thể cập nhật bài viết');
    }
  },

  // Delete blog post
  deleteBaiViet: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/bai-viet/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền xóa bài viết');
      }
      throw new Error('Không thể xóa bài viết');
    }
  },

  // Publish/Unpublish blog post
  updatePublishStatus: async (id: number, daXuatBan: boolean): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(
        `${API_BASE_URL}/bai-viet/${id}/publish?daXuatBan=${daXuatBan}`,
        null, // No request body needed
        { headers }
      );
      
      if (response.status !== 200) {
        throw new Error('Không thể cập nhật trạng thái xuất bản');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái xuất bản');
    }
  },

  // Search blog posts (admin)
  searchBaiViet: async (keyword: string): Promise<BaiViet[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/search`, {
        headers: getAuthHeaders(),
        params: { keyword },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching blog posts:', error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      throw new Error('Không thể tìm kiếm bài viết');
    }
  },

  // Search public blog posts
  searchPublicBaiViet: async (keyword: string, page: number = 0, size: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/search/public`, {
        params: { keyword, page, size },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching public blog posts:', error);
      throw new Error('Không thể tìm kiếm bài viết');
    }
  },

  // Get blog posts by category
  getBaiVietByDanhMuc: async (danhMuc: string): Promise<BaiViet[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/danh-muc/${danhMuc}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog posts by category:', error);
      throw new Error('Không thể tải bài viết theo danh mục');
    }
  },

  // Get public blog posts by category
  getPublicBaiVietByDanhMuc: async (danhMuc: string, page: number = 0, size: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/danh-muc/${danhMuc}/public`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching public blog posts by category:', error);
      throw new Error('Không thể tải bài viết theo danh mục');
    }
  },

  // Get blog posts by tag
  getBaiVietByTag: async (tag: string): Promise<BaiViet[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/tag/${tag}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog posts by tag:', error);
      throw new Error('Không thể tải bài viết theo tag');
    }
  },

  // Get blog posts by author
  getBaiVietByTacGia: async (idTacGia: number): Promise<BaiViet[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bai-viet/tac-gia/${idTacGia}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog posts by author:', error);
      throw new Error('Không thể tải bài viết theo tác giả');
    }
  },
};