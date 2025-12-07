import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, UPLOADS_URL } from '../config';

export default function Home() {
  const [settings, setSettings] = useState({
    company_name: 'Fashion Co.',
    company_slogan: 'Phong cách dẫn đầu xu hướng',
    site_logo: ''
  });

  const [products, setProducts] = useState([]);

  const MOCK_PRODUCTS = [
    { id: 'm1', name: 'Áo Khoác Bomber', price: '500000', image: '', isNew: true },
    { id: 'm2', name: 'Kính Phi Công', price: '150000', image: '', isNew: false },
    { id: 'm3', name: 'Quần Cargo', price: '350000', image: '', isNew: false, sale: true },
    { id: 'm4', name: 'Hoodie Techwear', price: '450000', image: '', isNew: false },
  ];

  useEffect(() => {
    fetch(`${API_URL}/settings.php`)
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(err => console.error("Lỗi tải Settings:", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/products.php`)
      .then(res => res.json())
      .then(json => {
        const realProducts = json.data || json;
        if (Array.isArray(realProducts) && realProducts.length > 0) {
          setProducts(realProducts);
        }
      })
      .catch(err => console.error("Lỗi tải Products (Dùng Mock):", err));
  }, []);

  // 👉 CHỈ CHỈNH ĐOẠN NÀY
  const getImgSrc = (image) => {
    if (!image) return null;
    if (image.startsWith('data:')) return image;  // base64 blob
    if (image.startsWith('http')) return image;   // ảnh online
    return `${UPLOADS_URL}/${image}`;             // ảnh file upload
  };

  const getDisplayItems = () => {
    const realItems = products.slice(0, 4);
    const needed = 4 - realItems.length;
    const filler = MOCK_PRODUCTS.slice(0, needed);
    return [...realItems, ...filler];
  };

  const displayProducts = getDisplayItems();

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen overflow-x-hidden">
      
      {/* --- HERO SECTION: COMPACT REACTOR --- */}
      <div className="relative min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white overflow-hidden pt-32 pb-[28rem]">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/40 via-transparent to-gray-900 pointer-events-none"></div>

        {/* ANCHOR POINT */}
        <div className="relative w-full max-w-7xl flex flex-col items-center justify-center">

            {/* 1. CENTER CORE: BRANDING */}
            <div className="relative z-30 text-center max-w-4xl px-4 pointer-events-none -mt-20">
                
                {/* Tên Công Ty */}
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-2xl uppercase">
                    {settings.company_name}
                </h1>

                {/* LOGO */}
                <div className="mb-6 inline-block relative group pointer-events-auto cursor-pointer">
                    <div className="absolute -inset-8 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                    
                    {settings.site_logo ? (
                        <img 
                            src={`${UPLOADS_URL}/${settings.site_logo}?t=${new Date().getTime()}`} 
                            alt="Logo" 
                            className="relative h-32 w-32 md:h-40 md:w-40 object-contain bg-black/90 backdrop-blur-xl border border-white/10 rounded-full p-5 shadow-2xl mx-auto transition transform group-hover:scale-105 z-30"
                        />
                    ) : (
                        <div className="relative h-32 w-32 md:h-40 md:w-40 bg-gray-800 border-4 border-gray-700 rounded-full flex items-center justify-center text-6xl font-bold mx-auto shadow-2xl z-30">
                            {settings.company_name.charAt(0)}
                        </div>
                    )}
                </div>
                
                {/* SLOGAN & BUTTONS */}
                <div className="relative z-40">
                    <p className="text-lg md:text-xl text-pink-400 font-light tracking-wide italic mb-8 opacity-90">
                        {settings.company_slogan}
                    </p>

                    <div className="flex justify-center gap-4 pointer-events-auto">
                        <Link to="/products" className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold text-base hover:bg-pink-500 hover:text-white transition transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            Khám Phá
                        </Link>
                        <Link to="/contact" className="px-8 py-3 border border-white/30 bg-white/5 backdrop-blur-sm rounded-full font-bold text-base hover:bg-white/10 transition transform hover:scale-105">
                            Liên Hệ
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. ORBIT: 4-CARD SMILE ARC */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] hidden lg:block pointer-events-none z-20">
                {displayProducts.map((product, index) => {
                    const total = displayProducts.length;
                    const radius = 450; 
                    
                    const startAngle = 170;
                    const endAngle = 10;
                    const range = startAngle - endAngle;
                    const angleStep = range / (total - 1);
                    
                    const currentAngle = startAngle - (index * angleStep);
                    const radian = (currentAngle * Math.PI) / 180;
                    
                    const x = Math.cos(radian) * radius;
                    const y = Math.sin(radian) * radius * 0.9; 

                    return (
                        <Link 
                            key={product.id || index}
                            to={`/products/${product.id}`}
                            className="absolute top-1/2 left-1/2 w-64 pointer-events-auto"
                            style={{
                                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                                zIndex: 50
                            }}
                        >
                            {/* CARD DESIGN - Cao 380px */}
                            <div className="group relative bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-pink-500/80 hover:bg-gray-800 transition-all duration-300 flex flex-col h-[380px] shadow-2xl hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:-translate-y-3 cursor-pointer">
                                
                                {/* ẢNH SẢN PHẨM (Chiếm 75% chiều cao - Dominant) 
                                    shrink-0 đảm bảo ảnh không bị co lại 
                                */}
                                <div className="relative h-3/4 shrink-0 overflow-hidden bg-gray-800/50">
                                    {product.image ? (
                                        <img 
                                            src={getImgSrc(product.image)} 
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition duration-700 ease-out"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                            <span className="text-3xl opacity-50">📷</span>
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
                                    
                                    <div className="absolute top-3 left-3 flex gap-1">
                                        {(product.isNew || index === 0) && (
                                            <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">Mới</span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* THÔNG TIN (Chiếm 25% chiều cao - Compact) */}
                                <div className="h-1/4 p-4 pt-2 flex flex-col justify-between bg-gray-900/40">
                                    <div>
                                        <h3 className="text-white text-base font-bold truncate mb-0.5 group-hover:text-pink-400 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="h-px bg-white/20 flex-1 group-hover:bg-pink-500/50 transition-colors"></div>
                                            <p className="text-gray-400 text-[9px] font-mono tracking-[0.2em] uppercase group-hover:text-white transition-colors">FASHION</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] text-gray-500 mb-0 font-medium group-hover:text-gray-300">ĐƠN GIÁ</p>
                                            <p className="text-xl text-white font-mono font-bold tracking-tight group-hover:text-pink-200 transition-colors">
                                                {Number(product.price).toLocaleString()}
                                                <span className="text-sm text-gray-500 font-normal ml-1">đ</span>
                                            </p>
                                        </div>
                                        
                                        <button className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-pink-500 hover:text-white hover:rotate-90 transition duration-300 shadow-lg group-hover:scale-110 transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

        </div>
      </div>

      {/* --- MOBILE FALLBACK --- */}
      <div className="lg:hidden max-w-7xl mx-auto px-6 py-12 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 gap-4">
            {displayProducts.map((product, index) => (
                <div key={`mob-${index}`} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Mobile: 2/3 Image ratio */}
                    <div className="h-48 bg-gray-200 relative">
                        {product.image && (
                            <img 
                                src={getImgSrc(product.image)} 
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        {(product.isNew || index === 0) && <span className="absolute top-2 right-2 bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded">Mới</span>}
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-sm truncate text-gray-900">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-pink-600 font-bold text-sm">{Number(product.price).toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- WHY US SECTION --- */}
      <div className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black mb-4 text-gray-900">Tại sao chọn chúng tôi?</h2>
                <div className="h-1 w-24 bg-pink-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { icon: '🚀', title: 'Thiết Kế Tương Lai', desc: 'Cập nhật những xu hướng thời trang công nghệ mới nhất.' },
                    { icon: '🛡️', title: 'Chất Lượng Cao Cấp', desc: 'Chất liệu vải bền bỉ, thoáng khí, phù hợp mọi hoạt động.' },
                    { icon: '💎', title: 'Dịch Vụ 5 Sao', desc: 'Hỗ trợ tận tâm, đổi trả linh hoạt và giao hàng thần tốc.' }
                ].map((item, idx) => (
                    <div key={idx} className="group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-pink-200 hover:shadow-xl transition duration-500">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">{item.icon}</div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900">{item.title}</h3>
                        <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

    </div>
  )
}