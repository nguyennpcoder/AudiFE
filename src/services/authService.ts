import axios from 'axios';

// const API_URL = `${import.meta.env.VITE_API_URL || 'https://audivn.onrender.com/api/v1'}/auth`;
const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/auth`;

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  role?: string;

  avatar?: string | File | null;
}

// AuthResponse interface
export interface AuthResponse {
  success: boolean;
  phone?: string; // Đổi từ number sang string cho phù hợp
  message: string;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
  avatar?: string;
  token?: string;
  trangThai?: boolean;
  diaChi?: string; // Add this line
}

export interface QuenMatKhauRequest {
  emailOrPhone: string;
  method: 'email' | 'sms';
}

export interface ResetMatKhauRequest {
  token: string;
  matKhauMoi: string;
}

export interface XacThucOtpRequest {
  soDienThoai: string;
  otp: string;
  matKhauMoi: string;
}

export const loginApi = async (data: LoginForm): Promise<AuthResponse> => {
  try {
    // Transform to match backend expected format
    const backendData = {
      tenDangNhap: data.email,
      matKhau: data.password
    };

    const response = await axios.post(`${API_URL}/dang-nhap`, backendData);
    const user = response.data;

    // Nếu tài khoản bị block
    if (user.trangThai === false) {
      return {
        success: false,
        message: `Tài khoản của ${user.ho || ''} ${user.ten || ''} đã bị admin khóa do hành vi bất thường, vui lòng liên hệ đội ngũ admin audi để hỗ trợ`
      };
    }

    console.log("Raw backend response:", response.data);
    
    // Transform backend response to match frontend expected format
    // Ensure role is exactly as received from the database
    const result = {
      success: true,
      message: 'Đăng nhập thành công',
      token: response.data.token,
      userId: response.data.id,
      email: response.data.email,
      role: response.data.vaiTro,
      fullName: `${response.data.ho || ''} ${response.data.ten || ''}`.trim(),
      avatar: response.data.avatar || response.data.anhDaiDien || response.data.anh_dai_dien || null,
      phone: response.data.soDienThoai || response.data.so_dien_thoai || response.data.phone || '',
      trangThai: response.data.trangThai // Đảm bảo trạng thái cũng được map
    };
    
    console.log("Raw backend avatar data:", {
      avatar: response.data.avatar,
      anhDaiDien: response.data.anhDaiDien,
      anh_dai_dien: response.data.anh_dai_dien,
      finalAvatar: result.avatar
    });
    
    console.log("Transformed auth response:", result);
    return result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Nếu backend trả về trạng thái bị block khi sai pass
      if (error.response.data.trangThai === false) {
        return {
          success: false,
          message: `Tài khoản của ${error.response.data.ho || ''} ${error.response.data.ten || ''} đã bị admin khóa do hành vi bất thường, vui lòng liên hệ đội ngũ admin audi để hỗ trợ`
        };
      }
      // Nếu message là "User account is locked" thì trả về message tiếng Việt
      if (error.response.data.message === 'User account is locked') {
        return {
          success: false,
          message: 'Tài khoản của bạn đã bị admin khóa do hành vi bất thường, vui lòng liên hệ đội ngũ Admin Audi để hỗ trợ'
        };
      }
      return {
        success: false,
        message: error.response.data.message || 'Đăng nhập thất bại'
      };
    }
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ'
    };
  }
};

export const registerApi = async (data: RegisterForm): Promise<AuthResponse> => {
  try {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('matKhau', data.password);
    formData.append('ho', data.lastName);
    formData.append('ten', data.firstName);
    formData.append('soDienThoai', data.phone);
    formData.append('diaChi', data.address || '');
    formData.append('thanhPho', data.city || '');
    formData.append('tinh', data.province || '');

    // BỔ SUNG 2 DÒNG NÀY:
    formData.append('maBuuDien', data.postalCode || '');
    formData.append('quocGia', data.country || 'Việt Nam');

    // avatar
    if (data.avatar && (data.avatar as any) instanceof File) {
      formData.append('avatar', data.avatar);
    } else {
      // Nếu không có file, backend sẽ dùng avatar mặc định
    }

    const response = await axios.post(`${API_URL}/dang-ky`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return {
      success: true,
      message: response.data.message || 'Đăng ký thành công',
      email: data.email
    };
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
      // Thêm log chi tiết
      console.error('Backend error response:', error.response.data);
      return {
        success: false,
        message: error.response.data.message || 'Đăng ký thất bại'
      };
    }
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ'
    };
  }
};

export const quenMatKhauApi = async (emailOrPhone: string, method: 'email' | 'sms'): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/quen-mat-khau`, {
      emailOrPhone,
      method
    });
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Không thể gửi mã xác thực'
      };
    }
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ'
    };
  }
};

