import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../../config';

export default function Footer() {
    // 1. State for dynamic footer data
    const [settings, setSettings] = useState({
        company_name: 'Fashion Company',
        contact_address: 'Loading...',
        contact_email: 'Loading...',
        contact_phone: 'Loading...'
    });

    // 2. Fetch from your backend
    useEffect(() => {
        fetch(`${API_URL}/settings.php`)
            .then(res => res.json())
            .then(data => {
                if (data) setSettings(data);
            })
            .catch(err => console.error("Footer settings error:", err));
    }, []);

    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1">
                        <h3 className="text-xl font-bold mb-4 text-pink-400">
                            {settings.company_name}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Thời trang cao cấp cho mọi người.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Liên kết nhanh</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-pink-400 transition">Trang chủ</Link></li>
                            <li><Link to="/products" className="text-gray-400 hover:text-pink-400 transition">Sản phẩm</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-pink-400 transition">Giới thiệu</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-pink-400 transition">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Hỗ trợ</h4>
                        <ul className="space-y-2">
                            <li><Link to="/faq" className="text-gray-400 hover:text-pink-400 transition">FAQ</Link></li>
                            <li><span className="text-gray-400 hover:text-pink-400 transition cursor-pointer">Chính sách đổi trả</span></li>
                            <li><span className="text-gray-400 hover:text-pink-400 transition cursor-pointer">Chính sách bảo mật</span></li>
                            <li><span className="text-gray-400 hover:text-pink-400 transition cursor-pointer">Điều khoản sử dụng</span></li>
                        </ul>
                    </div>

                    {/* Contact Info (Dynamic) */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Liên hệ</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-1">✉️</span>
                                <span className="break-all">{settings.contact_email}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-1">📞</span>
                                <span>{settings.contact_phone}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-1">📍</span>
                                <span>{settings.contact_address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}