import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings } from 'lucide-react';
// Config & Context
import { API_URL, UPLOADS_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';

const AdminSettings = () => {
    const { success, error } = useToast();
    
    const [settings, setSettings] = useState({
        company_name: '',
        company_slogan: '',
        contact_address: '',
        contact_email: '',
        contact_phone: '',
        working_hours: '',
        site_logo: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const ENDPOINT = `${API_URL}/admin/settings.php`;

    // Load initial data
    useEffect(() => {
        axios.get(ENDPOINT, { withCredentials: true })
            .then(res => {
                if (res.data.success && res.data.data) {
                    setSettings(prev => ({ ...prev, ...res.data.data }));
                }
            })
            .catch(err => console.error("Lỗi tải cài đặt:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        // Append text settings (PHP expects settings[key])
        Object.keys(settings).forEach(key => {
            if (key !== 'site_logo') {
                formData.append(`settings[${key}]`, settings[key]);
            }
        });

        // Append file if selected
        if (logoFile) {
            formData.append('site_logo', logoFile);
        }

        try {
            const res = await axios.post(ENDPOINT, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                success(res.data.message);
                if (res.data.logo) {
                    setSettings(prev => ({ ...prev, site_logo: res.data.logo }));
                    setLogoFile(null); // Clear pending
                }
            } else {
                error(res.data.message || "Lỗi cập nhật");
            }
        } catch (err) {
            console.error(err);
            error("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const getLogoUrl = () => {
        if (preview) return preview;
        if (settings.site_logo) {
            // Use UPLOADS_URL + Cache Buster
            return `${UPLOADS_URL}/${settings.site_logo}?v=${Date.now()}`;
        }
        return null;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <Settings className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Cấu hình chung</h1>
                            <p className="text-gray-500 text-sm">Quản lý thông tin hiển thị trên website</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Logo Upload Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Logo Công Ty</label>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-sm relative">
                                    {getLogoUrl() ? (
                                        <img src={getLogoUrl()} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No Img</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2.5 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">Tải lên để thay thế logo hiện tại. (JPG, PNG, GIF)</p>
                                </div>
                            </div>
                        </div>

                        {/* Text Fields Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Công Ty / Thương Hiệu</label>
                                <input
                                    required
                                    name="company_name"
                                    value={settings.company_name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slogan (Khẩu hiệu)</label>
                                <input
                                    name="company_slogan"
                                    value={settings.company_slogan}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: Phong cách dẫn đầu xu hướng"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
                                <input
                                    name="contact_address"
                                    value={settings.contact_address}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                                <input
                                    type="email"
                                    name="contact_email"
                                    value={settings.contact_email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại / Hotline</label>
                                <input
                                    name="contact_phone"
                                    value={settings.contact_phone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ làm việc</label>
                                <input
                                    name="working_hours"
                                    value={settings.working_hours}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: 8:00 - 22:00, Thứ 2 - Chủ Nhật"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save size={18} />
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;