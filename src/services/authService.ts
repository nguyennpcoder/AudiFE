import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/auth';

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
      quocGia: data.country || 'Việt Nam'
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