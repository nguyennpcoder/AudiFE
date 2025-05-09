// frontend/audi/src/components/sections/FeaturedProducts.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/FeaturedProducts.css';

// Import hình ảnh từ thư mục assets (sẽ dùng làm fallback)
import rs7Image from '../../assets/rs7.jpeg';
import q4Image from '../../assets/audi-q4.jpg';
import a7Image from '../../assets/audi-a7.jpg';
import rs5Image from '../../assets/audi-rs5.jpg';
import etronImage from '../../assets/rs-etron-gt.jpg';
import r8Image from '../../assets/audi-r8.jpg';

// Khai báo kiểu dữ liệu
interface MauXe {
  id: number;
  idDong: number;
  tenDong: string;
  tenMau: string;
  namSanXuat: number;
  giaCoban: number;
  moTa: string;
  thongSoKyThuat: string;
  conHang: boolean;
  ngayRaMat: string;
}

interface HinhAnhXe {
  id: number;
  idMauXe: number;
  duongDanAnh: string;
  loaiHinh: string;
  viTri?: number;
}

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

const BACKEND_URL = 'http://localhost:8080';
// Ảnh mặc định hiển thị khi không tìm thấy ảnh
const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+No image</dGV4dD48L3N2Zz4=";

// Mapping ID sản phẩm với ảnh từ assets (dùng làm fallback)
const productImageMap: Record<number, string> = {
  1: rs7Image,
  2: q4Image,
  3: a7Image,
  4: rs5Image,
  5: etronImage,
  6: r8Image
};

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = "Dòng xe nổi bật", 
  subtitle = "Khám phá các dòng xe Audi đỉnh cao với thiết kế đẹp mắt và công nghệ tiên tiến" 
}) => {
  const [products, setProducts] = useState<MauXe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<Record<number, HinhAnhXe[]>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [filterChanged, setFilterChanged] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Xử lý khi thay đổi danh mục lọc
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setFilterChanged(true);
    
    // Đánh dấu tất cả các card hiển thị ngay lập tức sau khi lọc
    setTimeout(() => {
      productRefs.current.forEach((ref) => {
        if (ref) {
          ref.classList.add('visible');
        }
      });
    }, 50);
  };

  // Thêm style tag cập nhật
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      }
      
      .product-card {
        background-color: #fff;
        overflow: hidden;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        height: 100%;
        display: flex;
        flex-direction: column;
        width: 100%;
        border-radius: 4px;
      }
      
      .product-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 25px rgba(0, 0, 0, 0.09);
      }
      
      .product-image {
        position: relative;
        height: 0;
        padding-bottom: 60%; /* Giảm tỷ lệ khung hình */
        width: 100%;
        background-color: #f8f8f8;
        overflow: hidden;
      }
      
      .product-image img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
      }
      
      .product-card:hover .product-image img {
        transform: scale(1.05);
      }
      
      .product-info {
        padding: 1rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: #fff;
      }
      
      .product-model h3 {
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: 0.2rem;
        color: #111;
        letter-spacing: -0.01em;
        line-height: 1.2;
      }
      
      .product-series {
        color: #777;
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .product-details {
        margin: 0.7rem 0;
      }
      
      .product-year {
        color: #666;
        font-weight: 500;
        font-size: 0.85rem;
        background-color: #f5f5f5;
        padding: 0.3rem 0.7rem;
        border-radius: 3px;
      }
      
      .product-price {
        font-weight: 700;
        font-size: 1.4rem;
        color: #000;
      }
      
      .product-description {
        margin-bottom: 1rem;
        min-height: 2.5em;
      }
      
      .product-actions {
        margin-top: auto;
        display: flex;
        gap: 0.8rem;
      }
      
      .btn-view-details, .btn-configure, .btn-view-all {
        position: relative;
        overflow: hidden;
        text-decoration: none;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.85rem;
        z-index: 1;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .btn-view-details {
        border: 1px solid rgba(255, 255, 255, 0.3);
        background-color: rgba(0, 0, 0, 0.4);
        color: white;
        padding: 0.7rem 0;
      }
      
      .btn-view-details::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        z-index: -1;
      }
      
      .btn-view-details:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        color: white;
      }
      
      .btn-view-details:hover::before {
        transform: translateX(0);
      }
      
      .btn-configure {
        background-color: #000;
        color: #fff;
        border: 1px solid #000;
        padding: 0.7rem 0;
      }
      
      .btn-configure::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(186, 183, 183);
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        z-index: -1;
      }
      
      .btn-configure:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        color: #000;
        border-color: rgb(186, 183, 183);
      }
      
      .btn-configure:hover::before {
        transform: translateX(0);
      }
      
      .btn-view-all {
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        color: var(--audi-light);
        padding: 0.8rem 2rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      
      .btn-view-all i {
        transition: transform 0.3s ease;
      }
      
      .btn-view-all::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        z-index: -1;
      }
      
      .btn-view-all:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 255, 255, 0.5);
      }
      
      .btn-view-all:hover i {
        transform: translateX(5px);
      }
      
      .btn-view-all:hover::before {
        transform: translateX(0);
      }
      
      @keyframes subtle-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
        }
        70% {
          box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
        }
      }
      
      .btn-view-details, .btn-configure, .btn-view-all {
        animation: subtle-pulse 2s infinite;
      }
      
      .btn-view-details:hover, .btn-configure:hover, .btn-view-all:hover {
        animation: none;
      }
      
      /* Main header animation styles */
      .hero-header {
        position: relative;
        padding: 6rem 0 6rem;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.9);
        overflow: hidden;
      }
      
      .hero-title {
        position: relative;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        transition-delay: 0.1s;
        color: #fff;
        font-size: 4rem;
        font-weight: 300;
        letter-spacing: -0.02em;
        margin-bottom: 1.5rem;
      }
      
      .hero-title.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .hero-title.hidden {
        opacity: 0;
        transform: translateY(-30px);
        transition-delay: 0.1s;
      }
      
      .hero-subtitleProducts {
        position: relative;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        transition-delay: 0.3s;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.2rem;
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.6;
        margin-bottom: -100px;
      }
      
      .hero-subtitleProducts.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .hero-subtitleProducts.hidden {
        opacity: 0;
        transform: translateY(30px);
        transition-delay: 0.05s;
      }
      
      .hero-divider {
        width: 400px;
        height: 2px;
        background-color: #e50000;
        margin: 2rem auto;
        position: relative;
        opacity: 0;
        transform: scaleX(0);
        transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        transition-delay: 0.5s;
      }
      
      .hero-divider.visible {
        opacity: 1;
        transform: scaleX(1);
      }
      
      .hero-divider.hidden {
        opacity: 0;
        transform: scaleX(0);
        transition-delay: 0.2s;
      }
      
      /* Enhanced scroll animation styles */
      .section-header, .products-filter, .section-footer {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), 
                    transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
      }
      
      .section-header.visible, .products-filter.visible, .section-footer.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .section-header.hidden, .products-filter.hidden, .section-footer.hidden {
        opacity: 0;
        transform: translateY(30px);
      }
      
      .product-card {
        opacity: 0;
        transform: translateY(40px) scale(0.97);
        transition: opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), 
                    transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1),
                    box-shadow 0.3s ease;
        will-change: transform, opacity;
      }
      
      .product-card.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      .product-card.hidden {
        opacity: 0;
        transform: translateY(40px) scale(0.97);
        transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), 
                    transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
      }
      
      .filter-changed .product-card {
        transition: opacity 0.4s ease-out, transform 0.4s ease-out, box-shadow 0.3s ease;
      }
      
      .product-image {
        position: relative;
        height: 0;
        padding-bottom: 66.67%;
        width: 100%;
        background-color: #fff;
        overflow: hidden;
        transform: translateY(15px);
        opacity: 0;
        transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), 
                    opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
        transition-delay: 0.1s;
      }
      
      .product-card.visible .product-image {
        transform: translateY(0);
        opacity: 1;
      }
      
      .filter-changed .product-card .product-image {
        transition: transform 0.5s ease-out, opacity 0.5s ease-out;
        transition-delay: 0s;
      }
      
      .product-model h3, 
      .product-series,
      .product-details,
      .product-description,
      .product-actions {
        opacity: 0;
        transform: translateY(15px);
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      
      .product-card.visible .product-model h3 {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.2s;
      }
      
      .product-card.visible .product-series {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.25s;
      }
      
      .product-card.visible .product-details {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.3s;
      }
      
      .product-card.visible .product-description {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.35s;
      }
      
      .product-card.visible .product-actions {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.4s;
      }
      
      /* Add styles for hidden card content */
      .product-card.hidden .product-model h3,
      .product-card.hidden .product-series,
      .product-card.hidden .product-details,
      .product-card.hidden .product-description,
      .product-card.hidden .product-actions {
        opacity: 0;
        transform: translateY(15px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .product-card.hidden .product-model h3 { transition-delay: 0.05s; }
      .product-card.hidden .product-series { transition-delay: 0.08s; }
      .product-card.hidden .product-details { transition-delay: 0.1s; }
      .product-card.hidden .product-description { transition-delay: 0.12s; }
      .product-card.hidden .product-actions { transition-delay: 0.15s; }
      
      /* Progressive animation based on card position - only for initial scroll */
      .product-card:nth-child(3n+1) { transition-delay: 0.05s; }
      .product-card:nth-child(3n+2) { transition-delay: 0.15s; }
      .product-card:nth-child(3n+3) { transition-delay: 0.25s; }
      
      /* Filter changed overrides staggered delays */
      .filter-changed .product-card:nth-child(3n+1),
      .filter-changed .product-card:nth-child(3n+2),
      .filter-changed .product-card:nth-child(3n+3) {
        transition-delay: 0s;
      }
      
      /* Progress indicator effect */
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: linear-gradient(to right, #e50000, #ff3333);
        z-index: 1000;
        transition: width 0.2s ease-out;
      }
      
      /* Enhanced filter buttons */
      .products-filter {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin-bottom: 4rem;
        position: relative;
      }
      
      .filter-btn {
        background: none;
        border: none;
        font-size: 0.95rem;
        font-weight: 500;
        color: rgba(230, 226, 226, 0.7);
        padding: 0.6rem 1.5rem;
        cursor: pointer;
        position: relative;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0;
        transform: translateY(15px);
        transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
                    opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
                    color 0.3s ease;
      }
      
      .products-filter.visible .filter-btn {
        opacity: 1;
        transform: translateY(0);
      }
      
      .filter-btn::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 2px;
        background-color: #e50000;
        transition: width 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      
      .filter-btn:hover {
        color: rgb(248, 193, 193);
      }
      
      .filter-btn.active {
       color: rgb(249, 108, 108);
        font-weight: 600;
      }
      
      .filter-btn.active::after {
        width: 30px;
      }
      
      /* Filter button animation sequence */
      .products-filter.visible .filter-btn:nth-child(1) { transition-delay: 0.05s; }
      .products-filter.visible .filter-btn:nth-child(2) { transition-delay: 0.1s; }
      .products-filter.visible .filter-btn:nth-child(3) { transition-delay: 0.15s; }
      .products-filter.visible .filter-btn:nth-child(4) { transition-delay: 0.2s; }
      .products-filter.visible .filter-btn:nth-child(5) { transition-delay: 0.25s; }
      
      @media (min-width: 1200px) {
        .products-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }
      }
      
      @media (max-width: 992px) {
        .products-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        
        .product-info {
          padding: 1.1rem;
        }
        
        .product-model h3 {
          font-size: 1.4rem;
        }
      }
      
      @media (max-width: 768px) {
        .products-grid {
          grid-template-columns: 1fr;
        }
        
        .product-image {
          padding-bottom: 60%;
        }
        
        .hero-title {
          font-size: 2.5rem;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Thêm trạng thái scroll trước đó để xác định hướng cuộn
    let lastScrollTop = 0;
    
    // Thêm scroll event listener cho hiệu ứng scroll
    const handleScroll = () => {
      const currentScrollTop = window.scrollY;
      const scrollingDown = currentScrollTop > lastScrollTop;
      
      // Kiểm tra phần header hero khi scroll
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        // Header trong tầm nhìn khi scroll xuống
        const headerInView = headerRect.top <= window.innerHeight * 0.5 && 
                            headerRect.bottom >= 0;
        
        // Header không còn trong tầm nhìn khi scroll lên
        const headerOutOfView = headerRect.bottom < window.innerHeight * 0.3 || 
                               headerRect.top > window.innerHeight * 0.7;
        
        if (scrollingDown) {
          // Khi scroll xuống và header trong tầm nhìn
          if (headerInView && !headerVisible) {
            setHeaderVisible(true);
            
            // Thêm class visible
            if (headerRef.current.querySelector('.hero-title')) {
              headerRef.current.querySelector('.hero-title')?.classList.add('visible');
              headerRef.current.querySelector('.hero-title')?.classList.remove('hidden');
            }
            if (headerRef.current.querySelector('.hero-subtitleProducts')) {
              headerRef.current.querySelector('.hero-subtitleProducts')?.classList.add('visible');
              headerRef.current.querySelector('.hero-subtitleProducts')?.classList.remove('hidden');
            }
            if (headerRef.current.querySelector('.hero-divider')) {
              headerRef.current.querySelector('.hero-divider')?.classList.add('visible');
              headerRef.current.querySelector('.hero-divider')?.classList.remove('hidden');
            }
          }
        } else {
          // Khi scroll lên và header trong tầm nhìn
          if (headerRect.top <= 0 && headerRect.bottom >= 0) {
            // Thêm class hidden cho hiệu ứng thu về khi scroll lên
            if (headerRef.current.querySelector('.hero-title')) {
              headerRef.current.querySelector('.hero-title')?.classList.add('hidden');
              headerRef.current.querySelector('.hero-title')?.classList.remove('visible');
            }
            if (headerRef.current.querySelector('.hero-subtitleProducts')) {
              headerRef.current.querySelector('.hero-subtitleProducts')?.classList.add('hidden');
              headerRef.current.querySelector('.hero-subtitleProducts')?.classList.remove('visible');
            }
            if (headerRef.current.querySelector('.hero-divider')) {
              headerRef.current.querySelector('.hero-divider')?.classList.add('hidden');
              headerRef.current.querySelector('.hero-divider')?.classList.remove('visible');
            }
            
            if (headerVisible) {
              setHeaderVisible(false);
            }
          }
        }
      }
      
      // Kiểm tra khi phần sản phẩm vào viewport
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight * 0.7;
        
        if (isInView && !isVisible && scrollingDown) {
          setIsVisible(true);
        }
        
        // Chỉ kích hoạt animation khi scroll - không kích hoạt khi lọc
        if (!filterChanged && !initialLoad) {
          // Kiểm tra từng sản phẩm có trong viewport không
          productRefs.current.forEach((ref, index) => {
            if (ref) {
              const cardRect = ref.getBoundingClientRect();
              // Nếu scroll xuống và card trong viewport
              if (scrollingDown) {
                const cardVisible = cardRect.top <= window.innerHeight * 0.9 && 
                                   cardRect.bottom >= 0;
                
                if (cardVisible) {
                  ref.classList.add('visible');
                  ref.classList.remove('hidden');
                }
              } 
              // Nếu scroll lên và card gần ra khỏi viewport
              else {
                // Với điều kiện này - hiển thị sớm hơn khi phần lớn card đã vào viewport
                const cardVisible = cardRect.top <= window.innerHeight * 0.8 && 
                                  cardRect.bottom >= window.innerHeight * 0.4;
                
                if (cardVisible) {
                  ref.classList.add('visible');
                  ref.classList.remove('hidden');
                } else {
                  ref.classList.add('hidden');
                  ref.classList.remove('visible');
                }
              }
            }
          });
        }
        
        // Tính toán tiến trình scroll cho thanh tiến trình
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrolled = (scrollPosition / (docHeight - windowHeight)) * 100;
        setScrollProgress(scrolled);
      }
      
      // Cập nhật vị trí scroll trước đó
      lastScrollTop = currentScrollTop;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Kiểm tra ban đầu để setup thanh cuộn
    handleScroll();
    
    // Cleanup khi component unmount
    return () => {
      document.head.removeChild(styleElement);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible, headerVisible, filterChanged, initialLoad]);

  // Khởi tạo references cho từng card
  useEffect(() => {
    if (products.length > 0) {
      productRefs.current = productRefs.current.slice(0, products.length);
    }
  }, [products]);

  // Đặt lại trạng thái filterChanged khi danh sách sản phẩm lọc thay đổi
  useEffect(() => {
    if (filterChanged) {
      if (gridRef.current) {
        gridRef.current.classList.add('filter-changed');
      }
      
      // Reset trạng thái sau khi animation hoàn tất
      const timer = setTimeout(() => {
        setFilterChanged(false);
        if (gridRef.current) {
          gridRef.current.classList.remove('filter-changed');
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [filterChanged, activeCategory]);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Lấy danh sách xe còn hàng
        const response = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/con-hang?conHang=true`);
        const data = response.data;
        
        // Lọc chỉ lấy 6 sản phẩm mới nhất
        const limitedProducts = data
          .sort((a: MauXe, b: MauXe) => b.namSanXuat - a.namSanXuat)
          .slice(0, 6);
        
        setProducts(limitedProducts);
        
        // Tạo danh sách phân loại
        const uniqueCategories = Array.from(
          new Set(limitedProducts.map((product: MauXe) => product.tenDong))
        );
        setCategories(uniqueCategories as string[]);
        
        // Lấy hình ảnh cho từng sản phẩm
        const imagesObj: Record<number, HinhAnhXe[]> = {};
        for (const product of limitedProducts) {
          const images = await fetchProductImages(product.id);
          imagesObj[product.id] = images;
        }
        setProductImages(imagesObj);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Fetch product images from API
  const fetchProductImages = async (productId: number) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tải hình ảnh cho sản phẩm ${productId}:`, error);
      return [];
    }
  };

  // Format giá tiền theo định dạng Việt Nam
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Lọc sản phẩm theo danh mục
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.tenDong === activeCategory);

  // Hàm lấy URL hình ảnh cho sản phẩm
  const getProductImageUrl = (productId: number): string => {
    if (!productImages[productId] || productImages[productId].length === 0) {
      return productImageMap[productId] || FALLBACK_IMAGE;
    }

    const images = productImages[productId];
    const thumbnailImage = images.find(img => img.loaiHinh === 'thu_nho');
    const exteriorImage = images.find(img => img.loaiHinh === 'ngoai_that');
    const anyImage = images[0];
    
    const selectedImage = thumbnailImage || exteriorImage || anyImage;
    
    if (selectedImage && selectedImage.duongDanAnh) {
      // Đảm bảo URL đúng định dạng
      if (selectedImage.duongDanAnh.startsWith('http')) {
        return selectedImage.duongDanAnh;
      } else {
        return `${BACKEND_URL}${selectedImage.duongDanAnh}`;
      }
    }
    
    return productImageMap[productId] || FALLBACK_IMAGE;
  };

  // Hiển thị tất cả các sản phẩm khi component được tải
  useEffect(() => {
    if (products.length > 0 && initialLoad) {
      // Đánh dấu tất cả card là visible khi lần đầu load
      setTimeout(() => {
        productRefs.current.forEach((ref) => {
          if (ref) {
            ref.classList.add('visible');
          }
        });
        setInitialLoad(false); // Đánh dấu là đã qua lần load đầu tiên
      }, 100);
    }
  }, [products, initialLoad]);

  if (isLoading) {
    return (
      <section className="featured-products-section loading-section">
        <div className="container">
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-products-section error-section">
        <div className="container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
      
      <div className="hero-header" ref={headerRef}>
        <div className="container">
          <h1 className={`hero-title ${headerVisible ? 'visible' : ''}`}>{title}</h1>
          <div className={`hero-divider ${headerVisible ? 'visible' : ''}`}></div>
          <p className={`hero-subtitleProducts ${headerVisible ? 'visible' : ''}`}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <section className="featured-products-section" ref={sectionRef}>
        <div className="container">
          <div className={`products-filter ${isVisible ? 'visible' : ''}`}>
            <button 
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              Tất cả
            </button>
            {categories.map((category, index) => (
              <button 
                key={index}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="products-grid" ref={gridRef}>
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm nào.</p>
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`product-card ${filterChanged ? 'visible' : ''}`}
                  ref={el => {
                    productRefs.current[index] = el;
                  }}
                >
                  <div className="product-image">
                    <img 
                      src={getProductImageUrl(product.id)} 
                      alt={product.tenMau}
                      onError={(e) => {
                        e.currentTarget.src = productImageMap[product.id] || FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-model">
                      <h3>{product.tenMau}</h3>
                      <p className="product-series">{product.tenDong}</p>
                    </div>
                    <div className="product-details">
                      <p className="product-year">{product.namSanXuat}</p>
                      <p className="product-price">{formatPrice(product.giaCoban)}</p>
                    </div>
                    <p className="product-description">
                      {product.moTa ? 
                        (product.moTa.length > 100 ? 
                          product.moTa.substring(0, 100) + '...' : 
                          product.moTa) : 
                        'Không có mô tả.'}
                    </p>
                    <div className="product-actions">
                      <Link to={`/product/${product.id}`} className="btn-view-details">
                        Chi tiết
                      </Link>
                      <Link to={`/configure/${product.id}`} className="btn-configure">
                        Tùy chỉnh &amp; Báo giá
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className={`section-footer ${isVisible ? 'visible' : ''}`}>
            <Link to="/models" className="btn-view-all">
              Xem tất cả các dòng xe
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedProducts;