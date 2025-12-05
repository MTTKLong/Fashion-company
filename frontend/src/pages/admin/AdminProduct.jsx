import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const API_BASE = 'http://localhost/Fashion-company/backend/api/';
const FRONTEND_BASE = 'http://localhost/Fashion-company/';

export default function AdminProduct() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        newCategoryName: '',
        is_active: true
    });

    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        page: 1
    });
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')                  
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');
    };
    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProducts(); }, [filters, categories]);
    useEffect(() => {
        if (categories.length > 0 && !formData.category_id) {
            setFormData(prev => ({ ...prev, category_id: String(categories[0].id) }));
        }
    }, [categories]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}categories.php`, {
                withCredentials: true,
                headers: { Authorization: 'admin' }
            });
            if (res.data.success) {
                setCategories(res.data.data.map(c => ({ ...c, id: String(c.id) })));
            }
        } catch {
            toast.error('Không thể tải danh sách danh mục');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: filters.page,
                limit: 10,
                ...(filters.search && { search: filters.search }),
                ...(filters.category_id && { category_id: filters.category_id })
            });

            const res = await axios.get(`${API_BASE}products.php?${params}`, {
                withCredentials: true,
                headers: { Authorization: 'admin' }
            });

            if (res.data.success) {
                setProducts(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch {
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        let categoryId = formData.category_id;

        // Nếu tạo danh mục mới
        if (categoryId === 'new') {
    if (!formData.newCategoryName) {
        return toast.error('Vui lòng nhập tên danh mục mới');
    }
    try {
        const slug = generateSlug(formData.newCategoryName);
        const res = await axios.post(`${API_BASE}categories.php`,
            new URLSearchParams({ 
                name: formData.newCategoryName,
                slug
            }),
            { headers: { Authorization: 'admin' } }
        );
        if (res.data.success) {
            categoryId = String(res.data.data.id);
            setCategories(prev => [...prev, res.data.data]);
        }
    } catch {
        return toast.error('Lỗi tạo danh mục mới');
    }
}


        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category_id', categoryId);
        data.append('status', formData.is_active ? '1' : '0');
        if (selectedFile) data.append('image', selectedFile);

        try {
            let url = `${API_BASE}products.php`;
            if (editingProduct) {
                url += `?id=${editingProduct.id}`;
                data.append('_method', 'PUT');
            }

            await axios.post(url, data, {
                withCredentials: true,
                headers: { Authorization: 'admin' }
            });

            toast.success(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = product => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category_id: String(product.category_id) || (categories.length > 0 ? String(categories[0].id) : ''),
            newCategoryName: '',
            is_active: Number(product.status) === 1
        });
        setImagePreview(product.image ? `${FRONTEND_BASE}${product.image}` : null);
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleDelete = async id => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await axios.delete(`${API_BASE}products.php?id=${id}`, {
                withCredentials: true,
                headers: { Authorization: 'admin' }
            });
            toast.success('Xóa sản phẩm thành công!');
            fetchProducts();
        } catch {
            toast.error('Lỗi khi xóa sản phẩm');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setSelectedFile(null);
        setImagePreview(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: categories.length > 0 ? String(categories[0].id) : '',
            newCategoryName: '',
            is_active: true
        });
    };

    const formatCurrency = amount =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const getCategoryName = id => {
        const cat = categories.find(c => c.id === String(id));
        return cat ? cat.name : 'N/A';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        + Thêm Sản phẩm
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.image ? <img className="h-12 w-12 rounded-md object-cover" src={`${FRONTEND_BASE}${product.image}`} alt="" /> : <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-400">N/A</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{getCategoryName(product.category_id)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(product.price)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${Number(product.status) === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {Number(product.status) === 1 ? 'Kinh doanh' : 'Ngừng bán'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-3">Sửa</button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                                    <div className="flex items-center space-x-4">
                                        {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />}
                                        <input type="file" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                                    </div>
                                </div>

                                {/* Name & Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                                        <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                        <select className="w-full px-3 py-2 border rounded-md" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value, newCategoryName: '' })}>
                                            {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                            <option value="new">+ Tạo danh mục mới</option>
                                        </select>
                                        {formData.category_id === 'new' && (
                                            <input type="text" placeholder="Nhập tên danh mục mới" className="w-full mt-2 px-3 py-2 border rounded-md" value={formData.newCategoryName} onChange={e => setFormData({ ...formData, newCategoryName: e.target.value })} />
                                        )}
                                    </div>
                                </div>

                                {/* Price & Stock */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                                        <input type="number" required min="0" className="w-full px-3 py-2 border rounded-md" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng kho *</label>
                                        <input type="number" required min="0" className="w-full px-3 py-2 border rounded-md" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                    <textarea rows={4} className="w-full px-3 py-2 border rounded-md" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                {/* Status */}
                                <div className="flex items-center">
                                    <input type="checkbox" id="is_active" className="h-4 w-4 text-indigo-600 rounded" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Đang kinh doanh</label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Hủy</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{editingProduct ? 'Cập nhật' : 'Tạo mới'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
