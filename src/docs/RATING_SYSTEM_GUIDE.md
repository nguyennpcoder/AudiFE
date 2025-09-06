# Hệ thống đánh giá mẫu xe - Hướng dẫn sử dụng

## Tổng quan

Hệ thống đánh giá được thiết kế để cho phép khách hàng đánh giá và bình luận về các mẫu xe Audi. Hệ thống bao gồm:

- **Đánh giá mẫu xe**: Khách hàng có thể đánh giá từ 1-5 sao với tiêu đề và nội dung chi tiết
- **Quản lý đánh giá**: Admin có thể duyệt, từ chối hoặc xóa đánh giá
- **Hiển thị đánh giá**: Đánh giá được hiển thị trên trang chi tiết sản phẩm và danh sách mẫu xe

## Cấu trúc dữ liệu

### Backend (Java Spring Boot)

#### Entity: DanhGia
```java
@Entity
@Table(name = "danh_gia")
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "id_nguoi_dung", nullable = false)
    private NguoiDung nguoiDung;
    
    @ManyToOne
    @JoinColumn(name = "id_mau", nullable = false)
    private MauXe mauXe;
    
    @Column(name = "so_sao", nullable = false)
    private Integer soSao; // 1-5
    
    @Column(name = "tieu_de")
    private String tieuDe;
    
    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;
    
    @Column(name = "da_mua")
    private Boolean daMua = false;
    
    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private TrangThai trangThai = TrangThai.cho_duyet;
    
    public enum TrangThai {
        cho_duyet, da_duyet, bi_tu_choi
    }
}
```

#### API Endpoints
- `POST /api/v1/danh-gia` - Tạo đánh giá mới
- `GET /api/v1/danh-gia/mau-xe/{idMauXe}` - Lấy đánh giá theo mẫu xe
- `GET /api/v1/danh-gia/mau-xe/{idMauXe}/trung-binh` - Lấy điểm trung bình
- `GET /api/v1/danh-gia/cho-duyet` - Lấy đánh giá chờ duyệt (admin)
- `PATCH /api/v1/danh-gia/{id}/duyet` - Duyệt/từ chối đánh giá (admin)
- `DELETE /api/v1/danh-gia/{id}` - Xóa đánh giá (admin)

### Frontend (React TypeScript)

#### Components

1. **StarRating** (`/components/common/StarRating.tsx`)
   - Component hiển thị sao đánh giá
   - Hỗ trợ readonly và interactive mode
   - Có thể hiển thị giá trị số

2. **VehicleRating** (`/components/sections/VehicleRating.tsx`)
   - Component đầy đủ cho đánh giá mẫu xe
   - Hiển thị tổng quan đánh giá và danh sách đánh giá
   - Form để khách hàng gửi đánh giá mới

3. **VehicleRatingSummary** (`/components/common/VehicleRatingSummary.tsx`)
   - Component tóm tắt đánh giá cho danh sách mẫu xe
   - Hiển thị điểm trung bình và số lượng đánh giá

4. **RatingManagement** (`/context/pages/admin/RatingManagement.tsx`)
   - Trang quản lý đánh giá cho admin
   - Duyệt, từ chối, xóa đánh giá

#### Service

**RatingService** (`/services/ratingService.ts`)
- Quản lý tất cả API calls liên quan đến đánh giá
- Type-safe với TypeScript interfaces

## Cách sử dụng

### 1. Hiển thị đánh giá trên trang chi tiết sản phẩm

```tsx
import VehicleRating from '../components/sections/VehicleRating';

// Trong ProductDetail component
<VehicleRating 
  mauXeId={product.id} 
  tenMauXe={product.tenMau}
  onRatingSubmit={() => {
    // Callback khi có đánh giá mới
    console.log('New rating submitted');
  }}
/>
```

### 2. Hiển thị tóm tắt đánh giá trên danh sách mẫu xe

```tsx
import VehicleRatingSummary from '../components/common/VehicleRatingSummary';

// Trong Models page
<VehicleRatingSummary 
  mauXeId={mauXe.id} 
  showCount={true} 
  size="small" 
/>
```

### 3. Sử dụng StarRating component

```tsx
import StarRating from '../components/common/StarRating';

// Readonly mode
<StarRating 
  rating={4.5} 
  size="large" 
  readonly 
  showValue 
/>

// Interactive mode
<StarRating 
  rating={userRating} 
  onChange={(newRating) => setUserRating(newRating)}
  size="medium"
/>
```

### 4. Sử dụng RatingService

```tsx
import { ratingService } from '../services/ratingService';

// Lấy đánh giá của mẫu xe
const ratings = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 10);

// Gửi đánh giá mới
await ratingService.themDanhGia({
  idNguoiDung: user.userId,
  idMauXe: mauXeId,
  soSao: 5,
  tieuDe: "Xe rất tốt",
  noiDung: "Tôi rất hài lòng với chiếc xe này...",
  daMua: true
});
```

## Quy trình đánh giá

1. **Khách hàng đánh giá**:
   - Đăng nhập vào hệ thống
   - Vào trang chi tiết mẫu xe
   - Nhấn "Đánh giá xe"
   - Điền form đánh giá (sao, tiêu đề, nội dung)
   - Gửi đánh giá

2. **Hệ thống xử lý**:
   - Đánh giá được lưu với trạng thái "cho_duyet"
   - Admin nhận thông báo có đánh giá mới

3. **Admin duyệt**:
   - Vào trang quản lý đánh giá
   - Xem chi tiết đánh giá
   - Duyệt hoặc từ chối đánh giá

4. **Hiển thị**:
   - Đánh giá đã duyệt hiển thị công khai
   - Cập nhật điểm trung bình của mẫu xe

## Tính năng bảo mật

- Chỉ người dùng đã đăng nhập mới có thể đánh giá
- Mỗi người dùng chỉ có thể đánh giá một lần cho mỗi mẫu xe
- Đánh giá phải được admin duyệt trước khi hiển thị
- Admin có quyền xóa đánh giá không phù hợp

## Responsive Design

Tất cả components đều được thiết kế responsive:
- Mobile: Hiển thị tối ưu cho màn hình nhỏ
- Tablet: Layout điều chỉnh phù hợp
- Desktop: Hiển thị đầy đủ tính năng

## Styling

- Sử dụng CSS modules cho từng component
- Tuân thủ design system của Audi
- Hỗ trợ dark/light mode
- Animation mượt mà cho trải nghiệm người dùng tốt

## Lưu ý kỹ thuật

1. **Performance**: 
   - Lazy loading cho danh sách đánh giá
   - Caching cho điểm trung bình
   - Debounce cho search

2. **Error Handling**:
   - Try-catch cho tất cả API calls
   - Fallback UI khi có lỗi
   - User-friendly error messages

3. **Accessibility**:
   - ARIA labels cho screen readers
   - Keyboard navigation
   - Color contrast đạt chuẩn

## Mở rộng trong tương lai

- Thêm tính năng like/dislike cho đánh giá
- Hệ thống báo cáo đánh giá spam
- Phân tích sentiment của đánh giá
- Tích hợp với hệ thống recommendation
- Export đánh giá ra Excel/PDF
