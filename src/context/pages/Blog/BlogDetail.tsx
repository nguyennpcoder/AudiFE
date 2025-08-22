import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
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
  idBinhLuan: string;
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
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  // Smooth scroll to top function with animation
  const scrollToTop = () => {
    const scrollStep = -window.scrollY / (500 / 15);
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
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

  // Thêm hàm mới để load avatar user comment (y hệt như admin)
  const getUserAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      const avatarUrl = avatarPath.startsWith('http')
        ? avatarPath
        : `http://localhost:8080/${avatarPath}`;
      return avatarUrl;
    }
    return '/avatar-default.png';
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

  // Fetch comments
  const fetchComments = async () => {
    if (!id) return;
    
    try {
      const url = `${COMMENT_API_URL}/bai-viet/${id}`;
      console.log('=== FETCHING COMMENTS ===');
      console.log('URL:', url);
      console.log('Timestamp:', new Date().toISOString());
      
      // Thêm timestamp để tránh cache
      const response = await fetch(`${url}?t=${Date.now()}`);
      console.log('Comments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Comments API response:', data);
        
        // Kiểm tra cấu trúc dữ liệu trả về
        let commentsArray: Comment[] = [];
        
        if (Array.isArray(data)) {
          commentsArray = data;
        } else if (data.binhLuan && Array.isArray(data.binhLuan)) {
          commentsArray = data.binhLuan;
        } else if (data.data && Array.isArray(data.data)) {
          commentsArray = data.data;
        } else if (data.content && Array.isArray(data.content)) {
          commentsArray = data.content;
        } else {
          console.warn('Unexpected comments data structure:', data);
          commentsArray = [];
        }
        
        console.log('Extracted comments array:', commentsArray);
        console.log('Number of comments:', commentsArray.length);
        
        // THÊM LOGIC LOẠI BỎ DUPLICATE TRƯỚC KHI XỬ LÝ
        const uniqueComments = commentsArray.filter((comment, index, self) => 
          index === self.findIndex(c => c.idBinhLuan === comment.idBinhLuan)
        );
        
        console.log('After removing duplicates:', uniqueComments.length);
        
        // Sửa lại phần xử lý comment để sử dụng đúng trường dữ liệu
        const processedComments = uniqueComments.map(comment => {
          console.log('Processing comment:', comment);
          
          // Kiểm tra xem comment có thông tin người dùng không
          if (comment.nguoiDung) {
            return {
              ...comment,
              tenNguoiDung: `${comment.nguoiDung.ho} ${comment.nguoiDung.ten}`,
              avatarNguoiDung: comment.nguoiDung.avatar
            };
          } else if (comment.tenNguoiDung) {
            return comment;
          } else {
            // Fallback: sử dụng thông tin từ user context nếu có
            return {
              ...comment,
              tenNguoiDung: user ? `${user.fullName}` : 'Người dùng',
              avatarNguoiDung: user?.avatar || '/avatar-default.png'
            };
          }
        });
        
        const organizedComments = organizeComments(processedComments);
        console.log('Final organized comments:', organizedComments);
        setComments(organizedComments);
      } else {
        console.error('Failed to fetch comments:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // Organize comments into hierarchical structure - SỬA LẠI LOGIC
  const organizeComments = (comments: Comment[]): Comment[] => {
    if (!Array.isArray(comments)) {
      console.warn('organizeComments received non-array:', comments);
      return [];
    }
    
    // THÊM LOGIC LOẠI BỎ DUPLICATE LẦN NỮA ĐỂ ĐẢM BẢO
    const uniqueComments = comments.filter((comment, index, self) => 
      index === self.findIndex(c => c.idBinhLuan === comment.idBinhLuan)
    );
    
    console.log('organizeComments - unique comments count:', uniqueComments.length);
    
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    uniqueComments.forEach(comment => {
      commentMap.set(comment.idBinhLuan, { ...comment, replies: [] });
    });

    // Second pass: organize into hierarchy
    uniqueComments.forEach(comment => {
      if (comment.idBinhLuanCha) {
        const parent = commentMap.get(comment.idBinhLuanCha);
        if (parent) {
          parent.replies = parent.replies || [];
          // KIỂM TRA XEM REPLY ĐÃ TỒN TẠI CHƯA
          const replyExists = parent.replies.some(reply => reply.idBinhLuan === comment.idBinhLuan);
          if (!replyExists) {
            parent.replies.push(commentMap.get(comment.idBinhLuan)!);
          }
        }
      } else {
        // KIỂM TRA XEM COMMENT ĐÃ TỒN TẠI CHƯA
        const commentExists = rootComments.some(c => c.idBinhLuan === comment.idBinhLuan);
        if (!commentExists) {
          rootComments.push(commentMap.get(comment.idBinhLuan)!);
        }
      }
    });

    console.log('Final root comments count:', rootComments.length);
    return rootComments;
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
        alert('Bình luận đã được gửi thành công!');
      } else {
        const errorData = await response.text();
        console.error('Failed to submit comment:', response.status, errorData);
        alert(`Lỗi gửi bình luận: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert('Lỗi kết nối khi gửi bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim() || !id) return;

    setCommentLoading(true);
    try {
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

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        fetchComments(); // Refresh comments
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${COMMENT_API_URL}/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchComments(); // Refresh comments
      }
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

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
        fetchComments();
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
          <button 
            onClick={fetchComments}
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
              <div key={comment.idBinhLuan} className="blog-comment">
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
                    </div>
                    <div className="blog-comment-date">
                      {formatDate(comment.ngayBinhLuan)}
                    </div>
                  </div>
                </div>
                
                <div className="blog-comment-content">
                  {comment.noiDung}
                </div>
                
                <div className="blog-comment-actions">
                  <button 
                    onClick={() => handleLikeComment(comment.idBinhLuan)}
                    className="blog-comment-like-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
                    Thích ({comment.soLuotThich})
                  </button>
                  
                  {user && (
                    <button 
                      onClick={() => setReplyTo(comment.idBinhLuan)}
                      className="blog-comment-reply-btn"
                    >
                      Trả lời
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyTo === comment.idBinhLuan && (
                  <div className="blog-reply-form">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Viết trả lời..."
                      rows={3}
                      required
                    />
                    <div className="blog-reply-form-actions">
                      <button 
                        onClick={() => handleSubmitReply(comment.idBinhLuan)}
                        disabled={commentLoading || !replyContent.trim()}
                        className="blog-reply-submit-btn"
                      >
                        {commentLoading ? 'Đang gửi...' : 'Gửi trả lời'}
                      </button>
                      <button 
                        onClick={() => setReplyTo(null)}
                        className="blog-reply-cancel-btn"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="blog-comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.idBinhLuan} className="blog-comment reply">
                        <div className="blog-comment-header">
                          <img
                            src={getUserAvatarUrl(reply.avatarNguoiDung)}
                            alt={`${reply.nguoiDung?.ho} ${reply.nguoiDung?.ten}`}
                            className="blog-comment-avatar"
                          />
                          <div className="blog-comment-info">
                            <div className="blog-comment-author">
                              {reply.nguoiDung?.ho} {reply.nguoiDung?.ten}
                            </div>
                            <div className="blog-comment-date">
                              {formatDate(reply.ngayBinhLuan)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="blog-comment-content">
                          {reply.noiDung}
                        </div>
                        
                        <div className="blog-comment-actions">
                          <button 
                            onClick={() => handleLikeComment(reply.idBinhLuan)}
                            className="blog-comment-like-btn"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                            </svg>
                            Thích ({reply.soLuotThich})
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