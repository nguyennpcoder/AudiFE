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
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
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
    console.log("Raw backend response:", response.data);
    
    // Transform backend response to match frontend expected format
    // Ensure role is exactly as received from the database
    const result = {
      success: true,
      message: 'Đăng nhập thành công',
      token: response.data.token,
      userId: response.data.id,
      email: response.data.email,
      role: response.data.vaiTro
    };
    
    console.log("Transformed auth response:", result);
    return result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
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
    // Transform to match backend expected format
    const backendData = {
      email: data.email,
      matKhau: data.password,
      ho: data.lastName,
      ten: data.firstName,
      soDienThoai: data.phone,
      diaChi: data.address || '',
      thanhPho: data.city || '',
      tinh: data.province || '',
      maBuuDien: data.postalCode || '',
      quocGia: data.country || 'Việt Nam',
      vaiTro: data.role || 'khach_hang'
    };

    console.log('Sending registration data:', backendData);
    const response = await axios.post(`${API_URL}/dang-ky`, backendData);
    
    return {
      success: true,
      message: response.data.message || 'Đăng ký thành công',
      email: data.email
    };
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
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

export interface User {
  id: number;
  ten: string;
  ho?: string;
  vai_tro: string; // hoặc role nếu backend trả về như vậy
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
    
    // Chuẩn hóa dữ liệu trả về
    return salesStaff.map((user: any) => ({
      id: user.id,
      ten: user.ten,
      ho: user.ho,
      vai_tro: user.vaiTro || user.vai_tro,
      avatar: user.avatar || '/avatar-default.png'
    }));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên bán hàng:', error);
    return [];
  }
};
