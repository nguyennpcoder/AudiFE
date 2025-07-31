import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined, CameraOutlined } from '@ant-design/icons';

import { blogService, BaiViet } from '../../../services/blogService';
import '../../../styles/Admin.css';
import AdminHeader from './AdminHeader';
import AnimatedPage from './AnimatedPage';

const danhMucOptions = [
  { value: 'tin_tuc', label: 'Tin tức' },
  { value: 'danh_gia', label: 'Đánh giá' },
  { value: 'cong_nghe', label: 'Công nghệ' },
  { value: 'su_kien', label: 'Sự kiện' },
  { value: 'meo', label: 'Mẹo' },
  { value: 'phong_cach_song', label: 'Phong cách sống' },
];

const BlogManagement: React.FC = () => {
  const [data, setData] = useState<BaiViet[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BaiViet | null>(null);
  const [viewing, setViewing] = useState<BaiViet | null>(null);
  const [filterDanhMuc, setFilterDanhMuc] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageHover, setIsImageHover] = useState(false);

  // Thêm states cho hover avatar
  const [hoveredBlogId, setHoveredBlogId] = useState<number | null>(null);
  const [hoveredBlogImgPos, setHoveredBlogImgPos] = useState<{ x: number; y: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await blogService.getAllBaiViet();
      setData(result);
    } catch (error: any) {
      message.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: FormData) => {
    setFormLoading(true);
    setFormError(null);
    
    try {
      if (editing) {
        await blogService.updateBaiViet(editing.id!, formData);
        message.success('Cập nhật thành công');
      } else {
        const newBaiViet = await blogService.createBaiViet(formData);
        message.success('Thêm mới thành công');
        
        // Tự động xuất bản bài viết mới
        try {
          await blogService.updatePublishStatus(newBaiViet.id!, true);
          message.success('Bài viết đã được xuất bản');
        } catch (publishError: any) {
          console.warn('Không thể tự động xuất bản:', publishError);
        }
      }
      
      setShowForm(false);
      setEditing(null);
      setImageFile(null);
      setImagePreview(null);
      fetchData();
    } catch (error: any) {
      setFormError(error.message);
      message.error(error.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await blogService.deleteBaiViet(id);
      message.success('Đã xóa');
      fetchData();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handlePublish = async (id: number, daXuatBan: boolean) => {
    try {
      await blogService.updatePublishStatus(id, daXuatBan);
      message.success(daXuatBan ? 'Đã xuất bản' : 'Đã bỏ xuất bản');
      fetchData(); // Refresh data sau khi update
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Thêm function helper để xử lý đường dẫn ảnh
  const getImageUrl = (imagePath: string | undefined): string | undefined => {
    if (!imagePath) return undefined;
    
    // Nếu đã có đường dẫn đầy đủ
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('http')) {
      return `http://localhost:8080${imagePath}`;
    }
    
    // Nếu chỉ có tên file
    return `http://localhost:8080/uploads/images/blogs/${imagePath}`;
  };

  // Reset form when editing changes
  useEffect(() => {
    if (editing) {
      if (editing.anhDaiDien) {
        // Sử dụng helper function để lấy đường dẫn đúng
        setImagePreview(getImageUrl(editing.anhDaiDien) || null);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editing, showForm]);

  const filteredData = data.filter(item =>
    (!filterDanhMuc || item.danhMuc === filterDanhMuc) &&
    (!search || item.tieuDe.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 0 }}>
      <AdminHeader pageTitle="Quản lý bài viết" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0 0 0', minHeight: '100vh' }}>
        <AnimatedPage animation="center">
          {/* Khối trắng bo góc lớn */}
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
              <button
                className="btn-add"
                onClick={() => { setShowForm(true); setEditing(null); }}
                style={{
                  background: '#43a047',
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
                <i className="fas fa-plus"></i> Thêm bài viết
              </button>
              <select
                value={filterDanhMuc}
                onChange={e => setFilterDanhMuc(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  color: 'rgb(107, 114, 128)',
                  fontSize: 15,
                  background: '#fafbfc',
                  minWidth: 150
                }}
              >
                <option value="">Danh mục</option>
                {danhMucOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm tiêu đề"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                    }}
                  />
                  <i className="fas fa-search" style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888',
                    fontSize: 16
                  }}></i>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div style={{ overflowX: 'auto', borderRadius: 12, background: '#fafbfc' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tiêu đề</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Danh mục</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tác giả</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Ngày đăng</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tags</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có dữ liệu</td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className="table-row-fadein"
                        style={{ 
                          background: '#fff', 
                          borderBottom: '1px solid #f0f0f0',
                          animationDelay: `${idx * 120}ms` 
                        }}
                        onMouseEnter={e => {
                          setHoveredBlogId(item.id!);
                          setHoveredBlogImgPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={e => {
                          setHoveredBlogImgPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => {
                          setHoveredBlogId(null);
                          setHoveredBlogImgPos(null);
                        }}
                      >
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           
                            <span style={{ flex: 1 }}>{item.tieuDe}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>{danhMucOptions.find(o => o.value === item.danhMuc)?.label}</td>
                        <td style={{ padding: '10px 8px' }}>{item.tenTacGia}</td>
                        <td style={{ padding: '10px 8px' }}>{item.ngayDang}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {item.theGan?.map((tag: string) => (
                            <span key={tag} style={{
                              display: 'inline-block',
                              background: '#f3f4f6',
                              color: '#555',
                              borderRadius: 8,
                              padding: '2px 10px',
                              fontSize: 13,
                              marginRight: 4,
                              marginBottom: 2,
                              fontWeight: 500
                            }}>{tag}</span>
                          ))}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: item.daXuatBan ? '#e8f5e9' : '#ffebee',
                            color: item.daXuatBan ? '#43a047' : '#e53935',
                            borderRadius: 8,
                            padding: '2px 14px',
                            fontWeight: 600,
                            fontSize: 14
                          }}>
                            {item.daXuatBan ? 'Đã xuất bản' : 'Nháp'}
                          </span>
                        </td>
                        <td style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          minWidth: 120, // Giảm minWidth vì bớt nút
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}>
                            <button 
                              className="btn-view" 
                              title="Xem" 
                              onClick={() => setViewing(item)}
                              onMouseEnter={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              onMouseMove={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              onMouseLeave={e => {
                                // Nếu chuột vẫn nằm trên dòng <tr> thì set lại hover
                                const tr = e.currentTarget.closest('tr');
                                if (tr && tr.matches(':hover')) {
                                  setHoveredBlogId(item.id!);
                                  setHoveredBlogImgPos({ x: e.clientX, y: e.clientY });
                                }
                              }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn-edit" 
                              title="Sửa" 
                              onClick={() => { setEditing(item); setShowForm(true); }}
                              onMouseEnter={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              onMouseMove={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              onMouseLeave={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn-publish"
                              title={item.daXuatBan ? "Bỏ xuất bản" : "Xuất bản"}
                              onClick={() => handlePublish(item.id!, !item.daXuatBan)}
                              onMouseEnter={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              onMouseMove={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              onMouseLeave={() => { setHoveredBlogId(null); setHoveredBlogImgPos(null); }}
                              style={{
                                background: item.daXuatBan ? '#ff4d4f' : '#43a047',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 12px',
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 36,
                                height: 36,
                              }}
                            >
                              <i className={`fas ${item.daXuatBan ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedPage>
      </div>
      
      {/* Modal Form Add/Edit */}
      {(showForm) && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>
                {editing ? "Sửa bài viết" : "Thêm bài viết"}
              </h2>
              <button
                className="admin-modal-close"
                onClick={() => { 
                  setShowForm(false); 
                  setEditing(null); 
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  // Tạo FormData từ form
                  const formData = new FormData(e.currentTarget);
                  
                  // Thêm image file nếu có
                  if (imageFile) {
                    formData.append('anhDaiDien', imageFile);
                  }
                  
                  // Thêm idTacGia (lấy từ user hiện tại hoặc hardcode)
                  formData.append('idTacGia', '1'); // Thay bằng ID user thực tế
                  
                  // Xử lý tags
                  const tagsValue = formData.get('theGan') as string;
                  if (tagsValue) {
                    const tags = tagsValue.split(',').map(t => t.trim()).filter(Boolean);
                    formData.set('theGan', tags.join(',')); // Gửi string thay vì JSON
                  }
                  
                  // Gọi handleSave với FormData
                  await handleSave(formData);
                }}
              >
                {/* Image Upload Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                  <label
                    htmlFor="anhDaiDien"
                    className={`avatar-upload-label${imagePreview ? ' has-avatar' : ''}${isImageHover ? ' hover' : ''}`}
                    onMouseEnter={() => setIsImageHover(true)}
                    onMouseLeave={() => setIsImageHover(false)}
                    style={{
                      position: 'relative',
                      width: 120,
                      height: 90,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 2px 12px 0 rgba(24,144,255,0.10)',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <img
                      src={imagePreview ? 
                        (imagePreview.startsWith('http') ? imagePreview : getImageUrl(imagePreview)) 
                        : '/avatar-default.png'
                      }
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        display: 'block',
                        transition: 'filter 0.2s',
                        filter: imagePreview ? 'none' : 'grayscale(1) opacity(0.7)',
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/avatar-default.png';
                      }}
                    />
                    {(!imagePreview || isImageHover) && (
                      <div className="avatar-upload-overlay">
                        <CameraOutlined className={`avatar-upload-icon${isImageHover ? ' show' : ''}`} />
                      </div>
                    )}
                    <input
                      type="file"
                      id="anhDaiDien"
                      name="anhDaiDien"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>Chọn ảnh đại diện bài viết</div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tieuDe">Tiêu đề <span className="required">*</span></label>
                    <input
                      type="text"
                      id="tieuDe"
                      name="tieuDe"
                      defaultValue={editing?.tieuDe || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="noiDung">Nội dung <span className="required">*</span></label>
                  <textarea
                    id="noiDung"
                    name="noiDung"
                    defaultValue={editing?.noiDung || ''}
                    rows={6}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                    }}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="danhMuc">Danh mục <span className="required">*</span></label>
                    <select
                      id="danhMuc"
                      name="danhMuc"
                      defaultValue={editing?.danhMuc || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    >
                      <option value="" disabled>Chọn danh mục</option>
                      {danhMucOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="theGan">Tags</label>
                    <input
                      type="text"
                      id="theGan"
                      name="theGan"
                      defaultValue={editing?.theGan?.join(', ') || ''}
                      placeholder="Nhập tags, cách nhau bởi dấu phẩy"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 15,
                        background: '#fafbfc',
                        color: '#333',
                      }}
                    />
                    <small>Ví dụ: audi, xe sang, review</small>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowForm(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                      marginRight: 10,
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={formLoading}
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
                    {formLoading ? 'Đang xử lý...' : (editing ? "Cập nhật" : "Thêm mới")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal View - giữ nguyên phần này */}
      {viewing && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            padding: 0,
            minWidth: 600,
            maxWidth: 700,
          }}>
            <div
              className="admin-modal-header"
              style={{
                background: 'linear-gradient(90deg, #1890ff 0%, #43a047 100%)',
                borderRadius: '18px 18px 0 0',
                padding: '22px 32px 18px 32px',
                color: '#fff',
                fontWeight: 700,
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: 0
              }}
            >
              <span>Xem chi tiết bài viết</span>
              <button
                onClick={() => setViewing(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form style={{ padding: '28px 32px 0 32px' }}>
              {/* Tiêu đề & Ảnh đại diện */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Tiêu đề</label>
                  <input
                    type="text"
                    value={viewing.tieuDe}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block', textAlign: 'center' }}>Ảnh đại diện</label>
                  {viewing.anhDaiDien ? (
                    <img
                      src={getImageUrl(viewing.anhDaiDien)}
                      alt="Ảnh đại diện"
                      style={{
                        maxWidth: 120,
                        maxHeight: 90,
                        borderRadius: 12,
                        background: '#f5f5f5',
                        padding: 4,
                        objectFit: 'cover',
                        display: 'block',
                        margin: '0 auto',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 120, height: 90, background: '#f5f5f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', border: '1px solid #e5e7eb'
                    }}>Không có ảnh</div>
                  )}
                </div>
              </div>
              {/* Danh mục & Tác giả */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Danh mục</label>
                  <input
                    type="text"
                    value={danhMucOptions.find(o => o.value === viewing.danhMuc)?.label || ''}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Tác giả</label>
                  <input
                    type="text"
                    value={viewing.tenTacGia}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              {/* Ngày đăng & Trạng thái */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Ngày đăng</label>
                  <input
                    type="text"
                    value={viewing.ngayDang}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: '#fafbfc',
                      color: '#333',
                      width: '100%',
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Trạng thái</label>
                  <input
                    type="text"
                    value={viewing.daXuatBan ? 'Đã xuất bản' : 'Nháp'}
                    readOnly
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 15,
                      background: viewing.daXuatBan ? '#e8f5e9' : '#ffebee',
                      color: viewing.daXuatBan ? '#43a047' : '#e53935',
                      width: '100%',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
              {/* Tags */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Tags</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {viewing.theGan && viewing.theGan.length > 0 ? viewing.theGan.map((tag: string) => (
                    <span key={tag} style={{
                      display: 'inline-block',
                      background: '#e8f5e9',
                      color: '#43a047',
                      borderRadius: 16,
                      padding: '4px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      border: '1px solid #c8e6c9'
                    }}>{tag}</span>
                  )) : <span style={{ color: '#888' }}>Không có</span>}
                </div>
              </div>
              {/* Nội dung */}
              <div>
                <label style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8, fontSize: 14, display: 'block' }}>Nội dung</label>
                <textarea
                  value={viewing.noiDung}
                  readOnly
                  rows={5}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 15,
                    background: '#f5f5f5',
                    color: '#222',
                    minHeight: 100,
                    width: '100%',
                    fontWeight: 500,
                    resize: 'none',
                  }}
                />
              </div>
              <div style={{ height: 24 }} /> {/* Khoảng cách dưới cùng */}
            </form>
          </div>
        </div>
      )}

      {/* Hover image effect */}
      {hoveredBlogId && hoveredBlogImgPos && (() => {
        const blog = data.find(b => b.id === hoveredBlogId);
        if (!blog || !blog.anhDaiDien) return null;
        
        const imgUrl = getImageUrl(blog.anhDaiDien);
        if (!imgUrl) return null;
        
        const offsetX = -320;
        const offsetY = -100;
        
        return (
          <div
            className="blog-hover-image"
            style={{
              position: 'fixed',
              left: hoveredBlogImgPos.x + offsetX,
              top: hoveredBlogImgPos.y + offsetY,
              zIndex: 9999,
              pointerEvents: 'none',
              background: 'transparent',
              boxShadow: 'none',
              borderRadius: 0
            }}
          >
            <img
              src={imgUrl}
              alt="Ảnh đại diện bài viết"
              style={{
                width: 120,
                height: 90,
                objectFit: 'cover',
                borderRadius: 8,
                border: '4px solid #fff',
                boxShadow: '0 2px 12px 0 rgba(24,144,255,0.10)'
              }}
            />
          </div>
        );
      })()}
    </div>
  );
};

export default BlogManagement;