import { useState, useEffect } from 'react';
import HeroBanner from '../../components/layout/HeroBanner';
import CarModelFeature from '../../components/sections/CarModelFeature';
import FeaturedProducts from '../../components/sections/FeaturedProducts';
import { useNotification } from '../../context/NotificationContext';

// Import hình ảnh
import etronGTImage from '../../assets/rs-etron-gt.jpg';
import rsSevenImage from '../../assets/audi-rs7.jpg';
import rsFiveImage from '../../assets/audi-rs5.jpg';
import aSevenImage from '../../assets/audi-a7.jpg';
import qFourImage from '../../assets/audi-r8.jpg';

import etronGTImage1 from '../../assets/etron.avif';
import rsSevenImage1 from '../../assets/rs7.jpeg';
import rsFiveImage1 from '../../assets/rs5.avif';
import aSevenImage1 from '../../assets/a7.jpg';
import qFourImage1 from '../../assets/r8.jpg';

const Home = () => {
  const { showNotification } = useNotification();
  
  // Check for login success message when component mounts
  useEffect(() => {
    const loginSuccessMessage = localStorage.getItem('loginSuccessMessage');
    if (loginSuccessMessage) {
      // Use the same notification system as logout to display the message
      showNotification('success', loginSuccessMessage);
      // Remove the message from localStorage
      localStorage.removeItem('loginSuccessMessage');
    }
  }, [showNotification]);

  const carModels = [
    {
      id: 0,
      backgroundImage: etronGTImage,
      title: "2023 Audi RS e-tron® GT",
      subtitle: "Hiệu suất điện chưa bao giờ đẹp đến thế",
      price: "Giá từ 3.500.000.000 VNĐ",
      description: "Sạc nhanh. Công suất sạc lên đến 270kW với công nghệ 800V, Audi RS e-tron GT có thể sạc từ 5% đến 80% trong khoảng 23 phút. Hệ thống định vị thông minh xác định các trạm sạc dọc theo lộ trình, chủ động dự đoán nhu cầu sạc cho các hành trình dài.",
      cta: {
        primary: { text: "Xây dựng & Báo giá", link: "/configure/rs-e-tron-gt" },
        secondary: { text: "Nhận tin tức & cập nhật Audi", link: "/news" }
      },
      specs: {
        power: { value: "637 HP", subtext: "Với Boost Engaged" },
        battery: { value: "93 kWh", subtext: "Tổng dung lượng pin" },
        acceleration: { value: "3.1 giây", subtext: "Với Boost Engaged" }
      }
    },
    {
      id: 1,
      backgroundImage: rsSevenImage,
      title: "2023 Audi RS7",
      subtitle: "Hiệu suất đỉnh cao kết hợp thiết kế thanh lịch",
      price: "Giá từ 2.900.000.000 VNĐ",
      description: "Công nghệ tiên tiến. RS7 được trang bị hệ thống treo khí nén thích ứng tiêu chuẩn, có thể tự động điều chỉnh độ cao gầm xe dựa trên điều kiện đường và tốc độ, cung cấp sự cân bằng hoàn hảo giữa hiệu suất và sự thoải mái.",
      cta: {
        primary: { text: "Xây dựng & Báo giá", link: "/configure/rs7" },
        secondary: { text: "Nhận tin tức & cập nhật Audi", link: "/news" }
      },
      specs: {
        power: { value: "591 HP", subtext: "Động cơ TFSI®" },
        battery: { value: "4.0L V8", subtext: "Twin-Turbo TFSI" },
        acceleration: { value: "3.5 giây", subtext: "0-100 km/h" }
      }
    },
    {
      id: 2,
      backgroundImage: rsFiveImage,
      title: "2023 Audi RS5",
      subtitle: "Vóc dáng thể thao với DNA đua xe",
      price: "Giá từ 1.800.000.000 VNĐ",
      description: "Hiệu suất vượt trội. Với động cơ V6 2.9L Biturbo mạnh mẽ và hệ thống dẫn động quattro® tiên tiến, RS5 mang đến khả năng xử lý chính xác và kiểm soát tối ưu trong mọi điều kiện lái xe, đồng thời tạo ra âm thanh đặc trưng đầy phấn khích.",
      cta: {
        primary: { text: "Xây dựng & Báo giá", link: "/configure/rs5" },
        secondary: { text: "Nhận tin tức & cập nhật Audi", link: "/news" }
      },
      specs: {
        power: { value: "444 HP", subtext: "Động cơ TFSI®" },
        battery: { value: "2.9L V6", subtext: "Biturbo TFSI" },
        acceleration: { value: "3.7 giây", subtext: "0-100 km/h" }
      }
    },
    {
      id: 3,
      backgroundImage: aSevenImage,
      title: "2023 Audi A7",
      subtitle: "Sự thanh lịch tinh tế với công nghệ tiên tiến",
      price: "Giá từ 1.650.000.000 VNĐ",
      description: "Thiết kế đẹp mắt. A7 Sportback kết hợp tính thẩm mỹ của một chiếc coupe, sự tiện nghi của một sedan và tính thực dụng của một wagon. Cửa sau Sportback cho phép tiếp cận dễ dàng đến không gian hành lý rộng rãi, kết hợp sự sang trọng và tính thực dụng một cách hoàn hảo.",
      cta: {
        primary: { text: "Xây dựng & Báo giá", link: "/configure/a7" },
        secondary: { text: "Nhận tin tức & cập nhật Audi", link: "/news" }
      },
      specs: {
        power: { value: "335 HP", subtext: "Động cơ TFSI®" },
        battery: { value: "3.0L V6", subtext: "Turbo TFSI & MHEV" },
        acceleration: { value: "5.2 giây", subtext: "0-100 km/h" }
      }
    },
    {
      id: 4,
      backgroundImage: qFourImage,
      title: "2023 Audi R8",
      subtitle: "Siêu xe đỉnh cao với hiệu suất đua xe thuần túy",
      price: "Giá từ 5.800.000.000 VNĐ",
      description: "Hiệu suất đỉnh cao. Được trang bị động cơ V10 5.2L FSI® mạnh mẽ, Audi R8 mang đến trải nghiệm lái xe thuần túy đầy phấn khích. Vận hành linh hoạt cùng hệ thống quattro® cải tiến, chiếc siêu xe này luôn sẵn sàng cho mọi cung đường, mang đến cảm giác lái xe đúng nghĩa đua.",
      cta: {
        primary: { text: "Xây dựng & Báo giá", link: "/configure/r8" },
        secondary: { text: "Nhận tin tức & cập nhật Audi", link: "/news" }
      },
      specs: {
        power: { value: "602 HP", subtext: "Động cơ V10 FSI®" },
        battery: { value: "5.2L V10", subtext: "Naturally Aspirated" },
        acceleration: { value: "3.1 giây", subtext: "0-100 km/h" }
      }
    }
  ];

  const featureModels = [
    {
      backgroundImage: etronGTImage1,
      featureTitle: "Sạc nhanh.",
      featureDescription: "Công suất sạc lên đến 270kW với công nghệ 800V, Audi RS e-tron GT có thể sạc từ 5% đến 80% trong khoảng 23 phút. Hệ thống định vị thông minh xác định các trạm sạc dọc theo lộ trình, chủ động dự đoán nhu cầu sạc cho các hành trình dài.",
    },
    {
      backgroundImage: rsSevenImage1,
      featureTitle: "Công nghệ tiên tiến.",
      featureDescription: "RS7 được trang bị hệ thống treo khí nén thích ứng tiêu chuẩn, có thể tự động điều chỉnh độ cao gầm xe dựa trên điều kiện đường và tốc độ, cung cấp sự cân bằng hoàn hảo giữa hiệu suất và sự thoải mái.",
    },
    {
      backgroundImage: rsFiveImage1,
      featureTitle: "Hiệu suất vượt trội.",
      featureDescription: "Với động cơ V6 2.9L Biturbo mạnh mẽ và hệ thống dẫn động quattro® tiên tiến, RS5 mang đến khả năng xử lý chính xác và kiểm soát tối ưu trong mọi điều kiện lái xe, đồng thời tạo ra âm thanh đặc trưng đầy phấn khích.",
    },
    {
      backgroundImage: aSevenImage1,
      featureTitle: "Thiết kế đẹp mắt.",
      featureDescription: "A7 Sportback kết hợp tính thẩm mỹ của một chiếc coupe, sự tiện nghi của một sedan và tính thực dụng của một wagon. Cửa sau Sportback cho phép tiếp cận dễ dàng đến không gian hành lý rộng rãi, kết hợp sự sang trọng và tính thực dụng một cách hoàn hảo.",
    },
    {
      backgroundImage: qFourImage1,
      featureTitle: "Hiệu suất đỉnh cao.",
      featureDescription: "Được trang bị động cơ V10 5.2L FSI® mạnh mẽ, Audi R8 mang đến trải nghiệm lái xe thuần túy đầy phấn khích. Vận hành linh hoạt cùng hệ thống quattro® cải tiến, chiếc siêu xe này luôn sẵn sàng cho mọi cung đường, mang đến cảm giác lái xe đúng nghĩa đua.",
    }
  ];

  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);

  const handleModelDotClick = (index: number) => {
    setCurrentModelIndex(index);
  };

  const handleFeaturePrev = () => {
    setSelectedFeatureIndex(prevIndex => 
      prevIndex === 0 ? featureModels.length - 1 : prevIndex - 1
    );
  };

  const handleFeatureNext = () => {
    setSelectedFeatureIndex(prevIndex => 
      (prevIndex + 1) % featureModels.length
    );
  };

  const handleFeatureDotClick = (index: number) => {
    setSelectedFeatureIndex(index);
  };

  return (
    <div className="home-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', gap: '0' }}>
      <HeroBanner 
        {...carModels[currentModelIndex]} 
        totalModels={carModels.length}
        currentIndex={currentModelIndex}
        onDotClick={handleModelDotClick}
      />
      
      <CarModelFeature 
        {...featureModels[selectedFeatureIndex]} 
        totalModels={featureModels.length}
        currentIndex={selectedFeatureIndex}
        onPrev={handleFeaturePrev}
        onNext={handleFeatureNext}
        onDotClick={handleFeatureDotClick}
      />
      
      <FeaturedProducts 
        title="Dòng xe nổi bật của Audi" 
        subtitle="Khám phá các dòng xe Audi đỉnh cao với thiết kế đẹp mắt và công nghệ tiên tiến"
      />
    </div>
  );
};

export default Home;