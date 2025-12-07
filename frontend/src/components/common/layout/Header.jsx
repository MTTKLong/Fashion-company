import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <header className="bg-gray-900 shadow-sm text-white">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold text-pink-500">Fashion Co.</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {['/', '/products', '/about', '/faq', '/contact', '/posts'].map((path, i) => {
                            const labels = ['Trang chủ','Sản phẩm','Giới thiệu','FAQ','Liên hệ','Bài viết'];
                            return (
                                <Link key={i} to={path} className="text-gray-300 hover:text-pink-500 px-3 py-2">
                                    {labels[i]}
                                </Link>
                            );
                        })}

                        {/* User Menu */}
                        {user ? (
                            <div className="relative ml-3">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-pink-500"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={`http://localhost/Fashion-company/backend/uploads/avatars/${user.avatar}`}
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-full object-cover border border-gray-700"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <span>{user.full_name}</span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={() => setIsUserMenuOpen(false)}>
                                            Thông tin cá nhân
                                        </Link>
                                        <Link to="/cart" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={() => setIsUserMenuOpen(false)}>
                                            Giỏ hàng
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={() => setIsUserMenuOpen(false)}>
                                                Quản trị
                                            </Link>
                                        )}
                                        <button onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="text-gray-300 hover:text-pink-500 px-3 py-2">Đăng nhập</Link>
                                <Link to="/register" className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">Đăng ký</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-pink-500">
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
                    <div className="md:hidden pb-4">
                        {['/', '/products', '/about', '/faq', '/contact', '/posts'].map((path, i) => {
                            const labels = ['Trang chủ','Sản phẩm','Giới thiệu','FAQ','Liên hệ','Bài viết'];
                            return (
                                <Link key={i} to={path} className="block text-gray-300 hover:text-pink-500 px-3 py-2">
                                    {labels[i]}
                                </Link>
                            );
                        })}
                        {user ? (
                            <>
                                <Link to="/profile" className="block text-gray-300 hover:text-pink-500 px-3 py-2">Thông tin cá nhân</Link>
                                <Link to="/cart" className="block text-gray-300 hover:text-pink-500 px-3 py-2">Giỏ hàng</Link>
                                {user.role === 'admin' && <Link to="/admin/dashboard" className="block text-gray-300 hover:text-pink-500 px-3 py-2">Quản trị</Link>}
                                <button onClick={handleLogout} className="block w-full text-left text-gray-300 hover:text-pink-500 px-3 py-2">Đăng xuất</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-gray-300 hover:text-pink-500 px-3 py-2">Đăng nhập</Link>
                                <Link to="/register" className="block text-gray-300 hover:text-pink-500 px-3 py-2">Đăng ký</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
