import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const API_BASE = 'http://localhost/Fashion-company/backend/api/';
const FRONTEND_BASE = 'http://localhost/Fashion-company/';

export default function AdminProduct() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form dữ liệu
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    newCategoryName: '',
    is_active: true
  });

  // Filters: search được debounce
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    page: 1,
    limit: 10,
    sort: 'newest' // options: newest, price_asc, price_desc, stock_desc
  });

  const [searchInput, setSearchInput] = useState('');
  const searchDebounceRef = useRef(null);

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync local searchInput -> filters.search with debounce
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchInput]);

  // Khi filters thay đổi, load lại
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Khi categories load lần đầu, set default category cho form nếu chưa set
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData((prev) => ({ ...prev, category_id: String(categories[0].id) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}categories.php`, {
        withCredentials: true,
        headers: { Authorization: 'admin' }
      });
      if (res.data.success) {
        // normalize id to string for selects
        setCategories(res.data.data.map((c) => ({ ...c, id: String(c.id) })));
      } else {
        toast.error('Không tải được danh mục');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  const buildParams = () => {
    const p = new URLSearchParams();
    p.append('page', filters.page);
    p.append('limit', filters.limit);
    if (filters.search) p.append('search', filters.search);
    if (filters.category_id) p.append('category_id', filters.category_id);
    if (filters.sort) p.append('sort', filters.sort);
    return p.toString();
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = buildParams();
      const res = await axios.get(`${API_BASE}products.php?${query}`, {
        withCredentials: true,
        headers: { Authorization: 'admin' }
      });

      if (res.data && res.data.success) {
        const data = res.data.data || [];
        const pag = res.data.pagination || {};
        // Normalize pagination keys (some backends use different names)
        setProducts(data);
        setPagination({
          page: pag.page ?? filters.page,
          limit: pag.limit ?? filters.limit,
          total: pag.total ?? pag.totalRows ?? pag.total_rows ?? 0,
          totalPages: pag.totalPages ?? pag.total_pages ?? Math.max(1, Math.ceil((pag.total ?? pag.totalRows ?? pag.total_rows ?? 0) / (pag.limit ?? filters.limit)))
        });
      } else {
        setProducts([]);
        setPagination((p) => ({ ...p, total: 0, totalPages: 1 }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit) => {
    setFilters((prev) => ({ ...prev, limit: Number(newLimit), page: 1 }));
  };

  const handleSortChange = (newSort) => {
    setFilters((prev) => ({ ...prev, sort: newSort, page: 1 }));
  };

  const handleCategoryFilter = (catId) => {
    setFilters((prev) => ({ ...prev, category_id: catId, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let categoryId = formData.category_id;

    // create category if needed
    if (categoryId === 'new') {
      if (!formData.newCategoryName) return toast.error('Vui lòng nhập tên danh mục mới');
      try {
        const slug = generateSlug(formData.newCategoryName);
        const res = await axios.post(`${API_BASE}categories.php`, new URLSearchParams({ name: formData.newCategoryName, slug }), {
          headers: { Authorization: 'admin' },
          withCredentials: true
        });
        if (res.data.success) {
          categoryId = String(res.data.data.id);
          setCategories((prev) => [...prev, { ...res.data.data, id: String(res.data.data.id) }]);
        } else {
          return toast.error(res.data.message || 'Lỗi tạo danh mục');
        }
      } catch (err) {
        console.error(err);
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

      const res = await axios.post(url, data, {
        withCredentials: true,
        headers: { Authorization: 'admin' }
      });

      if (res.data.success) {
        toast.success(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        setShowModal(false);
        resetForm();
        // reload current page
        fetchProducts();
      } else {
        toast.error(res.data.message || 'Đã có lỗi');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (product) => {
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

    // product.image might be data URI or a path
    if (product.image && product.image.startsWith && product.image.startsWith('data:')) {
      setImagePreview(product.image);
    } else if (product.image) {
      setImagePreview(`${FRONTEND_BASE}${product.image}`);
    } else {
      setImagePreview(null);
    }

    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await axios.delete(`${API_BASE}products.php?id=${id}`, {
        withCredentials: true,
        headers: { Authorization: 'admin' }
      });
      toast.success('Xóa sản phẩm thành công!');
      // if last product on page deleted and it was the only one, go back a page
      const newTotal = pagination.total - 1;
      const lastPage = Math.max(1, Math.ceil(newTotal / pagination.limit));
      if (filters.page > lastPage) {
        setFilters((prev) => ({ ...prev, page: lastPage }));
      } else {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.id === String(id));
    return cat ? cat.name : 'N/A';
  };

  // UI helpers: render page numbers (compact)
  const renderPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.page;
    const pages = [];
    const maxButtons = 7;
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages.map((p) => (
      <button
        key={p}
        onClick={() => handlePageChange(p)}
        className={`px-3 py-1 rounded border ${p === current ? 'bg-indigo-600 text-white' : 'bg-white'}`}
      >
        {p}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Thêm Sản phẩm
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-md mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="px-3 py-2 border rounded-md w-full md:w-1/3"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); }}
          />

          <select
            value={filters.category_id}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">-- Tất cả danh mục --</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>

          <select
            value={filters.limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {[10, 20, 50, 100].map((l) => (<option key={l} value={l}>{l} / trang</option>))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
            <option value="stock_desc">Tồn kho: Nhiều → Ít</option>
          </select>

          <button
            onClick={() => { setSearchInput(''); setFilters({ search: '', category_id: '', page: 1, limit: filters.limit, sort: 'newest' }); }}
            className="px-3 py-2 border rounded-md hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow w-full overflow-hidden">
    <div className="overflow-x-auto w-full">
        {loading ? (
            <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            </div>
        ) : (
            <table className="min-w-max divide-y divide-gray-200">
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
                {products.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-500">Không tìm thấy sản phẩm nào.</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.image ? (
                          // p.image có thể là data URI hoặc đường dẫn (string)
                          (p.image.startsWith && p.image.startsWith('data:')) ? (
                            <img className="h-12 w-12 rounded-md object-cover" src={p.image} alt={p.name} />
                          ) : (
                            <img className="h-12 w-12 rounded-md object-cover" src={`${FRONTEND_BASE}${p.image}`} alt={p.name} />
                          )
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-400">N/A</div>
                        )}
                      </td>

                     <td className="px-6 py-4 whitespace-normal break-words max-w-[180px]">
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500">{getCategoryName(p.category_id)}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${Number(p.status) === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {Number(p.status) === 1 ? 'Kinh doanh' : 'Ngừng bán'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-xs sm:text-sm whitespace-normal break-words">
                        <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-900 mr-3">Sửa</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
</div>
        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Hiển thị {products.length} / {pagination.total} sản phẩm</div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(1)} disabled={pagination.page === 1} className="px-3 py-1 border rounded disabled:opacity-50">«</button>
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1 border rounded disabled:opacity-50">‹</button>

              {renderPageNumbers()}

              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-3 py-1 border rounded disabled:opacity-50">›</button>
              <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.page === pagination.totalPages} className="px-3 py-1 border rounded disabled:opacity-50">»</button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                  <div className="flex items-center space-x-4">
                    {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />}
                    <input type="file" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                    <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select className="w-full px-3 py-2 border rounded-md" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value, newCategoryName: '' })}>
                      {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      <option value="new">+ Tạo danh mục mới</option>
                    </select>
                    {formData.category_id === 'new' && (
                      <input type="text" placeholder="Nhập tên danh mục mới" className="w-full mt-2 px-3 py-2 border rounded-md" value={formData.newCategoryName} onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input type="number" required min="0" className="w-full px-3 py-2 border rounded-md" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng kho *</label>
                    <input type="number" required min="0" className="w-full px-3 py-2 border rounded-md" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                  <textarea rows={4} className="w-full px-3 py-2 border rounded-md" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="is_active" className="h-4 w-4 text-indigo-600 rounded" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Đang kinh doanh</label>
                </div>

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
