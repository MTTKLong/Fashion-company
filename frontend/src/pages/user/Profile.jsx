import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost/Fashion-company/backend/api/user/profile.php', {
                withCredentials: true
            });
            setProfile(response.data);
        } catch {
            setError('Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 shadow rounded-lg">
                    {/* Header */}
                    <div className="px-6 py-8 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {profile?.avatar ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {profile?.full_name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                                    <p className="text-gray-300">{profile?.email}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile?.role === 'admin' ? 'bg-purple-700 text-purple-200' : 'bg-green-700 text-green-200'}`}>
                                        {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                    </span>
                                </div>
                            </div>
                            <Link
                                to="/profile/edit"
                                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
                            >
                                Chỉnh sửa
                            </Link>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="px-6 py-6">
                        <h3 className="text-lg font-medium mb-4">Thông tin cá nhân</h3>
                        <dl className="grid grid-cols-1 gap-4 text-gray-200">
                            <div>
                                <dt className="text-sm font-medium text-gray-400">Họ và tên</dt>
                                <dd className="mt-1 text-sm">{profile?.full_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-400">Email</dt>
                                <dd className="mt-1 text-sm">{profile?.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-400">Số điện thoại</dt>
                                <dd className="mt-1 text-sm">{profile?.phone || 'Chưa cập nhật'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-400">Trạng thái</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile?.status === 'active' ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}>
                                        {profile?.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-400">Ngày tạo</dt>
                                <dd className="mt-1 text-sm">{new Date(profile?.created_at).toLocaleDateString('vi-VN')}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-400">Đăng nhập lần cuối</dt>
                                <dd className="mt-1 text-sm">{profile?.last_login ? new Date(profile.last_login).toLocaleString('vi-VN') : 'Chưa có'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 bg-gray-700 border-t border-gray-600">
                        <div className="flex space-x-4">
                            <Link
                                to="/profile/change-password"
                                className="text-pink-400 hover:text-pink-500 text-sm font-medium transition"
                            >
                                Đổi mật khẩu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
