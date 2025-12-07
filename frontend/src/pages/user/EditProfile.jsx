import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function EditProfile() {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [formData, setFormData] = useState({ full_name: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost/Fashion-company/backend/api/user/profile.php', { withCredentials: true });
            setFormData({
                full_name: res.data.full_name || '',
                phone: res.data.phone || ''
            });
            if (res.data.avatar) {
                setAvatarPreview(`http://localhost/Fashion-company/backend/uploads/avatars/${res.data.avatar}`);
            }
        } catch { alert('Không thể tải thông tin'); }
        finally { setLoading(false); }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh'); return; }
        if (file.size > 2 * 1024 * 1024) { alert('Kích thước file không được vượt quá 2MB'); return; }
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleUploadAvatar = async () => {
        if (!avatar) { alert('Vui lòng chọn ảnh trước'); return; }
        setUploadingAvatar(true);
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatar);
        try {
            const res = await axios.post(
                'http://localhost/Fashion-company/backend/api/user/avatar.php',
                formDataAvatar,
                { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
            );
            alert('Cập nhật ảnh đại diện thành công!');
            setAvatar(null);
            const user = JSON.parse(localStorage.getItem('user'));
            updateUser({ ...user, avatar: res.data.avatar });
        } catch (err) {
            alert(err.response?.data?.error || 'Lỗi khi upload ảnh');
        } finally { setUploadingAvatar(false); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        try {
            await axios.put('http://localhost/Fashion-company/backend/api/user/profile.php', formData, { withCredentials: true });
            const profileRes = await axios.get('http://localhost/Fashion-company/backend/api/user/profile.php', { withCredentials: true });
            updateUser({ ...JSON.parse(localStorage.getItem('user')), full_name: profileRes.data.full_name });
            alert('Cập nhật thông tin thành công!');
            navigate('/profile');
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else alert('Lỗi khi cập nhật thông tin');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thông tin</h2>

                    {/* Avatar */}
                    <div className="mb-8 pb-6 border-b border-gray-700">
                        <h3 className="text-lg font-medium mb-4">Ảnh đại diện</h3>
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-600" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-pink-600 flex items-center justify-center text-white text-3xl font-medium">
                                        {formData.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                <label htmlFor="avatar" className="cursor-pointer inline-block px-4 py-2 border border-gray-600 rounded-md text-sm font-medium hover:bg-gray-700 transition">
                                    Chọn ảnh
                                </label>
                                {avatar && (
                                    <button type="button" onClick={handleUploadAvatar} disabled={uploadingAvatar} className="ml-3 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50">
                                        {uploadingAvatar ? 'Đang tải lên...' : 'Tải lên'}
                                    </button>
                                )}
                                <p className="mt-2 text-xs text-gray-400">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${errors.full_name ? 'border-red-500' : 'border-gray-600'}`}
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                            {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${errors.phone ? 'border-red-500' : 'border-gray-600'}`}
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <div className="flex space-x-4">
                            <button type="submit" disabled={saving} className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50">
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button type="button" onClick={() => navigate('/profile')} className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700">
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
