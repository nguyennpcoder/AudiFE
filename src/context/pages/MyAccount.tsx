import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Spin,
  Avatar,
  Descriptions,
  Divider,
  Modal,
  Form,
  Input,
  Upload,
  Tooltip,
  Badge,
  Tag,
  Progress,
  Statistic,
  Timeline,
  Tabs,
  Alert,
  Switch
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BellOutlined,
  SafetyOutlined,  // Changed from ShieldCheckOutlined
  GlobalOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { changePasswordApi } from '../../services/authService';
import axios from 'axios';
import '../../styles/MyAccount.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const BACKEND_URL = 'http://localhost:8080/api/v1';

interface UserProfile {
  id: number;
  email: string;
  ho: string;
  ten: string;
  soDienThoai?: string;
  diaChi?: string;
  thanhPho?: string;
  tinh?: string;
  maBuuDien?: string;
  quocGia?: string;
  avatar?: string;
  vaiTro: string;
  ngayTao: string;
  trangThai: boolean;
}

const MyAccount: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [profileStrength, setProfileStrength] = useState(0);
  
  // Add avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarHover, setIsAvatarHover] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (userProfile) {
      calculateProfileStrength();
    }
  }, [userProfile]);

  const calculateProfileStrength = () => {
    if (!userProfile) return;
    
    let strength = 0;
    const fields = [
      userProfile.ho,
      userProfile.ten,
      userProfile.email,
      userProfile.soDienThoai,
      userProfile.diaChi,
      userProfile.thanhPho,
      userProfile.tinh,
      userProfile.avatar
    ];
    
    fields.forEach(field => {
      if (field && field.trim() !== '') strength += 12.5;
    });
    
    setProfileStrength(Math.round(strength));
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/nguoi-dung/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUserProfile(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin cá nhân:', error);
      showNotification('error', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      profileForm.setFieldsValue({
        ho: userProfile.ho,
        ten: userProfile.ten,
        soDienThoai: userProfile.soDienThoai,
        diaChi: userProfile.diaChi,
        thanhPho: userProfile.thanhPho,
        tinh: userProfile.tinh,
        maBuuDien: userProfile.maBuuDien,
        quocGia: userProfile.quocGia
      });
      setEditing(true);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      setLoading(true);
      const response = await axios.put(`${BACKEND_URL}/nguoi-dung/profile`, values, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.message) {
        showNotification('success', response.data.message);
      } else {
        showNotification('success', 'Cập nhật thông tin thành công');
      }
      setEditing(false);
      loadUserProfile();
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      if (error.response?.data?.message) {
        showNotification('error', error.response.data.message);
      } else {
        showNotification('error', 'Không thể cập nhật thông tin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      setPasswordLoading(true);
      const response = await changePasswordApi(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );

      if (response.success) {
        showNotification('success', 'Cập nhật mật khẩu mới thành công');
        setChangePasswordModal(false);
        passwordForm.resetFields();
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      showNotification('error', 'Không thể đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath || avatarPath.trim() === '') {
      return '/avatar-default.png';
    }
    
    if (avatarPath.startsWith('http')) {
      return `${avatarPath}${avatarVersion ? `?v=${avatarVersion}` : ''}`;
    }
    
    if (avatarPath === 'avatar-default.png') {
      return '/avatar-default.png';
    }
    
    if (avatarPath.includes('uploads/images/avatar_user/')) {
      return `http://localhost:8080/${avatarPath}${avatarVersion ? `?v=${avatarVersion}` : ''}`;
    }
    
    return `http://localhost:8080/uploads/images/avatar_user/${avatarPath}${avatarVersion ? `?v=${avatarVersion}` : ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'quan_tri': return 'Quản trị viên';
      case 'ban_hang': return 'Nhân viên bán hàng';
      case 'ho_tro': return 'Nhân viên hỗ trợ';
      default: return 'Khách hàng';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'quan_tri': return '#f50';
      case 'ban_hang': return '#2db7f5';
      case 'ho_tro': return '#87d068';
      default: return '#108ee9';
    }
  };

  // Add avatar change handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Add avatar upload handler
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      showNotification('error', 'Vui lòng chọn ảnh đại diện');
      return;
    }

    try {
      setLoading(true);
      // 1) Upload file to storage service
      const uploadForm = new FormData();
      uploadForm.append('file', avatarFile);

      const uploadRes = await axios.post(`${BACKEND_URL}/upload/avatar`, uploadForm, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const uploadedPath: string | undefined = uploadRes.data?.url;
      if (!uploadedPath) {
        throw new Error('Không nhận được đường dẫn ảnh từ server');
      }

      // 2) Persist avatar to current user profile
      const avatarValue = uploadedPath.includes('/')
        ? uploadedPath.split('/').pop() || uploadedPath
        : uploadedPath;

      if (!userProfile?.id) {
        throw new Error('Không xác định được ID người dùng');
      }

      // Build full DTO to satisfy backend non-null constraints
      const updatePayload = {
        id: userProfile.id,
        ho: userProfile.ho,
        ten: userProfile.ten,
        soDienThoai: userProfile.soDienThoai || '',
        diaChi: userProfile.diaChi || '',
        thanhPho: userProfile.thanhPho || '',
        tinh: userProfile.tinh || '',
        maBuuDien: userProfile.maBuuDien || '',
        quocGia: userProfile.quocGia || 'Việt Nam',
        vaiTro: userProfile.vaiTro,
        trangThai: userProfile.trangThai,
        avatar: avatarValue
      };

      await axios.put(`${BACKEND_URL}/nguoi-dung/${userProfile.id}`, updatePayload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      showNotification('success', 'Cập nhật ảnh đại diện thành công');

      // Update cached user for header and other places
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.avatar = avatarValue;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } catch {}

      // Notify listeners (Header) to refresh avatar immediately
      try {
        const fullUrl = uploadedPath.startsWith('http')
          ? uploadedPath
          : `http://localhost:8080/uploads/images/avatar_user/${avatarValue}`;
        const evt = new CustomEvent('user-avatar-updated', { detail: { avatar: fullUrl } });
        window.dispatchEvent(evt);
      } catch {
        window.dispatchEvent(new Event('user-avatar-updated'));
      }

      setAvatarVersion(prev => prev + 1);
      setAvatarFile(null);
      setAvatarPreview(null);
      loadUserProfile(); // Reload profile to get new avatar
    } catch (error: any) {
      console.error('Lỗi khi cập nhật ảnh đại diện:', error);
      if (error.response?.data?.message) {
        showNotification('error', error.response.data.message);
      } else {
        showNotification('error', 'Không thể cập nhật ảnh đại diện');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="account-container">
        <div className="auth-prompt">
          <div className="auth-prompt-content">
            <UserOutlined className="auth-prompt-icon" />
            <Title level={2} className="auth-prompt-title">
              Chào mừng đến với Audi Vietnam
            </Title>
            <Paragraph className="auth-prompt-description">
              Vui lòng đăng nhập để xem thông tin tài khoản và trải nghiệm đầy đủ các dịch vụ của chúng tôi
            </Paragraph>
            <Button type="primary" size="large" onClick={() => navigate('/login')} className="auth-prompt-button">
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      {/* Hero Section */}
      <div className="account-hero">
        <div className="hero-background"></div>
        <div className="account-hero-content">
          <div className="hero-avatar-section">
            {/* Replace the Badge with the Register-style avatar upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label
                htmlFor="avatar-upload"
                className={`avatar-upload-label${avatarPreview ? ' has-avatar' : ''}${isAvatarHover ? ' hover' : ''}`}
                onMouseEnter={() => setIsAvatarHover(true)}
                onMouseLeave={() => setIsAvatarHover(false)}
                style={{
                  position: 'relative',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px 0 rgba(24,144,255,0.15)',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={avatarPreview || getAvatarUrl(userProfile?.avatar) || '/avatar-default.png'}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    display: 'block',
                    transition: 'filter 0.2s',
                  }}
                />
                {(!avatarPreview || isAvatarHover) && (
                  <div className={`avatar-upload-overlay`} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isAvatarHover ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}>
                    <CameraOutlined className={`avatar-upload-icon${isAvatarHover ? ' show' : ''}`} style={{
                      color: 'white',
                      fontSize: '24px',
                      opacity: isAvatarHover ? 1 : 0,
                      transition: 'opacity 0.2s',
                    }} />
                  </div>
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
              {avatarFile && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Button 
                    size="small" 
                    type="primary"
                    onClick={handleAvatarUpload}
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Lưu ảnh
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    icon={<ReloadOutlined />}
                  >
                    Hủy
                  </Button>
                </div>
              )}
             
            </div>
          </div>
          
          <div className="hero-info">
            <Title level={1} className="hero-name">
              {userProfile?.ho} {userProfile?.ten}
            </Title>
            <Text className="hero-email">{userProfile?.email}</Text>
            
            <div className="hero-tags">
              <Tag 
                color={getRoleColor(userProfile?.vaiTro || '')} 
                className="role-tag"
                icon={<TrophyOutlined />}
              >
                {getRoleText(userProfile?.vaiTro || '')}
              </Tag>
              <Tag 
                color={userProfile?.trangThai ? 'success' : 'error'} 
                className="status-tag"
                icon={userProfile?.trangThai ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              >
                {userProfile?.trangThai ? 'Hoạt động' : 'Đã khóa'}
              </Tag>
            </div>

            <div className="profile-strength">
              <Text className="strength-label">Độ hoàn thiện hồ sơ</Text>
              <Progress 
                percent={profileStrength} 
                strokeColor={{
                  '0%': '#ff4d4f',
                  '50%': '#faad14',
                  '100%': '#52c41a',
                }}
                className="strength-progress"
              />
            </div>
          </div>

          <div className="hero-actions">
            <Space direction="vertical" size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<EditOutlined />}
                onClick={handleEditProfile}
                className="account-hero-btn account-primary-btn"
              >
                Chỉnh sửa hồ sơ
              </Button>
              <Button 
                size="large"
                icon={<EyeOutlined />}
                onClick={() => setEditing(false)}
                className="account-hero-btn account-secondary-btn"
              >
                Hiển thị thông tin
              </Button>
              <Button 
                size="large"
                icon={<ReloadOutlined />}
                onClick={loadUserProfile}
                loading={loading}
                className="account-hero-btn account-ghost-btn"
              >
                Làm mới
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="account-loading-container">
          <Spin size="large" className="account-loading-spinner" />
          <Title level={4} className="account-loading-text">Đang tải thông tin...</Title>
        </div>
      ) : userProfile ? (
        <div className="account-content">
          {/* Quick Stats */}
          <Row gutter={[24, 24]} className="stats-row">
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Thành viên từ"
                  value={new Date(userProfile.ngayTao).getFullYear()}
                  prefix={<StarOutlined className="stat-icon star" />}
                  suffix="năm"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Trạng thái tài khoản"
                  value={userProfile.trangThai ? "Xác thực" : "Chờ xác thực"}
                  prefix={<SafetyOutlined className="stat-icon shield" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Độ hoàn thiện"
                  value={profileStrength}
                  prefix={<FireOutlined className="stat-icon fire" />}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content Tabs */}
          <Card className="content-card">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="account-tabs"
              size="large"
            >
              <TabPane 
                tab={
                  <span className="tab-title">
                    <UserOutlined />
                    Thông tin cá nhân
                  </span>
                } 
                key="1"
              >
                <div className="tab-content fade-in">
                  {editing ? (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleSaveProfile}
                      className="profile-form"
                    >
                      <div className="form-section">
                        <Title level={4} className="section-title">
                          <UserOutlined /> Thông tin cơ bản
                        </Title>
                        <Row gutter={24}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Họ"
                              name="ho"
                              rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                            >
                              <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Nhập họ" 
                                className="form-input"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Tên"
                              name="ten"
                              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                              <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Nhập tên" 
                                className="form-input"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={24}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Số điện thoại"
                              name="soDienThoai"
                            >
                              <Input 
                                prefix={<PhoneOutlined />} 
                                placeholder="Nhập số điện thoại" 
                                className="form-input"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item label="Email">
                              <Input 
                                prefix={<MailOutlined />} 
                                value={userProfile.email}
                                disabled
                                className="form-input disabled"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <Divider className="form-divider" />

                      <div className="form-section">
                        <Title level={4} className="section-title">
                          <HomeOutlined /> Địa chỉ
                        </Title>
                        <Form.Item
                          label="Địa chỉ chi tiết"
                          name="diaChi"
                        >
                          <TextArea 
                            placeholder="Nhập địa chỉ chi tiết"
                            rows={3}
                            className="form-textarea"
                          />
                        </Form.Item>

                        <Row gutter={24}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Thành phố"
                              name="thanhPho"
                            >
                              <Input 
                                placeholder="Nhập thành phố" 
                                className="form-input"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Tỉnh/Thành phố"
                              name="tinh"
                            >
                              <Input 
                                placeholder="Nhập tỉnh" 
                                className="form-input"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Mã bưu điện"
                              name="maBuuDien"
                            >
                              <Input 
                                prefix={<IdcardOutlined />} 
                                placeholder="Nhập mã bưu điện" 
                                className="form-input"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          label="Quốc gia"
                          name="quocGia"
                        >
                          <Input 
                            prefix={<GlobalOutlined />}
                            placeholder="Nhập quốc gia" 
                            className="form-input"
                          />
                        </Form.Item>
                      </div>

                      <div className="form-actions">
                        <Space size="large">
                          <Button 
                            size="large"
                            onClick={() => setEditing(false)}
                            className="cancel-btn"
                          >
                            Hủy bỏ
                          </Button>
                          <Button 
                            type="primary" 
                            size="large"
                            icon={<SaveOutlined />}
                            htmlType="submit"
                            loading={loading}
                            className="save-btn"
                          >
                            Lưu thay đổi
                          </Button>
                        </Space>
                      </div>
                    </Form>
                  ) : (
                    <div className="profile-view">
                      <Alert
                        message={`Chào mừng ${userProfile.ho} ${userProfile.ten}!`}
                        description="Hãy giữ thông tin cá nhân luôn được cập nhật để có trải nghiệm tốt nhất."
                        type="info"
                        showIcon
                        className="welcome-alert"
                      />

                      <Descriptions 
                        column={{ xs: 1, sm: 1, md: 2 }} 
                        bordered
                        className="profile-descriptions"
                      >
                        <Descriptions.Item 
                          label={<><UserOutlined /> Họ và tên</>}
                          className="desc-item"
                        >
                          <Text strong>{userProfile.ho} {userProfile.ten}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><MailOutlined /> Email</>}
                          className="desc-item"
                        >
                          <Text copyable>{userProfile.email}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><PhoneOutlined /> Số điện thoại</>}
                          className="desc-item"
                        >
                          <Text>{userProfile.soDienThoai || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><HomeOutlined /> Địa chỉ</>}
                          className="desc-item"
                        >
                          <Text>{userProfile.diaChi || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><GlobalOutlined /> Thành phố</>}
                          className="desc-item"
                        >
                          <Text>{userProfile.thanhPho || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><IdcardOutlined /> Tỉnh/Thành phố</>}
                          className="desc-item"
                        >
                          <Text>{userProfile.tinh || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label="Mã bưu điện"
                          className="desc-item"
                        >
                          <Text>{userProfile.maBuuDien || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label="Quốc gia"
                          className="desc-item"
                        >
                          <Text>{userProfile.quocGia || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  )}
                </div>
              </TabPane>

              <TabPane 
                tab={
                  <span className="tab-title">
                    <SecurityScanOutlined />
                    Bảo mật
                  </span>
                } 
                key="2"
              >
                <div className="tab-content fade-in">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card className="security-card">
                        <div className="security-header">
                          <SafetyOutlined className="security-icon" />
                          <div>
                            <Title level={4}>Mật khẩu</Title>
                            <Text type="secondary">Bảo vệ tài khoản bằng mật khẩu mạnh</Text>
                          </div>
                        </div>
                        <Divider />
                        <div className="security-content">
                          <Text>Thay đổi mật khẩu thường xuyên để đảm bảo an toàn</Text>
                          <Button 
                            type="primary" 
                            icon={<LockOutlined />}
                            onClick={() => setChangePasswordModal(true)}
                            className="security-btn"
                            block
                          >
                            Đổi mật khẩu
                          </Button>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card className="security-card">
                        <div className="security-header">
                          <BellOutlined className="security-icon" />
                          <div>
                            <Title level={4}>Thông báo</Title>
                            <Text type="secondary">Quản lý cài đặt thông báo</Text>
                          </div>
                        </div>
                        <Divider />
                        <div className="security-content">
                          <div className="notification-setting">
                            <Text>Email thông báo</Text>
                            <Switch defaultChecked />
                          </div>
                          <div className="notification-setting">
                            <Text>Thông báo đẩy</Text>
                            <Switch />
                          </div>
                          <div className="notification-setting">
                            <Text>Tin nhắn SMS</Text>
                            <Switch />
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              <TabPane 
                tab={
                  <span className="tab-title">
                    <ClockCircleOutlined />
                    Hoạt động
                  </span>
                } 
                key="3"
              >
                <div className="tab-content fade-in">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <Card title="Lịch sử hoạt động" className="activity-card">
                        <Timeline className="activity-timeline">
                          <Timeline.Item 
                            color="green"
                            dot={<CheckCircleOutlined className="timeline-icon" />}
                          >
                            <div className="timeline-content">
                              <div className="timeline-title">Đăng nhập thành công</div>
                              <div className="timeline-time">Hôm nay, 14:04</div>
                            </div>
                          </Timeline.Item>
                          <Timeline.Item 
                            color="blue"
                            dot={<EditOutlined className="timeline-icon" />}
                          >
                            <div className="timeline-content">
                              <div className="timeline-title">Cập nhật thông tin cá nhân</div>
                              <div className="timeline-time">2 ngày trước</div>
                            </div>
                          </Timeline.Item>
                          <Timeline.Item 
                            color="orange"
                            dot={<EyeOutlined className="timeline-icon" />}
                          >
                            <div className="timeline-content">
                              <div className="timeline-title">Xem chi tiết sản phẩm</div>
                              <div className="timeline-time">1 tuần trước</div>
                            </div>
                          </Timeline.Item>
                          <Timeline.Item 
                            dot={<UserOutlined className="timeline-icon" />}
                          >
                            <div className="timeline-content">
                              <div className="timeline-title">Tạo tài khoản</div>
                              <div className="timeline-time">{formatDate(userProfile.ngayTao)}</div>
                            </div>
                          </Timeline.Item>
                        </Timeline>
                      </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Card title="Thành tích" className="achievement-card">
                        <div className="achievement-list">
                          <div className="achievement-item">
                            <Badge count={1} className="achievement-badge">
                              <TrophyOutlined className="achievement-icon gold" />
                            </Badge>
                            <div className="achievement-info">
                              <Text strong>Thành viên mới</Text>
                              <br />
                              <Text type="secondary">Hoàn thành đăng ký</Text>
                            </div>
                          </div>
                          
                          <div className="achievement-item">
                            <Badge count={profileStrength >= 80 ? 1 : 0} className="achievement-badge">
                              <HeartOutlined className="achievement-icon red" />
                            </Badge>
                            <div className="achievement-info">
                              <Text strong>Hồ sơ hoàn chỉnh</Text>
                              <br />
                              <Text type="secondary">Hoàn thành 80% thông tin</Text>
                            </div>
                          </div>

                          <div className="achievement-item">
                            <Badge count={userProfile.trangThai ? 1 : 0} className="achievement-badge">
                              <StarOutlined className="achievement-icon blue" />
                            </Badge>
                            <div className="achievement-info">
                              <Text strong>Tài khoản đã xác thực</Text>
                              <br />
                              <Text type="secondary">Xác thực email thành công</Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              <TabPane 
                tab={
                  <span className="tab-title">
                    <SettingOutlined />
                    Cài đặt
                  </span>
                } 
                key="4"
              >
                <div className="tab-content fade-in">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card title="Tùy chọn hiển thị" className="settings-card">
                        <div className="setting-item">
                          <div className="setting-info">
                            <Text strong>Chế độ tối</Text>
                            <br />
                            <Text type="secondary">Bật chế độ tối cho giao diện</Text>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <Text strong>Ngôn ngữ</Text>
                            <br />
                            <Text type="secondary">Tiếng Việt</Text>
                          </div>
                          <Button size="small">Thay đổi</Button>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card title="Quyền riêng tư" className="settings-card">
                        <div className="setting-item">
                          <div className="setting-info">
                            <Text strong>Hiển thị thông tin công khai</Text>
                            <br />
                            <Text type="secondary">Cho phép người khác xem hồ sơ</Text>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <Text strong>Nhận email marketing</Text>
                            <br />
                            <Text type="secondary">Nhận thông tin ưu đãi</Text>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      ) : (
        <div className="error-container">
          <Title level={3}>Không thể tải thông tin tài khoản</Title>
          <Button type="primary" onClick={loadUserProfile}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      <Modal
        title={
          <div className="modal-title">
            <LockOutlined />
            <span>Đổi mật khẩu</span>
          </div>
        }
        open={changePasswordModal}
        onCancel={() => {
          setChangePasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={600}
        className="password-modal"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="password-form"
        >
          <Alert
            message="Bảo mật tài khoản"
            description="Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số."
            type="info"
            showIcon
            className="password-alert"
          />

          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
            ]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu hiện tại" 
              className="password-input"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            dependencies={["currentPassword"]}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('currentPassword') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu mới không được trùng mật khẩu hiện tại'));
                },
              })
            ]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu mới" 
              className="password-input"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Nhập lại mật khẩu mới" 
              className="password-input"
            />
          </Form.Item>

          <Form.Item className="password-actions">
            <Space size="large">
              <Button 
                size="large"
                onClick={() => {
                  setChangePasswordModal(false);
                  passwordForm.resetFields();
                }}
                className="cancel-btn"
              >
                Hủy bỏ
              </Button>
              <Button 
                type="primary" 
                size="large"
                htmlType="submit"
                loading={passwordLoading}
                icon={<SaveOutlined />}
                className="submit-btn"
              >
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAccount;