// frontend/audi/src/context/pages/admin/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Tag, Button, List } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../AuthContext';
import { fetchUserProfile } from '../../../services/authService';

const { Title, Text } = Typography;

// Hàm lấy emoji cờ quốc gia
const getCountryFlag = (country: string) => {
  switch ((country || '').toLowerCase()) {
    case 'việt nam':
    case 'vietnam':
      return '🇻🇳';
    case 'usa':
    case 'us':
    case 'mỹ':
      return '🇺🇸';
    // Thêm các quốc gia khác nếu cần
    default:
      return '🏳️';
  }
};

// Mock data
const supportMessages = [
  {
    id: 1,
    sender: 'Audi Team',
    avatar: '/avatar-default.png',
    content: 'Lịch họp nội bộ vào 10h sáng mai, vui lòng tham dự đúng giờ.',
    createdAt: '2024-07-20 09:00'
  },
  {
    id: 2,
    sender: 'Audi Support',
    avatar: '/avatar-default.png',
    content: 'Bạn có yêu cầu hỗ trợ mới từ khách hàng #1234.',
    createdAt: '2024-07-19 15:30'
  }
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(user);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const getProfile = async () => {
      if (user?.token) {
        const data = await fetchUserProfile(user.token);
        console.log('API profile data:', data); // Thêm dòng này để kiểm tra dữ liệu thực tế
        setProfile({
          ...profile,
          ...data,
          fullName: `${data.ho || ''} ${data.ten || ''}`.trim(),
          phone: data.soDienThoai || data.so_dien_thoai || '',
          trangThai: data.trangThai,
          quoc_gia: data.quoc_gia || data.quocGia || 'Việt Nam',
          vung: data.vung || data.region || '',
          dia_chi: data.dia_chi || data.diaChi || data.address || '',
          thanh_pho: data.thanh_pho || data.thanhPho || data.city || '',
          tinh: data.tinh || data.province || '',
          ma_buu_dien: data.ma_buu_dien || data.maBuuDien || data.postal_code || '',
          tuoi: data.tuoi || data.age || '',
          gioi_tinh: data.gioi_tinh || data.gender || '',
        });
      }
    };
    getProfile();

    async function fetchMessages() {
      const res = await fetch('/api/v1/messages/support');
      const data = await res.json();
      setMessages(data);
    }
    fetchMessages();
  }, [user?.token]);

  // Avatar
  const getAvatar = () => {
    if (profile?.avatar) {
      const avatarUrl = profile.avatar.startsWith('http')
        ? profile.avatar
        : `http://localhost:8080/${profile.avatar}`;
      return <Avatar size={96} src={avatarUrl} />;
    }
    const initials = profile?.fullName
      ? profile.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase()
      : 'A';
    return (
      <Avatar size={96} style={{ background: '#1976d2', fontSize: 36, fontWeight: 700 }}>
        {initials}
      </Avatar>
    );
  };

  // Vai trò
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'QUAN_TRI':
      case 'admin':
        return 'gold'; // đổi thành vàng
      case 'nhan_vien':
        return 'blue';
      case 'khach_hang':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 0 }}>
      {/* Banner */}
      <div style={{
        width: '100%',
        height: 250, // Tăng chiều cao banner
        background: 'linear-gradient(90deg, #b6e0fe 0%, #a7f3d0 100%)',
        borderRadius: '0 0 32px 32px',
        marginBottom: -150, // Đẩy content xuống sâu hơn
      }} />
      <div style={{
        maxWidth: 1100,
        width: '90vw',
        minWidth: 600,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.08)',
        padding: '32px 40px 40px 40px',
        position: 'relative',
        marginTop: 70,
      }}>
        {/* Avatar + Edit */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ marginRight: 32 }}>
            {getAvatar()}
          </div>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0, color: '#1976d2', fontWeight: 700 }}>
              {profile?.fullName || 'Admin'}
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 24 }}>
                {getCountryFlag(profile?.quoc_gia)}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  margin: '0 10px',
                  fontSize: 24,
                  color: '#888',
                  fontWeight: 400,
                  marginTop:-5
                }}
              >
                |
              </span>
              <Text
                style={{
                  fontSize: 16,
                  color: '#888',
                  marginRight: 16,
                  whiteSpace: 'nowrap',
                  overflow: 'auto',
                  display: 'block',
                  maxWidth: 900
                }}
              >
                {profile?.dia_chi || '...'}, {profile?.thanh_pho || '...'}, {profile?.tinh || '...'}, {profile?.ma_buu_dien || '...'}
              </Text>
              <Text style={{ fontSize: 16, marginRight: 16 }}>
                {profile?.quoc_gia || 'Chưa cập nhật'}
              </Text>
            </div>
          </div>
          <Button type="primary" icon={<EditOutlined />}>Chỉnh sửa hồ sơ</Button>
        </div>
        {/* Thông tin chi tiết */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px 64px',
          marginTop: 16,
        }}>
          <div>
            <Text strong>Tuổi:</Text> <Text>{profile?.tuoi || 'Chưa cập nhật'}</Text>
          </div>
          <div>
            <Text strong>Giới tính:</Text> <Text>{profile?.gioi_tinh || 'Chưa cập nhật'}</Text>
          </div>
          <div>
            <Text strong>Trạng thái:</Text>
            {profile?.trangThai === true ? (
              <Tag color="success" style={{ marginLeft: 8 }}>Đang hoạt động</Tag>
            ) : (
              <Tag color="error" style={{ marginLeft: 8 }}>Bị khóa</Tag>
            )}
          </div>
          <div>
            <Text strong>Vai trò:</Text>
            <Tag
              color={profile?.role === 'QUAN_TRI' ? 'gold' : getRoleColor(profile?.role || '')}
              style={{ marginLeft: 8, fontWeight: 500 }}
            >
              {profile?.role === 'QUAN_TRI' && <SafetyCertificateOutlined style={{ marginRight: 4 }} />}
              {profile?.role === 'QUAN_TRI' ? 'Quản trị viên' : profile?.role}
            </Tag>
          </div>
          <div>
            <Text strong>Email:</Text> <Text>{profile?.email || 'Chưa cập nhật'}</Text>
          </div>
          <div>
            <Text strong>Số điện thoại:</Text> <Text>{profile?.phone || 'Chưa cập nhật'}</Text>
          </div>
        </div>
      </div>

      <Card
        title="Tin nhắn hỗ trợ từ Audi Team"
        style={{
          maxWidth: 1100,
          width: '90vw',
          minWidth: 600,
          margin: '32px auto 0 auto', // cách biệt với card trên
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.08)',
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={supportMessages}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={<span>{item.sender} <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{item.createdAt}</span></span>}
                description={item.content}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Profile;