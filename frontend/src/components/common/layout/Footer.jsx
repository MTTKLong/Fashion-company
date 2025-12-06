import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../../config';

export default function Footer() {
    // 1. State for dynamic footer data
    const [settings, setSettings] = useState({
        company_name: 'Fashion Co.',
        company_slogan: 'Phong cách dẫn đầu xu hướng',
        contact_address: 'Loading...',
        contact_email: 'Loading...',
        contact_phone: 'Loading...',
        working_hours: 'Loading...'
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
        <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Column 1: Brand & Slogan */}
                    <div className="col-span-1">
                        <h3 className="text-xl font-black mb-4 text-white tracking-tight uppercase">
                            {settings.company_name}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed italic">
                            "{settings.company_slogan}"
                        </p>
                        <div className="mt-6 flex space-x-4">
                            {/* Social Placeholders */}
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition cursor-pointer">F</div>
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition cursor-pointer">I</div>
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition cursor-pointer">X</div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider border-b border-gray-700 pb-2 inline-block">Liên kết nhanh</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-pink-500 transition">Trang chủ</Link></li>
                            <li><Link to="/products" className="hover:text-pink-500 transition">Sản phẩm</Link></li>
                            <li><Link to="/about" className="hover:text-pink-500 transition">Giới thiệu</Link></li>
                            <li><Link to="/contact" className="hover:text-pink-500 transition">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider border-b border-gray-700 pb-2 inline-block">Hỗ trợ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/faq" className="hover:text-pink-500 transition">FAQ</Link></li>
                            <li><span className="hover:text-pink-500 transition cursor-pointer">Chính sách đổi trả</span></li>
                            <li><span className="hover:text-pink-500 transition cursor-pointer">Chính sách bảo mật</span></li>
                            <li><span className="hover:text-pink-500 transition cursor-pointer">Điều khoản sử dụng</span></li>
                        </ul>
                    </div>

                    {/* Column 4: Dynamic Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider border-b border-gray-700 pb-2 inline-block">Liên hệ</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-0.5">✉️</span>
                                <span className="break-all">{settings.contact_email}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-0.5">📞</span>
                                <span className="font-mono">{settings.contact_phone}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-0.5">📍</span>
                                <span>{settings.contact_address}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 mt-0.5">⏰</span>
                                <span>{settings.working_hours}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-600">
                    <p>&copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}