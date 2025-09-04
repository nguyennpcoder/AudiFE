import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { useNotification } from '../../NotificationContext';
import '../../../styles/Blog.css';

const API_URL = 'http://localhost:8080/api/v1/bai-viet';
const COMMENT_API_URL = 'http://localhost:8080/api/v1/binh-luan';

interface BlogPost {
  id: string;
  tieuDe: string;
  noiDung: string;
  anhDaiDien?: string;
  tenTacGia: string;
  avatarTacGia?: string;
  ngayDang: string;
  danhMuc?: string;
  theGan?: string[];
  luotXem?: number;
  thoiGianDoc?: number;
}

interface Comment {
  id: string; // Thay đổi từ idBinhLuan thành id
  idBaiViet: string;
  idNguoiDung: string;
  noiDung: string;
  ngayBinhLuan: string;
  trangThai: string;
  idBinhLuanCha?: string;
  soLuotThich: number;
  // Thêm các trường từ backend
  tenNguoiDung?: string;
  avatarNguoiDung?: string;
  // Hoặc có thể backend trả về object nguoiDung
  nguoiDung?: {
    ho: string;
    ten: string;
    email: string;
    avatar?: string;
  };
  replies?: Comment[];
  daThich?: boolean; // Thêm trường này để theo dõi trạng thái like
  // Add this field to match backend response
  binhLuanCon?: Comment[];
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  
  // State cho bình luận
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // State để quản lý animation
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [animatingComments, setAnimatingComments] = useState<Set<string>>(new Set());

  // Thêm state để validation
  const [replyError, setReplyError] = useState<string | null>(null);

  // Thêm state để quản lý menu dropdown
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Smooth scroll to top function without jank
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {
      // Fallback for older browsers
      const start = window.scrollY || window.pageYOffset;
      const duration = 400;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        window.scrollTo(0, Math.round(start * (1 - ease)));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  };

