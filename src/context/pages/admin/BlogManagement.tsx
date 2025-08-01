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
  
  // Thêm states cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
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
        // Thêm trường daXuatBan = false để đảm bảo bài viết chuyển về nháp sau khi edit
        formData.append('daXuatBan', 'false');
        
        await blogService.updateBaiViet(editing.id!, formData);
        message.success('Cập nhật thành công - Bài viết đã chuyển về trạng thái nháp');
        
        // Fetch lại dữ liệu để có thông tin mới nhất
        await fetchData();
        
        // Tìm bài viết đã được cập nhật trong danh sách mới
        const updatedBlog = data.find(blog => blog.id === editing.id);
        if (updatedBlog) {
          // Đảm bảo trạng thái là nháp
          const blogWithDraftStatus = {
            ...updatedBlog,
            daXuatBan: false
          };
          // Chuyển sang view mode với dữ liệu đã cập nhật
          setViewing(blogWithDraftStatus);
        } else {
          // Nếu không tìm thấy, sử dụng dữ liệu editing hiện tại với trạng thái nháp
          const editingWithDraftStatus = {
            ...editing,
            daXuatBan: false
          };
          setViewing(editingWithDraftStatus);
        }
        
        setShowForm(false);
        setEditing(null);
        setImageFile(null);
        setImagePreview(null);
      } else {
        const newBaiViet = await blogService.createBaiViet(formData);
        message.success('Thêm mới thành công - Bài viết đã được lưu dưới dạng bản nháp');
        
        // Không tự động xuất bản nữa - để mặc định là bản nháp
        // try {
        //   await blogService.updatePublishStatus(newBaiViet.id!, true);
        //   message.success('Bài viết đã được xuất bản');
        // } catch (publishError: any) {
        //   console.warn('Không thể tự động xuất bản:', publishError);
        // }
        
        setShowForm(false);
        setEditing(null);
        setImageFile(null);
        setImagePreview(null);
        fetchData();
      }
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

  // Tạo danh sách placeholder images từ Ant Design
  const placeholderImages = [
    'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    'https://gw.alipayobjects.com/zos/rmsportal/DkKNubTaaVsKwUzKzQhQ.png',
    'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
    'https://gw.alipayobjects.com/zos/rmsportal/rMSqrFDLlkZjfWKXoQpa.png'
  ];

  // Lấy placeholder image ngẫu nhiên
  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log('Image preview URL created:', previewUrl);
    }
  };

  // Thêm function helper để xử lý đường dẫn ảnh
  const getImageUrl = (imagePath: string | undefined): string | undefined => {
    if (!imagePath) return getRandomPlaceholder();
    
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
        setImagePreview(getImageUrl(editing.anhDaiDien) || getRandomPlaceholder());
      } else {
        setImagePreview(getRandomPlaceholder());
      }
    } else {
      setImagePreview(getRandomPlaceholder());
    }
    setImageFile(null);
  }, [editing, showForm]);

  const filteredData = data.filter(item =>
    (!filterDanhMuc || item.danhMuc === filterDanhMuc) &&
    (!search || item.tieuDe.toLowerCase().includes(search.toLowerCase()))
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset về trang đầu khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDanhMuc, search]);

  return (
    <div style={{ 
      background: '#f5f5f5', 
      height: '100vh', // Cố định chiều cao viewport
      overflow: 'hidden', // Không cho scroll
      padding: 0 
    }}>
      <AdminHeader pageTitle="Quản lý bài viết" />
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
            <button
              className="btn-add"
              onClick={() => { setShowForm(true); setEditing(null); }}
              style={{
                background: '#52c41a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 8px 0 rgba(82,196,26,0.10)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <PlusOutlined /> Thêm bài viết
            </button>
            <select
              value={filterDanhMuc || ''}
              onChange={(e) => setFilterDanhMuc(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả danh mục</option>
              {danhMucOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '25%' }}>Tiêu đề</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Danh mục</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '15%' }}>Tác giả</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Ngày đăng</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Tags</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', width: '8%' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        textAlign: 'center', 
                        padding: '100px 24px', // Giảm padding
                        color: '#888',
                        height: '300px' // Giảm chiều cao
                      }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className="table-row-fadein"
                        style={{ 
                          background: '#fff', 
                          borderBottom: '1px solid #f0f0f0',
                          animationDelay: `${idx * 120}ms`,
                          height: '50px' // Giảm chiều cao row
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
                        <td style={{ 
                          padding: '10px 8px',
                          maxWidth: '0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8,
                            overflow: 'hidden'
                          }}>
                            <span style={{ 
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={item.tieuDe}>
                              {item.tieuDe}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {danhMucOptions.find(o => o.value === item.danhMuc)?.label}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.tenTacGia}
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.ngayDang}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'nowrap', 
                            gap: 4, 
                            overflow: 'hidden',
                            alignItems: 'center'
                          }}>
                            {item.theGan?.map((tag: string, index: number) => (
                              <span key={tag} style={{
                                display: 'inline-flex',
                                background: '#f3f4f6',
                                color: '#555',
                                borderRadius: 8,
                                padding: '2px 8px',
                                fontSize: 12,
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                maxWidth: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} title={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '10px 8px',
                          whiteSpace: 'nowrap'
                        }}>
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
                          minWidth: 120,
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
                  {/* Thêm các row trống để cố định chiều cao khi data ít */}
                  {currentData.length > 0 && currentData.length < 10 && 
                    Array.from({ length: 10 - currentData.length }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '50px', background: '#fff' }}>
                        <td colSpan={7} style={{ padding: '10px 8px' }}></td>
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
                disabled={currentPage === 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              
              <span style={{ fontSize: 14, color: '#555' }}>
                Trang {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
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
                  
                  // Debug: Log form data before adding image
                  console.log('Form data before image:', {
                    tieuDe: formData.get('tieuDe'),
                    noiDung: formData.get('noiDung'),
                    danhMuc: formData.get('danhMuc'),
                    theGan: formData.get('theGan'),
                    idTacGia: formData.get('idTacGia')
                  });
                  
                  // Thêm image file nếu có
                  if (imageFile) {
                    console.log('Adding image file to FormData:', imageFile.name, imageFile.size);
                    formData.append('anhDaiDien', imageFile);
                  } else {
                    console.log('No image file selected');
                  }
                  
                  // Debug: Log all FormData entries
                  for (let [key, value] of formData.entries()) {
                    console.log('FormData entry:', key, value);
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
                      src={imagePreview || getRandomPlaceholder()}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        display: 'block',
                        transition: 'filter 0.2s',
                        filter: imagePreview && !imagePreview.includes('alipayobjects') ? 'none' : 'grayscale(1) opacity(0.7)',
                      }}
                      onError={(e) => {
                        console.log('Image failed to load, using placeholder');
                        e.currentTarget.src = getRandomPlaceholder();
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', imagePreview);
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
                
                {/* Thêm thông báo về trạng thái bản nháp */}
                {!editing && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: 8,
                    marginBottom: 16,
                    color: '#856404',
                    fontSize: 14
                  }}>
                    <strong>📝 Lưu ý:</strong> Bài viết mới sẽ được lưu dưới dạng bản nháp. 
                    Bạn có thể xuất bản sau khi hoàn thành chỉnh sửa.
                  </div>
                )}
                
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
                      background: formLoading ? '#ccc' : '#43a047',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 rgba(67,160,71,0.10)',
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {formLoading ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Lưu bản nháp')}
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

      {/* Hover image effect - Giữ nguyên logic cũ */}
      {hoveredBlogId && hoveredBlogImgPos && (() => {
        const blog = data.find(b => b.id === hoveredBlogId);
        if (!blog || !blog.anhDaiDien) return null;
        const imgUrl = getImageUrl(blog.anhDaiDien);
        if (!imgUrl) return null;
        const offsetX = -340;
        const offsetY = -110;
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