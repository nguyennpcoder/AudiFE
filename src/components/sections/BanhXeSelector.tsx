import React, { useState, useEffect } from 'react';
import { banhXeService, BanhXe, HinhAnhBanhXe } from '../../services/banhXeService';
import './BanhXeSelector.css';

interface BanhXeSelectorProps {
    idMau: number;
    idMauSac?: number;
    onBanhXeChange: (banhXe: BanhXe) => void;
    selectedBanhXe?: BanhXe;
}

const BanhXeSelector: React.FC<BanhXeSelectorProps> = ({
    idMau,
    idMauSac,
    onBanhXeChange,
    selectedBanhXe
}) => {
    const [banhXeList, setBanhXeList] = useState<BanhXe[]>([]);
    const [hinhAnhBanhXe, setHinhAnhBanhXe] = useState<HinhAnhBanhXe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBanhXe();
    }, [idMau]);

    useEffect(() => {
        if (selectedBanhXe) {
            loadHinhAnhBanhXe();
        }
    }, [selectedBanhXe, idMauSac]);

    const loadBanhXe = async () => {
        try {
            setLoading(true);
            const data = await banhXeService.getBanhXeByMauXe(idMau);
            setBanhXeList(data);
            
            // Tự động chọn bánh xe mặc định nếu chưa có bánh xe được chọn
            if (!selectedBanhXe && data.length > 0) {
                const banhXeMacDinh = data.find(bx => bx.giaThem === 0) || data[0];
                onBanhXeChange(banhXeMacDinh);
            }
        } catch (err) {
            setError('Không thể tải danh sách bánh xe');
            console.error('Error loading banh xe:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadHinhAnhBanhXe = async () => {
        if (!selectedBanhXe) return;

        try {
            let data: HinhAnhBanhXe[];
            if (idMauSac) {
                data = await banhXeService.getHinhAnhBanhXeByMauSac(idMau, selectedBanhXe.id, idMauSac);
            } else {
                data = await banhXeService.getHinhAnhBanhXe(idMau, selectedBanhXe.id);
            }
            setHinhAnhBanhXe(data);
        } catch (err) {
            console.error('Error loading hinh anh banh xe:', err);
        }
    };

    const handleBanhXeSelect = (banhXe: BanhXe) => {
        onBanhXeChange(banhXe);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return <div className="banh-xe-selector-loading">Đang tải bánh xe...</div>;
    }

    if (error) {
        return <div className="banh-xe-selector-error">{error}</div>;
    }

    return (
        <div className="banh-xe-selector">
            <h3 className="banh-xe-selector-title">Chọn Bánh Xe</h3>
            
            <div className="banh-xe-list">
                {banhXeList.map((banhXe) => (
                    <div
                        key={banhXe.id}
                        className={`banh-xe-item ${selectedBanhXe?.id === banhXe.id ? 'selected' : ''}`}
                        onClick={() => handleBanhXeSelect(banhXe)}
                    >
                        <div className="banh-xe-image">
                            <img src={banhXe.duongDanAnh} alt={banhXe.ten} />
                        </div>
                        
                        <div className="banh-xe-info">
                            <h4 className="banh-xe-name">{banhXe.ten}</h4>
                            <p className="banh-xe-description">{banhXe.moTa}</p>
                            <div className="banh-xe-details">
                                <span className="banh-xe-size">{banhXe.kichThuoc}</span>
                                <span className="banh-xe-material">{banhXe.chatLieu}</span>
                            </div>
                            <div className="banh-xe-price">
                                {banhXe.giaThem === 0 ? (
                                    <span className="banh-xe-standard">Standard</span>
                                ) : (
                                    <span className="banh-xe-additional-price">
                                        {formatPrice(banhXe.giaThem)}
                                    </span>
                                )}
                            </div>
                            <button className="banh-xe-feature-link">
                                View key feature info
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hiển thị hình ảnh bánh xe được chọn */}
            {selectedBanhXe && hinhAnhBanhXe.length > 0 && (
                <div className="banh-xe-gallery">
                    <h4 className="banh-xe-gallery-title">Hình ảnh {selectedBanhXe.ten}</h4>
                    <div className="banh-xe-gallery-grid">
                        {hinhAnhBanhXe
                            .filter(hinh => hinh.loaiHinh === 'banh_xe')
                            .sort((a, b) => a.viTri - b.viTri)
                            .map((hinh, index) => (
                                <div key={hinh.id} className="banh-xe-gallery-item">
                                    <img 
                                        src={hinh.duongDanAnh} 
                                        alt={`${selectedBanhXe.ten} - ${index + 1}`}
                                        className="banh-xe-gallery-image"
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BanhXeSelector; 