  // Get avatar URL for author (giữ nguyên như cũ)
  const getAuthorAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      const avatarUrl = avatarPath.startsWith('http')
        ? avatarPath
        : `http://localhost:8080/${avatarPath}`;
      return avatarUrl;
    }
    return '/avatar-default.png';
  };

  // Cải thiện hàm getUserAvatarUrl để xử lý tốt hơn
  const getUserAvatarUrl = (avatarPath?: string) => {
    console.log('getUserAvatarUrl called with:', avatarPath);
    
    if (!avatarPath || avatarPath === 'null' || avatarPath === 'undefined') {
      console.log('No avatar path, using default');
      return '/avatar-default.png';
    }
    
    // If it's already a full URL (from Google, Facebook, etc.), return as is
    if (avatarPath.startsWith('http')) {
      console.log('Full URL detected:', avatarPath);
      return avatarPath;
    }
    
    // If it starts with /, it's a relative path
    if (avatarPath.startsWith('/')) {
      const url = `http://localhost:8080${avatarPath}`;
      console.log('Relative path converted to:', url);
      return url;
    }
    
    // If it contains uploads/images/avatar_user, it's already a full path
    if (avatarPath.includes('uploads/images/avatar_user/')) {
      const url = `http://localhost:8080/${avatarPath}`;
      console.log('Full path with uploads converted to:', url);
      return url;
    }
    
    // Otherwise, assume it's a filename and build the full URL
    // This handles the case where backend only stores filename like "1756041370218_IMG_1106.jpg"
    const url = `http://localhost:8080/uploads/images/avatar_user/${avatarPath}`;
    console.log('Filename converted to:', url);
    return url;
  };

  // Tạo danh sách placeholder images
  const placeholderImages = [
    'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    'https://gw.alipayobjects.com/zos/rmsportal/DkKNubTaaVsKwUzKzQhQ.png',
    'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
    'https://gw.alipayobjects.com/zos/rmsportal/rMSqrFDLlkZjfWKXoQpa.png'
  ];

  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  // Get image URL for blog posts
  const getBlogImageUrl = (imagePath?: string) => {
    if (!imagePath) return getRandomPlaceholder();
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:8080${imagePath}`;
    }
    
    if (!imagePath.includes('/')) {
      return `http://localhost:8080/uploads/images/blogs/${imagePath}`;
    }
    
    return getRandomPlaceholder();
  };

  // Cập nhật fetchComments để xử lý avatar tốt hơn
  const fetchComments = useCallback(async () => {
    if (!id) return;
    
    try {
      const url = `${COMMENT_API_URL}/bai-viet/${id}?size=1000`; // Lấy nhiều bình luận hơn
      console.log('=== FETCHING COMMENTS ===');
      console.log('URL:', url);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Thêm token nếu user đã đăng nhập
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${url}&t=${Date.now()}`, {
        method: 'GET',
        headers
      });
      console.log('Comments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Comments API response:', data);
        console.log('User token:', localStorage.getItem('token'));
        console.log('User info:', user);
        
        let commentsArray: Comment[] = [];
        
        if (Array.isArray(data.binhLuan)) {
          commentsArray = data.binhLuan;
        } else if (Array.isArray(data)) {
          commentsArray = data;
        } else {
          console.warn('Unexpected comments data structure:', data);
          commentsArray = [];
        }
        
        console.log('Extracted comments array:', commentsArray);
        console.log('Number of comments:', commentsArray.length);
        
        // Xử lý comments - CẢI THIỆN XỬ LÝ AVATAR
        const processedComments = commentsArray.map(comment => {
          console.log('Processing comment:', comment);
          console.log('Comment avatar path:', comment.avatarNguoiDung);
          
          // Xử lý user info với avatar
          let processedComment = {
            ...comment,
            tenNguoiDung: comment.tenNguoiDung || 'Người dùng',
            avatarNguoiDung: getUserAvatarUrl(comment.avatarNguoiDung),
            daThich: comment.daThich || false
          };
          
          // Xử lý replies - CẢI THIỆN XỬ LÝ AVATAR CHO REPLIES
          if (comment.binhLuanCon && Array.isArray(comment.binhLuanCon)) {
            processedComment.replies = comment.binhLuanCon.map((reply: any) => {
              console.log('Processing reply:', reply);
              console.log('Reply avatar path:', reply.avatarNguoiDung);
              console.log('Reply daThich:', reply.daThich);
              
              return {
                ...reply,
                tenNguoiDung: reply.tenNguoiDung || 'Người dùng',
                avatarNguoiDung: getUserAvatarUrl(reply.avatarNguoiDung),
                daThich: reply.daThich || false
              };
            });
          }
          
          return processedComment;
        });
        
        // Khôi phục trạng thái like từ backend data
        const newLikedComments = new Set<string>();
        processedComments.forEach(comment => {
          console.log(`Comment ${comment.id} - daThich:`, comment.daThich);
          if (comment.daThich) {
            newLikedComments.add(comment.id);
            console.log(`Added comment ${comment.id} to likedComments`);
          }
          // Kiểm tra replies
          if (comment.replies) {
            comment.replies.forEach(reply => {
              console.log(`Reply ${reply.id} - daThich:`, reply.daThich);
              if (reply.daThich) {
                newLikedComments.add(reply.id);
                console.log(`Added reply ${reply.id} to likedComments`);
              }
            });
          }
        });
        
        console.log('Final likedComments set:', Array.from(newLikedComments));
        
        setLikedComments(newLikedComments);
        setComments(processedComments);
        
      } else {
        console.error('Failed to fetch comments:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [id, user?.userId]);

  // Organize comments into hierarchical structure - SỬA LẠI LOGIC
  const organizeComments = (comments: Comment[]): Comment[] => {
    if (!Array.isArray(comments)) {
      console.warn('organizeComments received non-array:', comments);
      return [];
    }
    
    console.log('organizeComments - total comments count:', comments.length);
    
    // Sắp xếp comment theo thời gian từ mới nhất đến cũ nhất
    const sortedComments = comments.sort((a, b) => {
      const dateA = new Date(a.ngayBinhLuan).getTime();
      const dateB = new Date(b.ngayBinhLuan).getTime();
      return dateB - dateA; // Mới nhất lên đầu
    });
    
    // Loại bỏ duplicate dựa trên idBinhLuan
    const uniqueComments = sortedComments.filter((comment, index, self) => 
      index === self.findIndex(c => c.id === comment.id)
    );
    
    console.log('organizeComments - unique comments count:', uniqueComments.length);
    
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    uniqueComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into hierarchy
    uniqueComments.forEach(comment => {
      if (comment.idBinhLuanCha) {
        const parent = commentMap.get(comment.idBinhLuanCha);
        if (parent) {
          parent.replies = parent.replies || [];
          // Kiểm tra xem reply đã tồn tại chưa
          const replyExists = parent.replies.some(reply => reply.id === comment.id);
          if (!replyExists) {
            parent.replies.push(commentMap.get(comment.id)!);
          }
        }
      } else {
        // Kiểm tra xem comment đã tồn tại chưa
        const commentExists = rootComments.some(c => c.id === comment.id);
        if (!commentExists) {
          rootComments.push(commentMap.get(comment.id)!);
        }
      }
    });

    // Sắp xếp lại root comments theo thời gian (mới nhất lên đầu)
    rootComments.sort((a, b) => {
      const dateA = new Date(a.ngayBinhLuan).getTime();
      const dateB = new Date(b.ngayBinhLuan).getTime();
      return dateB - dateA;
    });

    // Sắp xếp replies trong mỗi comment cũng theo thời gian
    rootComments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => {
          const dateA = new Date(a.ngayBinhLuan).getTime();
          const dateB = new Date(b.ngayBinhLuan).getTime();
          return dateB - dateA;
        });
      }
    });

    console.log('Final root comments count:', rootComments.length);
    console.log('Root comments with replies:', rootComments.map(c => ({
      id: c.id,
      content: c.noiDung.substring(0, 50) + '...',
      replies: c.replies?.length || 0,
      date: c.ngayBinhLuan
    })));
    
    return rootComments;
  };

  // Thêm hàm debug để kiểm tra comment data
  const debugComments = (comments: Comment[]) => {
    console.log('=== DEBUG COMMENTS ===');
    console.log('Total comments:', comments.length);
    comments.forEach((comment, index) => {
      console.log(`Comment ${index + 1}:`, {
        id: comment.id,
        content: comment.noiDung.substring(0, 100) + '...',
        author: comment.tenNguoiDung || comment.nguoiDung?.ho + ' ' + comment.nguoiDung?.ten,
        date: comment.ngayBinhLuan,
        replies: comment.replies?.length || 0,
        parentId: comment.idBinhLuanCha
      });
      
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply, replyIndex) => {
          console.log(`  Reply ${replyIndex + 1}:`, {
            id: reply.id,
            content: reply.noiDung.substring(0, 100) + '...',
            author: reply.tenNguoiDung || reply.nguoiDung?.ho + ' ' + reply.nguoiDung?.ten,
            date: reply.ngayBinhLuan
          });
        });
      }
    });
    console.log('=== END DEBUG ===');
  };

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !id) return;

    console.log('=== SUBMITTING NEW COMMENT ===');
    console.log('User:', user);
    console.log('Comment content:', newComment);
    console.log('Article ID:', id);
    console.log('Reply to:', replyTo);

    setCommentLoading(true);
    try {
      const commentData = {
        idBaiViet: id,
        idNguoiDung: user.userId,
        noiDung: newComment.trim(),
        idBinhLuanCha: replyTo
      };
      
      console.log('Sending comment data:', commentData);
      console.log('Token:', localStorage.getItem('token'));

      const response = await fetch(COMMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(commentData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Comment submitted successfully:', responseData);
        
        // Clear form
        setNewComment('');
        setReplyTo(null);
        setReplyContent('');
        
        // Refresh comments immediately
        console.log('Refreshing comments...');
        await fetchComments();
        
        // Show success message
        showNotification('success', 'Bình luận đã được gửi thành công!');
      } else {
        const errorData = await response.text();
        console.error('Failed to submit comment:', response.status, errorData);
        showNotification('error', `Lỗi gửi bình luận: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
      showNotification('error', 'Lỗi kết nối khi gửi bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  // Validation function
  const validateReply = (content: string): string | null => {
    if (!content.trim()) {
      return 'Vui lòng nhập nội dung trả lời';
    }
    
    if (content.trim().length < 5) {
      return 'Trả lời phải có ít nhất 5 ký tự';
    }
    
    if (content.length > 1000) {
      return 'Trả lời không được vượt quá 1000 ký tự';
    }
    
    return null;
  };

  // Cập nhật handleSubmitReply với validation
  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      showNotification('warning', 'Bạn cần đăng nhập để trả lời bình luận');
      return;
    }

    // Validation
    const validationError = validateReply(replyContent);
    if (validationError) {
      setReplyError(validationError);
      return;
    }

    setReplyError(null);
    setCommentLoading(true);
    
    try {
      console.log('Submitting reply:', {
        idBaiViet: id,
        idNguoiDung: user.userId,
        noiDung: replyContent.trim(),
        idBinhLuanCha: parentId
      });

      const response = await fetch(COMMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          idBaiViet: id,
          idNguoiDung: user.userId,
          noiDung: replyContent.trim(),
          idBinhLuanCha: parentId
        })
      });

      console.log('Reply response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Reply submitted successfully:', result);
        
        // Clear form
        setReplyContent('');
        setReplyTo(null);
        
        // Hiển thị thông báo thành công
        showNotification('success', 'Trả lời đã được gửi thành công!');
        
        // Refresh comments để lấy dữ liệu chính xác từ backend
        // Bây giờ reply sẽ được lưu vĩnh viễn
        await fetchComments();
        
      } else {
        const errorData = await response.text();
        console.error('Failed to submit reply:', response.status, errorData);
        
        let errorMessage = 'Không thể gửi trả lời';
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, sử dụng text gốc
          if (errorData.includes('Unauthorized')) {
            errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
          } else if (errorData.includes('Forbidden')) {
            errorMessage = 'Bạn không có quyền gửi trả lời';
          } else if (errorData.includes('Bad Request')) {
            errorMessage = 'Dữ liệu không hợp lệ';
          }
        }
        
        showNotification('error', `Lỗi: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
      showNotification('error', 'Lỗi kết nối khi gửi trả lời. Vui lòng thử lại sau.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Like/Unlike comment với animation mượt mà
  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      showNotification('warning', 'Bạn cần đăng nhập để thích bình luận');
      return;
    }

    try {
      // Kiểm tra xem comment đã được like chưa
      const isLiked = likedComments.has(commentId);
      const endpoint = isLiked ? 'unlike' : 'like';
      
      // Bắt đầu animation ngay lập tức
      setAnimatingComments(prev => new Set(prev).add(commentId));
      
      // Cập nhật UI ngay lập tức để tránh delay
      if (isLiked) {
        // Unlike - cập nhật ngay lập tức
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
        
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, soLuotThich: Math.max(0, comment.soLuotThich - 1), daThich: false }
            : comment
        ));
      } else {
        // Like - cập nhật ngay lập tức
        setLikedComments(prev => new Set(prev).add(commentId));
        
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, soLuotThich: comment.soLuotThich + 1, daThich: true }
            : comment
        ));
      }
      
      // Gọi API
      const response = await fetch(`${COMMENT_API_URL}/${commentId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`${endpoint} result:`, result);
        
        // Refresh comments từ backend để đảm bảo trạng thái chính xác
        await fetchComments();
        
        // Kết thúc animation sau 800ms (nhanh hơn)
        setTimeout(() => {
          setAnimatingComments(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        }, 800);
        
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        
        // Nếu API lỗi, rollback UI
        if (isLiked) {
          setLikedComments(prev => new Set(prev).add(commentId));
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, soLuotThich: comment.soLuotThich + 1, daThich: true }
              : comment
          ));
        } else {
          setLikedComments(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, soLuotThich: Math.max(0, comment.soLuotThich - 1), daThich: false }
              : comment
          ));
        }
        
        // Kết thúc animation
        setAnimatingComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Failed to like/unlike comment:', err);
      
      // Rollback UI nếu có lỗi
      setAnimatingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // Unlike comment (tùy chọn)
  const handleUnlikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${COMMENT_API_URL}/${commentId}/unlike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Unlike result:', result);
        
        showNotification('success', result.message || 'Đã bỏ thích bình luận thành công!');
      } else {
        const errorData = await response.json();
        showNotification('error', `Lỗi: ${errorData.error || 'Không thể bỏ thích bình luận'}`);
      }
    } catch (err) {
      console.error('Failed to unlike comment:', err);
      showNotification('error', 'Lỗi kết nối khi bỏ thích bình luận');
    }
  };

  // Thêm button refresh comments (tùy chọn)
  const handleRefreshComments = async () => {
    await fetchComments();
    showNotification('success', 'Đã làm mới bình luận!');
  };

  // Thêm state để quản lý loading khi edit
  const [editLoading, setEditLoading] = useState<string | null>(null);

  // Thêm hàm xử lý chỉnh sửa comment
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      showNotification('warning', 'Vui lòng nhập nội dung');
      return;
    }

    setEditLoading(commentId);
    try {
      const response = await fetch(`${COMMENT_API_URL}/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          noiDung: editContent.trim()
        })
      });

      if (response.ok) {
        showNotification('success', 'Cập nhật bình luận thành công!');
        setEditingCommentId(null);
        setEditContent('');
        await fetchComments();
      } else {
        const errorData = await response.text();
        let errorMessage = 'Không thể cập nhật bình luận';
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, sử dụng text gốc
          if (errorData.includes('Không có quyền')) {
            errorMessage = 'Bạn không có quyền cập nhật bình luận này';
          } else if (errorData.includes('Không tìm thấy')) {
            errorMessage = 'Không tìm thấy bình luận';
          }
        }
        showNotification('error', errorMessage);
      }
    } catch (err) {
      console.error('Failed to edit comment:', err);
      showNotification('error', 'Lỗi kết nối khi cập nhật bình luận');
    } finally {
      setEditLoading(null);
    }
  };

  // Thêm hàm xử lý xóa comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    try {
      const response = await fetch(`${COMMENT_API_URL}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showNotification('success', 'Xóa bình luận thành công!');
        await fetchComments();
      } else {
        const errorData = await response.text();
        let errorMessage = 'Không thể xóa bình luận';
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, sử dụng text gốc
          if (errorData.includes('Không có quyền')) {
            errorMessage = 'Bạn không có quyền xóa bình luận này';
          } else if (errorData.includes('Không tìm thấy')) {
            errorMessage = 'Không tìm thấy bình luận';
          }
        }
        showNotification('error', errorMessage);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      showNotification('error', 'Lỗi kết nối khi xóa bình luận');
    }
  };

  // Refresh comments khi user thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [user?.userId]); // Chỉ chạy khi userId thay đổi

  useEffect(() => {
    scrollToTop();
    
    const fetchPost = async () => {
      if (!id) {
        setError('ID bài viết không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPost(data);

        // Fetch related posts
        try {
          const relatedResponse = await fetch(`${API_URL}/public?size=1000`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            const allPosts = relatedData.baiViet || relatedData.data || [];
            const filtered = allPosts
              .filter((p: BlogPost) => p.id !== id)
              .slice(0, 3);
            setRelatedPosts(filtered);
          }
        } catch (err) {
          console.warn('Failed to fetch related posts:', err);
        }

        // Fetch comments
        await fetchComments();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getCategoryColor = (category: string): { bg: string; text: string } => {
    const categoryColors: Record<string, { bg: string; text: string }> = {
      'THONG_TIN': { bg: '#e3f2fd', text: '#1976d2' },
      'TIN_TUC': { bg: '#f3e5f5', text: '#7b1fa2' },
      'REVIEW': { bg: '#e8f5e8', text: '#388e3c' },
      'HUONG_DAN': { bg: '#fff3e0', text: '#f57c00' },
      'MEO': { bg: '#fff3e0', text: '#f57c00' },
      default: { bg: '#f5f5f5', text: '#616161' }
    };
    return categoryColors[category] || categoryColors.default;
  };

  // Thêm hàm format nội dung blog để hiển thị đẹp hơn
  const formatBlogContent = (content: string): string => {
    if (!content) return '';
    
    // Chuyển đổi markdown-style thành HTML đẹp hơn
    let formattedContent = content
      // Xử lý tiêu đề **text** thành <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #3182ce; font-weight: 700;">$1</strong>')
      // Xử lý danh sách có dấu gạch đầu dòng
      .replace(/^- (.+)$/gm, '<li style="margin-bottom: 0.5rem; color: #e2e8f0;">$1</li>')
      // Bọc danh sách trong <ul>
      .replace(/(<li.*?<\/li>)/gs, '<ul style="margin: 1rem 0; padding-left: 2rem; list-style: none;">$1</ul>')
      // Xử lý danh sách số
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-bottom: 0.5rem; color: #e2e8f0;">$1</li>')
      // Bọc danh sách số trong <ol>
      .replace(/(<li.*?<\/li>)/gs, '<ol style="margin: 1rem 0; padding-left: 2rem;">$1</ol>')
      // Xử lý đoạn văn
      .replace(/\n\n/g, '</p><p style="margin-bottom: 1.5rem; color: #e2e8f0; line-height: 1.8;">')
      // Bọc toàn bộ nội dung trong <p>
      .replace(/^(.+)$/gm, '<p style="margin-bottom: 1.5rem; color: #e2e8f0; line-height: 1.8;">$1</p>')
      // Loại bỏ <p> rỗng
      .replace(/<p style="margin-bottom: 1.5rem; color: #e2e8f0; line-height: 1.8;"><\/p>/g, '')
      // Xử lý các thẻ HTML đã có
      .replace(/<p style="margin-bottom: 1.5rem; color: #e2e8f0; line-height: 1.8;"><p/g, '<p')
      .replace(/<\/p><\/p>/g, '</p>');

    return formattedContent;
  };

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="blog-detail-skeleton">
          <div className="blog-skeleton blog-skeleton-breadcrumb"></div>
          <div className="blog-skeleton blog-skeleton-title-large"></div>
          <div className="blog-skeleton blog-skeleton-meta-large"></div>
          <div className="blog-skeleton blog-skeleton-image-large"></div>
          <div className="blog-skeleton blog-skeleton-content"></div>
          <div className="blog-skeleton blog-skeleton-content"></div>
          <div className="blog-skeleton blog-skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-container">
        <div className="blog-error-state">
          <div className="blog-error-icon">❌</div>
          <h2>Bài viết không tồn tại</h2>
          <p>{error || 'Không thể tìm thấy bài viết này'}</p>
          <div className="blog-error-actions">
            <button className="blog-retry-button" onClick={() => navigate('/blog')}>
              Về trang chủ
            </button>
            <button className="blog-retry-button secondary" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryStyle = getCategoryColor(post.danhMuc || '');
  const readingTime = getReadingTime(post.noiDung || '');
  const authorAvatarUrl = getAuthorAvatarUrl(post.avatarTacGia);

  const handleRelatedPostClick = (postId: string) => {
    scrollToTop();
    setTimeout(() => {
      navigate(`/blog/${postId}`);
    }, 100);
  };

  return (
    <div className="blog-detail-container blog-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="blog-breadcrumb">
        <Link to="/blog" className="blog-breadcrumb-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
          Tin tức & Blog
        </Link>
        <span className="blog-breadcrumb-separator">/</span>
        <span className="blog-breadcrumb-current">{post.tieuDe}</span>
      </nav>

      {/* Article Header */}
      <header className="blog-article-header">
        <div className="blog-article-meta">
          {post.danhMuc && (
            <span 
              className="blog-category-tag large"
              style={{ 
                backgroundColor: categoryStyle.bg,
                color: categoryStyle.text 
              }}
            >
              {post.danhMuc.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          )}
          <div className="blog-article-stats">
            <span className="blog-stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
              </svg>
              {readingTime} phút đọc
            </span>
            {post.luotXem && (
              <span className="blog-stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                </svg>
                {post.luotXem.toLocaleString()} lượt xem
              </span>
            )}
          </div>
        </div>

        <h1 className="blog-article-title">{post.tieuDe}</h1>

        <div className="blog-article-author">
          <img
            src={authorAvatarUrl}
            alt="Author Avatar"
            className="blog-author-avatar large"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
            onError={(e) => {
              console.log('Author avatar failed to load, using default');
              const target = e.currentTarget;
              if (target.src !== '/avatar-default.png') {
                target.src = '/avatar-default.png';
              }
            }}
            onLoad={() => {
              console.log('Author avatar loaded successfully:', authorAvatarUrl);
            }}
          />
          <div className="blog-article-author-info">
            <div className="blog-article-author-name">{post.tenTacGia}</div>
            <div className="blog-publish-date">{formatDate(post.ngayDang)}</div>
          </div>
        </div>
      </header>

      {post.anhDaiDien && (
        <div className="blog-article-featured-image">
          <img 
            src={getBlogImageUrl(post.anhDaiDien)} 
            alt={post.tieuDe}
            onError={(e) => {
              console.error('Blog featured image failed to load:', post.anhDaiDien);
              e.currentTarget.src = getRandomPlaceholder();
            }}
          />
        </div>
      )}

      {/* Article Content */}
      <article className="blog-article-content">
        <div 
          className="blog-prose"
          dangerouslySetInnerHTML={{ 
            __html: formatBlogContent(post.noiDung) 
          }} 
        />
      </article>

      {/* Tags */}
      {post.theGan && post.theGan.length > 0 && (
        <div className="blog-article-tags">
          <h3>Thẻ bài viết</h3>
          <div className="blog-tags-list">
            {post.theGan.map((tag) => (
              <span key={tag} className="blog-tag-item">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Share */}
      <div className="blog-social-share">
        <h3>Chia sẻ bài viết</h3>
        <div className="blog-share-buttons">
          <button className="blog-share-btn facebook" onClick={() => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          <button className="blog-share-btn twitter" onClick={() => {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.tieuDe)}`, '_blank');
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>
          <button className="blog-share-btn copy" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            Sao chép link
          </button>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="blog-related-posts">
          <h2>Bài viết liên quan</h2>
          <div className="blog-related-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <div 
                key={relatedPost.id} 
                className="blog-related-post-card"
                onClick={() => handleRelatedPostClick(relatedPost.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="blog-related-post-image">
                  {relatedPost.anhDaiDien ? (
                    <img 
                      src={getBlogImageUrl(relatedPost.anhDaiDien)} 
                      alt={relatedPost.tieuDe}
                      onError={(e) => {
                        console.error('Related post image failed to load:', relatedPost.anhDaiDien);
                        e.currentTarget.src = getRandomPlaceholder();
                      }}
                    />
                  ) : (
                    <div className="blog-placeholder-image small">
                      <img 
                        src={getRandomPlaceholder()} 
                        alt="Placeholder"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
                <div className="blog-related-post-content">
                  <h3>{relatedPost.tieuDe}</h3>
                  <div className="blog-related-post-meta">
                    <span>{relatedPost.tenTacGia}</span>
                    <span>•</span>
                    <span>{formatDate(relatedPost.ngayDang)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="blog-comments">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Bình luận ({comments.length})</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleRefreshComments}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
        
        {/* Comment Form */}
        {user && (
          <div className="blog-comment-form">
            <h3>Viết bình luận</h3>
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows={4}
                required
                disabled={commentLoading}
              />
              <div className="blog-comment-form-actions">
                <button 
                  type="submit" 
                  disabled={commentLoading || !newComment.trim()}
                  className="blog-comment-submit-btn"
                >
                  {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
                {replyTo && (
                  <button 
                    type="button" 
                    onClick={() => setReplyTo(null)}
                    className="blog-comment-cancel-btn"
                  >
                    Hủy trả lời
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="blog-comments-list">
          {comments.length === 0 ? (
            <div className="blog-no-comments">
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="blog-comment">
                <div className="blog-comment-header">
                  <img
                    src={getUserAvatarUrl(comment.avatarNguoiDung)}
                    alt={comment.tenNguoiDung || 'Người dùng'}
                    className="blog-comment-avatar"
                    onError={(e) => {
                      console.log('Comment avatar failed to load, using default');
                      const target = e.currentTarget;
                      if (target.src !== '/avatar-default.png') {
                        target.src = '/avatar-default.png';
                      }
                    }}
                  />
                  <div className="blog-comment-info">
                    <div className="blog-comment-author">
                      {comment.tenNguoiDung || 'Người dùng'}
                      {user && user.userId === Number(comment.idNguoiDung) && (
                        <span className="blog-comment-owner-badge">Bạn</span>
                      )}
                    </div>
                    <div className="blog-comment-date">
                      {formatDate(comment.ngayBinhLuan)}
                    </div>
                  </div>
                  
                  {/* Menu 3 chấm - Hiển thị cho comment của user hiện tại hoặc admin */}
                  {user && (user.userId === Number(comment.idNguoiDung) || user.role === 'quan_tri') && (
                    <div className="blog-comment-menu">
                      <button 
                        className="blog-comment-menu-btn"
                        onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                        </svg>
                      </button>
                      
                      {openMenuId === comment.id && (
                        <div className="blog-comment-dropdown">
                          <button 
                            className="blog-comment-dropdown-item"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.noiDung);
                              setOpenMenuId(null);
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                            </svg>
                            Chỉnh sửa
                          </button>
                          <button 
                            className="blog-comment-dropdown-item delete"
                            onClick={() => {
                              handleDeleteComment(comment.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                            </svg>
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Hiển thị nội dung comment hoặc form chỉnh sửa */}
                {editingCommentId === comment.id ? (
                  <div className="blog-comment-edit-form">
                    <div className="edit-form-header">
                      <div className="edit-form-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                      </div>
                      <div className="edit-form-title">
                        <h4>Chỉnh sửa bình luận</h4>
                        <span className="edit-form-subtitle">Cập nhật nội dung bình luận của bạn</span>
                      </div>
                    </div>
                    
                    <div className="edit-form-content">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Chỉnh sửa bình luận..."
                        rows={3}
                        maxLength={1000}
                        className="edit-form-textarea"
                      />
                      <div className="edit-form-character-count">
                        <span className={`character-count ${editContent.length > 900 ? 'warning' : ''} ${editContent.length > 1000 ? 'error' : ''}`}>
                          {editContent.length}/1000
                        </span>
                      </div>
                    </div>
                    
                    <div className="edit-form-actions">
                      <button 
                        onClick={() => handleEditComment(comment.id)}
                        className={`edit-form-save-btn ${editLoading === comment.id ? 'loading' : ''}`}
                        disabled={!editContent.trim() || editContent.length > 1000 || editLoading === comment.id}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                        </svg>
                        <span>{editLoading === comment.id ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                        className="edit-form-cancel-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                        <span>Hủy bỏ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="blog-comment-content">
                    {comment.noiDung}
                  </div>
                )}
                
                <div className="blog-comment-actions">
                  <button 
                    onClick={() => handleLikeComment(comment.id)}
                    className={`blog-comment-like-btn ${comment.daThich ? 'liked' : ''} ${animatingComments.has(comment.id) ? 'animating' : ''}`}
                    disabled={animatingComments.has(comment.id)}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill={comment.daThich ? "currentColor" : "none"} 
                      stroke="currentColor"
                      className="heart-icon"
                    >
                      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
                    {comment.daThich ? 'Đã thích' : 'Thích'} ({comment.soLuotThich})
                  </button>
                  
                  {user && (
                    <button 
                      onClick={() => setReplyTo(comment.id)}
                      className="blog-comment-reply-btn"
                    >
                      Trả lời
                    </button>
                  )}
                </div>

                {/* Reply Form với validation và loading state */}
                {replyTo === comment.id && (
                  <div className="blog-reply-form">
                    <div className="reply-form-header">
                      <h4>Trả lời bình luận của {comment.tenNguoiDung}</h4>
                    </div>
                    
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Viết trả lời của bạn..."
                      rows={3}
                      required
                      disabled={commentLoading}
                      maxLength={1000} // Giới hạn độ dài
                      className={replyContent.length > 1000 ? 'error' : ''}
                    />
                    
                    <div className="reply-form-footer">
                      <div className="reply-form-info">
                        <span className="char-count">
                          {replyContent.length}/1000 ký tự
                        </span>
                        {replyContent.length > 1000 && (
                          <span className="error-message">
                            Vượt quá giới hạn ký tự
                          </span>
                        )}
                      </div>
                      
                      <div className="blog-reply-form-actions">
                        <button 
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={commentLoading || !replyContent.trim() || replyContent.length > 1000}
                          className="blog-reply-submit-btn"
                        >
                          {commentLoading ? (
                            <>
                              <span className="loading-spinner"></span>
                              Đang gửi...
                            </>
                          ) : (
                            'Gửi trả lời'
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent('');
                          }}
                          disabled={commentLoading}
                          className="blog-reply-cancel-btn"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>

                    {replyError && (
                      <div className="reply-error-message">
                        {replyError}
                      </div>
                    )}
                  </div>
                )}

                {/* Replies với styling giống social media */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="blog-comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="blog-comment reply">
                        <div className="blog-comment-header">
                          <img
                            src={getUserAvatarUrl(reply.avatarNguoiDung)}
                            alt={reply.tenNguoiDung || 'Người dùng'}
                            className="blog-comment-avatar reply-avatar"
                          />
                          <div className="blog-comment-info">
                            <div className="blog-comment-author">
                              {reply.tenNguoiDung || 'Người dùng'}
                              {user && user.userId === Number(reply.idNguoiDung) && (
                                <span className="blog-comment-owner-badge">Bạn</span>
                              )}
                            </div>
                            <div className="blog-comment-date">
                              {formatDate(reply.ngayBinhLuan)}
                            </div>
                          </div>
                          
                          {/* Menu 3 chấm cho replies - Hiển thị cho reply của user hiện tại hoặc admin */}
                          {user && (user.userId === Number(reply.idNguoiDung) || user.role === 'quan_tri') && (
                            <div className="blog-comment-menu">
                              <button 
                                className="blog-comment-menu-btn"
                                onClick={() => setOpenMenuId(openMenuId === reply.id ? null : reply.id)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                                </svg>
                              </button>
                              
                              {openMenuId === reply.id && (
                                <div className="blog-comment-dropdown">
                                  <button 
                                    className="blog-comment-dropdown-item"
                                    onClick={() => {
                                      setEditingCommentId(reply.id);
                                      setEditContent(reply.noiDung);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                    </svg>
                                    Chỉnh sửa
                                  </button>
                                  <button 
                                    className="blog-comment-dropdown-item delete"
                                    onClick={() => {
                                      handleDeleteComment(reply.id);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                                    </svg>
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="blog-comment-content reply-content">
                          {reply.noiDung}
                        </div>
                        
                        <div className="blog-comment-actions reply-actions">
                          <button 
                            onClick={() => handleLikeComment(reply.id)}
                            className={`blog-comment-like-btn ${reply.daThich ? 'liked' : ''} ${animatingComments.has(reply.id) ? 'animating' : ''}`}
                            disabled={animatingComments.has(reply.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={reply.daThich ? "currentColor" : "none"} stroke="currentColor">
                              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                            </svg>
                            {reply.daThich ? 'Đã thích' : 'Thích'} ({reply.soLuotThich})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;