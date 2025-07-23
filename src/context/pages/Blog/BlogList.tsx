import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/Blog.css';

// Configuration for API endpoint
const API_URL = 'http://localhost:8080/api/v1/bai-viet/public';

interface BlogPost {
  id: string;
  tieuDe: string;
  noiDung: string;
  anhDaiDien?: string;
  tenTacGia: string;
  ngayDang: string;
  danhMuc?: string;
  theGan?: string[];
  luotXem?: number;
  thoiGianDoc?: number;
}

interface ApiResponse {
  baiViet?: BlogPost[];
  data?: BlogPost[];
}

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        setPosts(data.baiViet || data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
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

  const truncateText = (text: string, maxLength: number = 150): string => {
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
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
      <div className="audi-blog-container">
        <div className="audi-blog-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
        </div>
        <div className="audi-blog-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="audi-blog-card skeleton-card">
              <div className="skeleton skeleton-image"></div>
              <div className="audi-blog-card-content">
                <div className="skeleton skeleton-category"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-meta"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audi-blog-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="audi-blog-container fade-in">
      <div className="audi-blog-header">
        <h1 className="audi-blog-title">
          Tin tức & Blog
          <span className="audi-blog-brand">Audi</span>
        </h1>
        <p className="audi-blog-subtitle">
          Khám phá những câu chuyện, xu hướng và insights mới nhất từ thế giới ô tô
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Chưa có bài viết nào</h3>
          <p>Hãy quay lại sau để đọc những bài viết mới nhất</p>
        </div>
      ) : (
        <>
          <div className="audi-blog-stats">
            <span className="stats-item">
              <strong>{posts.length}</strong> bài viết
            </span>
            <span className="stats-divider">•</span>
            <span className="stats-item">Cập nhật hàng ngày</span>
          </div>
          
          <div className="audi-blog-grid">
            {posts.map((post, index) => {
              const categoryStyle = getCategoryColor(post.danhMuc || '');
              const readingTime = getReadingTime(post.noiDung || '');
              
              return (
                <article 
                  key={post.id} 
                  className="audi-blog-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link to={`/blog/${post.id}`} className="audi-blog-card-link">
                    <div className="audi-blog-card-image">
                      {post.anhDaiDien ? (
                        <img 
                          src={post.anhDaiDien} 
                          alt={post.tieuDe}
                          loading="lazy"
                        />
                      ) : (
                        <div className="placeholder-image">
                          <div className="placeholder-icon">📄</div>
                        </div>
                      )}
                      <div className="image-overlay"></div>
                    </div>
                    
                    <div className="audi-blog-card-content">
                      <div className="audi-blog-card-meta">
                        {post.danhMuc && (
                          <span 
                            className="audi-blog-category-tag"
                            style={{ 
                              backgroundColor: categoryStyle.bg,
                              color: categoryStyle.text 
                            }}
                          >
                            {post.danhMuc.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                        
                        {post.theGan && post.theGan.length > 0 && (
                          <div className="tags-container">
                            {post.theGan.slice(0, 2).map((tag) => (
                              <span key={tag} className="tag">
                                #{tag}
                              </span>
                            ))}
                            {post.theGan.length > 2 && (
                              <span className="tag tag-more">
                                +{post.theGan.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <h2 className="audi-blog-card-title">
                        {post.tieuDe}
                      </h2>
                      
                      <p className="audi-blog-card-excerpt">
                        {truncateText(post.noiDung || '')}
                      </p>
                      
                      <div className="audi-blog-card-footer">
                        <div className="audi-blog-author-info">
                          <div className="author-avatar">
                            {post.tenTacGia?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div className="author-details">
                            <span className="author-name">{post.tenTacGia}</span>
                            <span className="post-date">{formatDate(post.ngayDang)}</span>
                          </div>
                        </div>
                        
                        <div className="post-stats">
                          <span className="reading-time">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                            </svg>
                            {readingTime} phút đọc
                          </span>
                          {post.luotXem && (
                            <span className="view-count">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                              </svg>
                              {post.luotXem.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BlogList;