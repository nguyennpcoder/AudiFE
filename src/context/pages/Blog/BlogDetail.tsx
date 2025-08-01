import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../../../styles/Blog.css';

const API_URL = 'http://localhost:8080/api/v1/bai-viet';

interface BlogPost {
  id: string;
  tieuDe: string;
  noiDung: string;
  anhDaiDien?: string;
  tenTacGia: string;
  avatarTacGia?: string; // Thêm avatar của tác giả
  ngayDang: string;
  danhMuc?: string;
  theGan?: string[];
  luotXem?: number;
  thoiGianDoc?: number;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // Smooth scroll to top function with animation
  const scrollToTop = () => {
    const scrollStep = -window.scrollY / (500 / 15); // 500ms duration
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
  };

  // Get avatar URL for author (copied from Profile.tsx logic)
  const getAuthorAvatarUrl = (avatarPath?: string) => {
    if (avatarPath) {
      const avatarUrl = avatarPath.startsWith('http')
        ? avatarPath
        : `http://localhost:8080/${avatarPath}`;
      return avatarUrl;
    }
    // Return default avatar if no author avatar
    return '/avatar-default.png';
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

  // Get image URL for blog posts
  const getBlogImageUrl = (imagePath?: string) => {
    if (!imagePath) return getRandomPlaceholder();
    
    // If it's already a full URL, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path starting with /uploads/, add backend URL
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:8080${imagePath}`;
    }
    
    // If it's just a filename, assume it's in the blogs folder
    if (!imagePath.includes('/')) {
      return `http://localhost:8080/uploads/images/blogs/${imagePath}`;
    }
    
    // Default fallback
    return getRandomPlaceholder();
  };

  useEffect(() => {
    // Scroll to top when component mounts
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
          // Thay đổi URL để lấy tất cả bài viết (size=1000)
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
      default: { bg: '#f5f5f5', text: '#616161' }
    };
    return categoryColors[category] || categoryColors.default;
  };

  if (loading) {
    return (
      <div className="audi-blog-detail-container">
        <div className="blog-detail-skeleton">
          <div className="skeleton skeleton-breadcrumb"></div>
          <div className="skeleton skeleton-title-large"></div>
          <div className="skeleton skeleton-meta-large"></div>
          <div className="skeleton skeleton-image-large"></div>
          <div className="skeleton skeleton-content"></div>
          <div className="skeleton skeleton-content"></div>
          <div className="skeleton skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="audi-blog-detail-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Bài viết không tồn tại</h2>
          <p>{error || 'Không thể tìm thấy bài viết này'}</p>
          <div className="error-actions">
            <button className="retry-button" onClick={() => navigate('/blog')}>
              Về trang chủ
            </button>
            <button className="retry-button secondary" onClick={() => window.location.reload()}>
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
    // Scroll to top before navigating
    scrollToTop();
    // Small delay to ensure scroll animation starts
    setTimeout(() => {
      navigate(`/blog/${postId}`);
    }, 100);
  };

  return (
    <div className="audi-blog-detail-container fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/blog" className="breadcrumb-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
          Tin tức & Blog
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{post.tieuDe}</span>
      </nav>

      {/* Article Header */}
      <header className="article-header">
        <div className="article-meta">
          {post.danhMuc && (
            <span 
              className="audi-blog-category-tag large"
              style={{ 
                backgroundColor: categoryStyle.bg,
                color: categoryStyle.text 
              }}
            >
              {post.danhMuc.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          )}
          <div className="article-stats">
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
              </svg>
              {readingTime} phút đọc
            </span>
            {post.luotXem && (
              <span className="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                </svg>
                {post.luotXem.toLocaleString()} lượt xem
              </span>
            )}
          </div>
        </div>

        <h1 className="article-title">{post.tieuDe}</h1>

        <div className="audi-blog-author-info">
          <img
            src={authorAvatarUrl}
            alt="Author Avatar"
            className="author-avatar large"
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
          <div className="author-info">
            <div className="author-name">{post.tenTacGia}</div>
            <div className="publish-date">{formatDate(post.ngayDang)}</div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.anhDaiDien && (
        <div className="article-featured-image">
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
      <article className="article-content">
        <div 
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.noiDung }} 
        />
      </article>

      {/* Tags */}
      {post.theGan && post.theGan.length > 0 && (
        <div className="article-tags">
          <h3>Thẻ bài viết</h3>
          <div className="tags-list">
            {post.theGan.map((tag) => (
              <span key={tag} className="tag-item">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Share */}
      <div className="social-share">
        <h3>Chia sẻ bài viết</h3>
        <div className="share-buttons">
          <button className="share-btn facebook" onClick={() => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          <button className="share-btn twitter" onClick={() => {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.tieuDe)}`, '_blank');
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>
          <button className="share-btn copy" onClick={() => {
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
        <section className="audi-blog-related-posts">
          <h2>Bài viết liên quan</h2>
          <div className="related-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <div 
                key={relatedPost.id} 
                className="related-post-card"
                onClick={() => handleRelatedPostClick(relatedPost.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="related-post-image">
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
                    <div className="placeholder-image small">
                      <img 
                        src={getRandomPlaceholder()} 
                        alt="Placeholder"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
                <div className="related-post-content">
                  <h3>{relatedPost.tieuDe}</h3>
                  <div className="related-post-meta">
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
    </div>
  );
};

export default BlogDetail;