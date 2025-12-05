import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL, UPLOADS_URL } from '../../../config';

export default function Header() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // 1. State cho logo và tên công ty dynamic
    const [settings, setSettings] = useState({
        company_name: 'Fashion Co.',
        site_logo: ''
    });

    // 2. Fetch Settings từ Backend
    useEffect(() => {
        fetch(`${API_URL}/settings.php`)
            .then(res => res.json())
            .then(data => {
                if (data) setSettings(data);
            })
            .catch(err => console.error("Header settings error:", err));
    }, []);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo Section (Dynamic) */}
                    <div className="flex">
                        <Link to="/" className="flex items-center gap-2">
                            {settings.site_logo ? (
                                <img 
                                    src={`${UPLOADS_URL}/${settings.site_logo}?t=${new Date().getTime()}`}
                                    alt="Logo" 
                                    className="h-10 w-auto object-contain"
                                />
                            ) : (
                                // Fallback icon nếu không có logo
                                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    {settings.company_name.charAt(0)}
                                </div>
                            )}
                            <span className="text-xl font-bold text-indigo-600 truncate max-w-[150px] sm:max-w-none">
                                {settings.company_name}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 font-medium">Trang chủ</Link>
                        <Link to="/products" className="text-gray-700 hover:text-indigo-600 px-3 py-2 font-medium">Sản phẩm</Link>
                        <Link to="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 font-medium">Giới thiệu</Link>
                        <Link to="/faq" className="text-gray-700 hover:text-indigo-600 px-3 py-2 font-medium">FAQ</Link>
                        <Link to="/contact" className="text-gray-700 hover:text-indigo-600 px-3 py-2 font-medium">Liên hệ</Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative ml-3">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={`${UPLOADS_URL}/avatars/${user.avatar}`}
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <span className="font-medium text-sm">{user.full_name}</span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Thông tin cá nhân
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Quản trị
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 ml-4">
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 font-medium">Đăng nhập</Link>
                                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-indigo-600 p-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-gray-100 pt-2">
                        <Link to="/" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md">Trang chủ</Link>
                        <Link to="/products" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md">Sản phẩm</Link>
                        <Link to="/about" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md">Giới thiệu</Link>
                        <Link to="/faq" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md">FAQ</Link>
                        <Link to="/contact" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md">Liên hệ</Link>
                        
                        {user ? (
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <div className="flex items-center px-3 py-2">
                                    <div className="flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={`${UPLOADS_URL}/avatars/${user.avatar}`} alt="" className="h-8 w-8 rounded-full" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                                {user.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{user.full_name}</div>
                                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <Link to="/profile" className="block text-gray-700 hover:text-indigo-600 px-3 py-2">Thông tin cá nhân</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin/dashboard" className="block text-gray-700 hover:text-indigo-600 px-3 py-2">Quản trị</Link>
                                )}
                                <button onClick={handleLogout} className="block w-full text-left text-gray-700 hover:bg-gray-50 px-3 py-2">Đăng xuất</button>
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-2 px-3">
                                <Link to="/login" className="block text-center text-gray-700 border border-gray-300 rounded-md px-3 py-2">Đăng nhập</Link>
                                <Link to="/register" className="block text-center bg-indigo-600 text-white rounded-md px-3 py-2">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}