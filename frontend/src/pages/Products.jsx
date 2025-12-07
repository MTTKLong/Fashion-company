import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Products() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');

  // Toast + Popup State
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loginPopup, setLoginPopup] = useState(false);

  // Toast Helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2000);
  };

  // Fetch Products
  const fetchProducts = (page = 1, keyword = '') => {
    const params = new URLSearchParams({
      page,
      limit: 12,
      ...(keyword && { search: keyword })
    });

    api.get(`/products.php?${params.toString()}`)
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const active = res.data.data.filter(p => Number(p.status) === 1);
          setItems(active);
          setPagination(res.data.pagination);
        } else {
          setItems([]);
        }
      })
      .catch(err => console.error("Lỗi API:", err));
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchProducts(1, searchTerm), 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const changePage = p => fetchProducts(p, searchTerm);

  const addToCart = async product => {
    if (!user?.id) {
      setLoginPopup(true);
      return;
    }

    try {
      const res = await api.post("/add-to-cart.php", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      });

      showToast(res.data.success ? "Đã thêm vào giỏ hàng!" : "Không thể thêm vào giỏ hàng!",
        res.data.success ? "success" : "error"
      );
    } catch {
      showToast("Lỗi server, không thể thêm vào giỏ", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pt-32 pb-10">
      
      {/* ========== TOAST NOTIFICATION ========== */}
      {toast.show && (
        <div className={`fixed top-6 right-6 px-5 py-3 rounded-xl font-semibold shadow-xl text-white z-[999] transition-all
        ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* ========== LOGIN POPUP ========== */}
      {loginPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Bạn chưa đăng nhập!</h3>
            <p className="text-gray-400 mb-5">Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.</p>
            <div className="flex justify-center gap-3">
              <Link
                to="/login"
                className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl text-white font-bold"
              >
                Đăng nhập
              </Link>
              <button
                onClick={() => setLoginPopup(false)}
                className="px-4 py-2 rounded-xl border border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER + SEARCH */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Bộ Sưu Tập <span className="text-pink-500">Thời Trang</span>
        </h1>

        <div className="relative w-full md:w-1/3">
          <input 
            type="text" 
            className="w-full border border-gray-700 bg-gray-800 rounded-xl pl-4 pr-10 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500 transition"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 text-lg">
            Không tìm thấy sản phẩm nào.
          </div>
        )}

        {items.map(p => (
          <div key={p.id} className="group bg-gray-800/60 backdrop-blur-xl border border-gray-700/70 hover:border-pink-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.35)] rounded-2xl overflow-hidden flex flex-col">
            
            <Link to={`/products/${p.id}`} className="block h-56 overflow-hidden">
              <img
                src={p.image ? p.image : "/no-image.png"}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-100 opacity-90 transition duration-700 ease-out"
              />
            </Link>

            <div className="p-4 flex flex-col justify-between flex-1">
              <Link to={`/products/${p.id}`}>
                <h3 className="font-bold text-lg text-white truncate hover:text-pink-400 transition">
                  {p.name}
                </h3>
              </Link>

              <div className="mt-2 flex justify-between items-center">
                <p className="text-pink-400 font-bold text-xl">
                  {parseInt(p.price).toLocaleString()} <span className="text-sm text-gray-400">đ</span>
                </p>

                <button 
                  onClick={() => addToCart(p)}
                  className="px-3 py-2 bg-white text-black rounded-full font-bold hover:bg-pink-500 hover:text-white transition transform hover:scale-110 shadow-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-4 py-2 rounded-lg font-bold border transition ${
                pagination.page === i + 1
                  ? "bg-pink-500 text-white border-pink-500"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
