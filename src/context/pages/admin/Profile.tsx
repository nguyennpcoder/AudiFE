// frontend/audi/src/context/pages/admin/Profile.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Card, Avatar, Typography, Tag, Button, List, Input, Space, Divider, Badge, Tooltip, Popconfirm } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SafetyCertificateOutlined, 
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
  SettingOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  SendOutlined,
  SmileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../AuthContext';
import { fetchUserProfile, buildAvatarUrl } from '../../../services/authService';
import defaultAvatar from '../../../assets/rs7.jpeg';
import avatarTeam from '../../../assets/rs6.jpg';
import avatarSupport from '../../../assets/a7.jpg';
import avatarSales from '../../../assets/audi-rs7.jpeg';

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
  const DEFAULT_AVATAR = defaultAvatar as unknown as string;
  const ROOM_AVATAR: Record<string, string> = {
    team: (avatarTeam as unknown as string) || DEFAULT_AVATAR,
    support: (avatarSupport as unknown as string) || DEFAULT_AVATAR,
    sales: (avatarSales as unknown as string) || DEFAULT_AVATAR
  };
  const [latestByRoom, setLatestByRoom] = useState<Record<string, any>>({});
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, boolean>>({ team: true, support: true, sales: true });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [threadInput, setThreadInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [userCache, setUserCache] = useState<Record<string, { name: string; avatar?: string }>>({});

  const formatTime = (input: string) => {
    if (!input) return '';
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    // Fallback: strip fractional seconds and replace T with space
    return input.replace(/\.\d{3,}$/,'').replace('T',' ');
  };

  type ChatMessage = {
    id: string;
    from: string;
    text: string;
    time: string;
    avatar: string;
    recalled?: boolean;
    da_xoa?: boolean;
  };

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
      try {
        const res = await fetch('/api/v1/messages/support');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (_) {
        setMessages([]);
      }
    }
    fetchMessages();
    const timer = setInterval(fetchMessages, 10000);
    return () => clearInterval(timer);
  }, [user?.token]);

  // Load latest message for each room to show preview
  useEffect(() => {
    const controller = new AbortController();
    async function loadLatest(room: string) {
      try {
        const res = await fetch(`/api/v1/chat/${room}?page=0&size=1`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          const latest = (data.content && data.content.length > 0) ? data.content[0] : null;
          setLatestByRoom(prev => ({ ...prev, [room]: latest }));
        }
      } catch {}
    }
    ['team', 'support', 'sales'].forEach(loadLatest);
    const iv = setInterval(() => ['team', 'support', 'sales'].forEach(loadLatest), 5000);
    return () => { controller.abort(); clearInterval(iv); };
  }, []);

  // Fetch real chat thread when a room is opened
  useEffect(() => {
    const abort = new AbortController();
    async function loadThread() {
      if (!activeThread) return;
      try {
        const room = activeThread.room || 'team';
        const res = await fetch(`/api/v1/chat/${room}?page=0&size=30`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
          signal: abort.signal
        });
        if (res.ok) {
          const data = await res.json();
          const list = (data.content || []).reverse();
          setActiveThread((prev: any) => prev ? {
            ...prev,
            messages: list.map((m: any) => ({
              id: m.id,
              from: m.senderName || m.senderId,
              fromId: m.senderId,
              text: m.content,
              time: m.createdAt,
              avatar: buildAvatarUrl(m.senderAvatar),
              recalled: m.recalled === true || m.isDeleted === true,
              da_xoa: m.da_xoa === true || m.daXoa === 1
            }))
          } : prev);
          // Resolve latest names/avatars for senders
          const uniqueIds = Array.from(new Set((list || []).map((m: any) => String(m.senderId)).filter((v: string) => !!v))) as string[];
          const needFetch = uniqueIds.filter((id: string) => !userCache[id]);
          if (needFetch.length > 0) {
            Promise.all(needFetch.map(async (id: string) => {
              try {
                const res = await fetch(`/api/v1/nguoi-dung/${id}`, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
                });
                if (!res.ok) return null;
                const u = await res.json();
                return { id, name: `${u.ho || ''} ${u.ten || ''}`.trim() || (u.fullName || ''), avatar: u.avatar || u.anh_dai_dien };
              } catch { return null; }
            })).then((results) => {
              const updates: Record<string, { name: string; avatar?: string }> = {};
              results.forEach((r: any) => { if (r && r.id) updates[r.id] = { name: r.name, avatar: r.avatar }; });
              if (Object.keys(updates).length > 0) {
                setUserCache(prev => ({ ...prev, ...updates }));
                setActiveThread((prev: any) => prev ? {
                  ...prev,
                  messages: (prev.messages || []).map((m: any) => {
                    const info = updates[String(m.fromId)] || userCache[String(m.fromId)];
                    return info ? { ...m, from: info.name || m.from, avatar: (m.avatar || buildAvatarUrl(info?.avatar)) } : m;
                  })
                } : prev);
              }
            });
          }
        }
      } catch {}
    }
    loadThread();
    const iv = setInterval(loadThread, 4000);
    return () => { abort.abort(); clearInterval(iv); };
  }, [activeThread?.id, activeThread?.room]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages?.length]);

  // Recall message (unsend)
  const recallMessage = async (room: string, messageId: string) => {
    // Optimistic update
    setActiveThread((prev: any) => prev ? {
      ...prev,
      messages: (prev.messages || []).map((m: ChatMessage) => m.id === messageId ? { ...m, recalled: true, da_xoa: true, text: 'Tin nhắn đã được thu hồi' } : m)
    } : prev);

    try {
      const auth = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
      await fetch(`/api/v1/chat/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ da_xoa: true, recalled: true })
      });
      setTimeout(() => {
        setActiveThread((prev: any) => prev ? { ...prev } : prev);
      }, 300);
    } catch {}
  };

  // Send message helper
  const sendMessage = () => {
    if (!activeThread) return;
    const newMsg = (threadInput || '').trim();
    if (!newMsg) return;
    const payload = {
      room: activeThread.room || 'team',
      senderId: user?.userId,
      senderName: profile?.fullName || 'Bạn',
      senderAvatar: profile?.avatar || '',
      content: newMsg
    };
    fetch('/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(payload)
    }).catch(() => {});
    setActiveThread({
      ...activeThread,
      messages: [...(activeThread.messages || []), {
        id: `${activeThread.id}-${Date.now()}`,
        from: profile?.fullName || 'Bạn',
        text: newMsg,
        time: new Date().toISOString(),
        avatar: buildAvatarUrl(profile?.avatar) || DEFAULT_AVATAR
      }]
    });
    setThreadInput('');
  };

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
          <Button
            type="primary"
            icon={<EditOutlined />}
            shape="round"
            style={{
              padding: '0 16px',
              height: 38,
              boxShadow: '0 4px 12px rgba(25,118,210,0.25)'
            }}
          >
            Chỉnh sửa hồ sơ
          </Button>
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

      {/* Team chat nội bộ – Instagram style two-pane */}
      <Card
        title={<span style={{ color: '#0f172a', fontWeight: 800 }}>Team chat nội bộ</span>}
        styles={{ header: { borderBottom: 'none', padding: '12px 16px' }, body: { padding: 0 } }}
        style={{
          maxWidth: 1100,
          width: '90vw',
          minWidth: 600,
          margin: '32px auto 0 auto',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.08)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '72vh' }}>
          {/* Sidebar (threads) */}
          <div style={{ borderRight: '1px solid #eef2f7', padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <List
              style={{ paddingLeft: 0, margin: 0, textAlign: 'left', height: '100%', overflow: 'auto' }}
              itemLayout="horizontal"
              dataSource={([
                { id: 'room-team', sender: 'Audi Team', avatar: ROOM_AVATAR['team'], room: 'team' },
                { id: 'room-support', sender: 'Audi Support', avatar: ROOM_AVATAR['support'], room: 'support' },
                { id: 'room-sales', sender: 'Audi Sales', avatar: ROOM_AVATAR['sales'], room: 'sales' }
              ].map((it) => ({
                ...it,
                createdAt: latestByRoom[it.room]?.createdAt || '',
                content: latestByRoom[it.room]?.content || '— Chưa có tin nhắn —'
              })))}
              renderItem={(item: any) => {
                const createdAt = item.createdAt ? formatTime(item.createdAt) : '';
                const sender = item.sender;
                const avatar = item.avatar || DEFAULT_AVATAR;
                const content = item.content || '';
                const unread = unreadByRoom[item.room] === true;
                const selected = activeThread?.room === item.room;
                return (
                  <List.Item
                    onClick={() => {
                      const room = item.room;
                      setActiveThread({
                        id: item.id,
                        title: sender,
                        room,
                        roomAvatar: ROOM_AVATAR[room] || DEFAULT_AVATAR,
                        participants: [sender, profile?.fullName || 'Bạn'],
                        messages: [
                          { id: `${item.id}-1`, from: sender, text: content, time: createdAt, avatar },
                        ]
                      });
                      setIsChatOpen(true);
                      setUnreadByRoom(prev => ({ ...prev, [room]: false }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 8px',
                      margin: '4px 0',
                      borderRadius: 12,
                      background: selected ? '#f8fafc' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-start' }}>
                      <div style={{ position: 'relative' }}>
                        <Avatar src={avatar} />
                        {unread && (
                          <span style={{ position: 'absolute', right: -2, top: -2, width: 10, height: 10, borderRadius: '50%', background: '#1890ff' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: unread ? 700 as any : 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: unread ? '#0f172a' : '#34495e' }}>{sender}</span>
                          {createdAt && (
                            <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>{createdAt}</span>
                          )}
                        </div>
                        <div style={{
                          marginTop: 4,
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          lineHeight: 1.6,
                          textAlign: 'left',
                          color: unread ? '#0f172a' : '#64748b',
                          fontWeight: unread ? 600 : 400
                        }}>
                          {content}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
          {/* Conversation */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* Chat header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', gap: 12 }}>
              {activeThread ? (
                <>
                  <Avatar src={(activeThread.roomAvatar) || ROOM_AVATAR[activeThread.room] || DEFAULT_AVATAR} />
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{activeThread.title}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Nội bộ @admin</div>
                  </div>
                </>
              ) : (
                <div style={{ fontWeight: 600, color: '#94a3b8' }}>Chọn một cuộc trò chuyện</div>
              )}
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 8px 16px', background: '#ffffff', minHeight: 0 }}>
              {(activeThread?.messages || []).map((msg: ChatMessage) => {
                const isMine = (profile?.fullName || 'Bạn') === msg.from;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                    {!isMine && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Avatar
                          src={(msg.from === (profile?.fullName || 'Bạn')) ? (buildAvatarUrl(profile?.avatar) || DEFAULT_AVATAR) : (msg.avatar || ROOM_AVATAR[activeThread?.room || 'team'] || DEFAULT_AVATAR)}
                          onError={() => true}
                        />
                        <div>
                          {/* Sender full name for group chats */}
                          <div style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px 4px' }}>{msg.from}</div>
                          <div
                            style={{
                              background: '#f1f5f9',
                              color: '#0f172a',
                              padding: '8px 12px',
                              borderRadius: 18,
                              maxWidth: 420,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                            }}
                          >
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{formatTime(msg.time)}</div>
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: (msg.da_xoa || msg.recalled) ? '#94a3b8' : '#0f172a', fontStyle: (msg.da_xoa || msg.recalled) ? 'italic' as any : 'normal' }}>
                              {(msg.da_xoa || msg.recalled) ? 'Tin nhắn đã được thu hồi' : msg.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {isMine && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div
                          style={{
                            background: '#e3f2fd',
                            color: '#0f172a',
                            padding: '8px 12px',
                            borderRadius: 18,
                            maxWidth: 420,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}
                        >
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{formatTime(msg.time)}</div>
                          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: (msg.da_xoa || msg.recalled) ? '#94a3b8' : '#0f172a', fontStyle: (msg.da_xoa || msg.recalled) ? 'italic' as any : 'normal' }}>
                            {(msg.da_xoa || msg.recalled) ? 'Tin nhắn đã được thu hồi' : msg.text}
                          </div>
                        </div>
                        {!(msg.da_xoa || msg.recalled) && (
                          <Tooltip title="Thu hồi tin nhắn">
                            <Popconfirm
                              title="Thu hồi tin nhắn?"
                              okText="Thu hồi"
                              cancelText="Hủy"
                              onConfirm={() => recallMessage(activeThread?.room || 'team', msg.id)}
                           >
                              <Button
                                size="small"
                                type="default"
                                shape="circle"
                                icon={<EllipsisOutlined />}
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                              />
                            </Popconfirm>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {/* Composer */}
            <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #eef2f7' }}>
              <Input.TextArea
                value={threadInput}
                onChange={(e) => setThreadInput(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 2 }}
                style={{ resize: 'none', color: '#0f172a', background: '#ffffff' }}
                rootClassName="composer-input"
                onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Nhập tin nhắn..."
                allowClear
              />
              <Button
                type="primary"
                disabled={!threadInput.trim() || !activeThread}
                icon={<SendOutlined />}
                shape="round"
                style={{ height: 38, padding: '0 16px', fontWeight: 600, boxShadow: '0 4px 12px rgba(25,118,210,0.25)' }}
                onClick={sendMessage}
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;