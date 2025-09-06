import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Typography, Tag, Avatar, Space, Divider, Skeleton } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  EyeOutlined, 
  ClockCircleOutlined,
  ArrowRightOutlined,
  CarOutlined,
  FileTextOutlined,
  StarOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { newsService, VehicleNews, BlogPost } from '../../services/newsService';
import '../../styles/NewsAndBlogSection.css';

const { Title, Text, Paragraph } = Typography;

interface NewsAndBlogSectionProps {
  title?: string;
  subtitle?: string;
}

const NewsAndBlogSection: React.FC<NewsAndBlogSectionProps> = ({
  title = "Tin tức & Cập nhật mới nhất",
  subtitle = "Khám phá những mẫu xe mới và bài viết blog mới nhất từ Audi"
}) => {
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [newVehicles, setNewVehicles] = useState<VehicleNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());

  // Fetch latest blog posts
  const fetchLatestBlogs = async () => {
    try {
      const blogs = await newsService.getLatestBlogs(3);
      setLatestBlogs(blogs);
    } catch (err) {
      console.error('Error fetching latest blogs:', err);
    }
  };

  // Fetch new vehicles
  const fetchNewVehicles = async () => {
    try {
      const vehicles = await newsService.getLatestVehicles(3);
      setNewVehicles(vehicles);
    } catch (err) {
      console.error('Error fetching new vehicles:', err);
    }
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Enhanced data fetching with progress
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingProgress(0);
      
      try {
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        await Promise.all([
          fetchLatestBlogs(),
          fetchNewVehicles()
        ]);
        
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        // Smooth transition out of loading
        setTimeout(() => setLoading(false), 300);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle favorite function
  const toggleFavorite = useCallback((itemId: string) => {
    setFavoriteItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Use service methods for formatting and utilities
  const formatDate = newsService.formatDate;
  const formatPrice = newsService.formatPrice;
  const getBlogImageUrl = newsService.getBlogImageUrl;
  const getVehicleImageUrl = newsService.getVehicleImageUrl;
  const getReadingTime = newsService.getReadingTime;
  const truncateText = newsService.truncateText;
  const getCategoryColor = newsService.getCategoryColor;

  if (loading) {
    return (
      <section className="news-blog-section loading-section" ref={sectionRef}>
        <div className="container">
          <div className="loading-indicator">
            <div className="modern-spinner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
            <div className="loading-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="loading-text">Đang tải tin tức... {loadingProgress}%</p>
            </div>
            
            {/* Loading Skeleton */}
            <div className="loading-skeleton">
              <div className="skeleton-grid">
                <div className="skeleton-column">
                  <Skeleton.Image style={{ width: '100%', height: '200px' }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
                <div className="skeleton-column">
                  <Skeleton.Image style={{ width: '100%', height: '200px' }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="news-blog-section error-section">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`news-blog-section ${isVisible ? 'section-visible' : ''}`}
      ref={sectionRef}
    >
      <div className="container">
        {/* Floating particles background */}
        <div className="floating-particles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>

        {/* Header */}
        <div className="section-header">
          <div className="title-wrapper">
            <Title level={2} className="section-title">
              <span className="title-highlight">{title}</span>
            </Title>
            <div className="title-decoration"></div>
          </div>
          <Paragraph className="section-subtitle">
            {subtitle}
          </Paragraph>
          <div className="section-divider">
            <div className="divider-line"></div>
            <div className="divider-icon">
              <StarOutlined />
            </div>
            <div className="divider-line"></div>
          </div>
        </div>

        {/* Section Headers */}
        <div className="section-headers">
          <div className="section-nav">
            <div className="nav-item">
              <CarOutlined className="nav-icon" />
              <Title level={3} className="nav-title">Xe mới ra mắt</Title>
            </div>
            <div className="nav-item">
              <FileTextOutlined className="nav-icon" />
              <Title level={3} className="nav-title">Blog mới nhất</Title>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="vehicles-section">
          <div className="vehicles-grid">
            {newVehicles.length === 0 ? (
              <div className="empty-state">
                <Text type="secondary">Chưa có xe mới nào</Text>
              </div>
            ) : (
              newVehicles.map((vehicle, index) => (
                <Card 
                  key={vehicle.id} 
                  className={`vehicle-card ${isVisible ? 'card-visible' : ''}`}
                  hoverable
                  style={{ animationDelay: `${index * 0.1}s` }}
                  cover={
                    <div className="vehicle-image">
                      <div className="image-overlay">
                        <Button 
                          className="favorite-btn"
                          shape="circle"
                          icon={
                            <HeartOutlined 
                              style={{ 
                                color: favoriteItems.has(vehicle.id.toString()) ? '#e50000' : '#fff',
                                fontSize: '16px'
                              }} 
                            />
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(vehicle.id.toString());
                          }}
                        />
                      </div>
                      <img 
                        src={getVehicleImageUrl(vehicle.id, vehicle.anhDaiDien)} 
                        alt={vehicle.tenMau}
                        onError={(e) => {
                          e.currentTarget.src = '/avatar-default.png';
                        }}
                      />
                      {vehicle.isNew && (
                        <Tag color="red" className="new-badge pulse">
                          <span>MỚI</span>
                        </Tag>
                      )}
                      <div className="image-gradient"></div>
                    </div>
                  }
                  actions={[
                    <Link to={`/product/${vehicle.id}`} key="view">
                      <Button 
                        type="primary" 
                        className="action-btn"
                        icon={<ArrowRightOutlined />}
                      >
                        Xem chi tiết
                      </Button>
                    </Link>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="vehicle-title">
                        <Text strong>{vehicle.tenMau}</Text>
                        <Text type="secondary" className="vehicle-series">
                          {vehicle.tenDong}
                        </Text>
                      </div>
                    }
                    description={
                      <div className="vehicle-info">
                        <div className="vehicle-price">
                          <Text strong className="price-text">
                            {formatPrice(vehicle.giaCoban)}
                          </Text>
                        </div>
                        <div className="vehicle-meta">
                          <Space>
                            <Text type="secondary">
                              <CalendarOutlined /> {vehicle.namSanXuat}
                            </Text>
                            <Text type="secondary">
                              Ra mắt: {formatDate(vehicle.ngayRaMat)}
                            </Text>
                          </Space>
                        </div>
                        <Paragraph 
                          className="vehicle-description"
                          ellipsis={{ rows: 2 }}
                        >
                          {truncateText(vehicle.moTa, 80)}
                        </Paragraph>
                      </div>
                    }
                  />
                </Card>
              ))
            )}
          </div>
          
          <div className="section-footer">
            <Link to="/models" className="view-all-link">
              <Button type="primary" ghost size="large">
                Xem tất cả xe
                <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </div>

        {/* Section Divider */}
        <div className="section-separator">
          <div className="separator-line"></div>
          <div className="separator-icon">
            <StarOutlined />
          </div>
          <div className="separator-line"></div>
        </div>

        {/* Blogs Grid */}
        <div className="blogs-section">
          <div className="blogs-grid">
            {latestBlogs.length === 0 ? (
              <div className="empty-state">
                <Text type="secondary">Chưa có bài viết nào</Text>
              </div>
            ) : (
              latestBlogs.map((blog, index) => {
                const categoryStyle = getCategoryColor(blog.danhMuc || '');
                const readingTime = getReadingTime(blog.noiDung || '');
                
                return (
                  <Card 
                    key={blog.id} 
                    className={`blog-card ${isVisible ? 'card-visible' : ''}`}
                    hoverable
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                    cover={
                      <div className="blog-image">
                        <div className="image-overlay">
                          <Button 
                            className="favorite-btn"
                            shape="circle"
                            icon={
                              <HeartOutlined 
                                style={{ 
                                  color: favoriteItems.has(blog.id) ? '#e50000' : '#fff',
                                  fontSize: '16px'
                                }} 
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(blog.id);
                            }}
                          />
                        </div>
                        <img 
                          src={getBlogImageUrl(blog.anhDaiDien)} 
                          alt={blog.tieuDe}
                          onError={(e) => {
                            e.currentTarget.src = '/avatar-default.png';
                          }}
                        />
                        {blog.danhMuc && (
                          <Tag 
                            className="category-tag modern-tag"
                            style={{
                              backgroundColor: categoryStyle.bg,
                              color: categoryStyle.text
                            }}
                          >
                            {blog.danhMuc.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </Tag>
                        )}
                        <div className="reading-time-badge">
                          <ClockCircleOutlined /> {readingTime} phút
                        </div>
                        <div className="image-gradient"></div>
                      </div>
                    }
                    actions={[
                      <Link to={`/blog/${blog.id}`} key="read">
                        <Button 
                          type="primary" 
                          className="action-btn"
                          icon={<ArrowRightOutlined />}
                        >
                          Đọc bài viết
                        </Button>
                      </Link>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Title level={4} className="blog-title">
                          {blog.tieuDe}
                        </Title>
                      }
                      description={
                        <div className="blog-info">
                          <Paragraph 
                            className="blog-excerpt"
                            ellipsis={{ rows: 2 }}
                          >
                            {truncateText(blog.noiDung, 100)}
                          </Paragraph>
                          
                          <div className="blog-meta">
                            <Space split={<Divider type="vertical" />}>
                              <Space size="small">
                                <Avatar 
                                  size="small" 
                                  icon={<UserOutlined />}
                                  src={blog.avatarTacGia ? getBlogImageUrl(blog.avatarTacGia) : undefined}
                                />
                                <Text type="secondary">{blog.tenTacGia}</Text>
                              </Space>
                              
                              <Space size="small">
                                <CalendarOutlined />
                                <Text type="secondary">{formatDate(blog.ngayDang)}</Text>
                              </Space>
                              
                              <Space size="small">
                                <ClockCircleOutlined />
                                <Text type="secondary">{readingTime} phút</Text>
                              </Space>
                              
                              {blog.luotXem && (
                                <Space size="small">
                                  <EyeOutlined />
                                  <Text type="secondary">{blog.luotXem}</Text>
                                </Space>
                              )}
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                );
              })
            )}
          </div>
          
          <div className="section-footer">
            <Link to="/blog" className="view-all-link">
              <Button type="primary" ghost size="large">
                Xem tất cả blog
                <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsAndBlogSection;