export const resetMatKhauApi = async (token: string, matKhauMoi: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/reset-mat-khau`, {
      token,
      matKhauMoi
    });
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Không thể đặt lại mật khẩu'
      };
    }
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ'
    };
  }
};

export const xacThucOtpApi = async (soDienThoai: string, otp: string, matKhauMoi: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/xac-thuc-otp`, {
      soDienThoai,
      otp,
      matKhauMoi
    });
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Không thể xác thực OTP'
      };
    }
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ'
    };
  }
};

export const changePasswordApi = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> => {
  try {
    // Sửa URL từ /auth/nguoi-dung thành /nguoi-dung
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    });
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Không thể đổi mật khẩu'
      };
    }
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ'
    };
  }
};

export interface User {
  id: number;
  ten: string;
  ho?: string;
  vai_tro: string; // hoặc role nếu backend trả về như vậy
  email: string;
  avatar?: string;
}

export const fetchAllUsers = async (): Promise<User[]> => {
  const API_USER_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung`;
  const res = await axios.get(API_USER_URL);
  return res.data;
};

// Lấy danh sách nhân viên bán hàng
export const fetchSalesStaff = async (): Promise<User[]> => {
  try {
    const API_USER_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung`;
    const res = await axios.get(API_USER_URL);
    
    // Lọc chỉ lấy nhân viên có role ban_hang
    const salesStaff = res.data.filter((user: any) => user.vaiTro === 'ban_hang' || user.vai_tro === 'ban_hang');
    
    // Chuẩn hóa dữ liệu trả về và sử dụng buildAvatarUrl helper
    return salesStaff.map((user: any) => ({
      id: user.id,
      ten: user.ten,
      ho: user.ho,
      vai_tro: user.vaiTro || user.vai_tro,
      email: user.email,
      avatar: user.avatar || user.anhDaiDien // fallback nếu backend trả về trường khác
    }));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên bán hàng:', error);
    return [];
  }
};

export const updateUser = async (id: number, data: any, token: string) => {
  const API_USER_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung/${id}`;
  return axios.put(API_USER_URL, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Utility function to build avatar URL
export const buildAvatarUrl = (avatar?: string): string => {
  console.log('buildAvatarUrl input:', avatar);
  if (!avatar) {
    return '/avatar-default.png';
  }
  
  // If it's already a full URL (from Google, Facebook, etc.), return as is
  if (/^https?:\/\//.test(avatar)) {
    console.log('buildAvatarUrl output (full URL):', avatar);
    return avatar;
  }
  
  // If it starts with /, it's a relative path
  if (avatar.startsWith('/')) {
    console.log('buildAvatarUrl output (relative path):', avatar);
    return avatar;
  }
  
  // Otherwise, assume it's a filename and build the full URL
  const fileName = avatar.split('/').pop();
  const url = `http://localhost:8080/uploads/images/avatar_user/${fileName}`;
  console.log('buildAvatarUrl output (built URL):', url);
  return url;
};

export const fetchUserProfile = async (token: string) => {
  const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung/profile`;
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Function to validate if token is still valid
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung/profile`;
    await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return false;
    }
    // For other errors, assume token is still valid to avoid unnecessary logouts
    return true;
  }
};