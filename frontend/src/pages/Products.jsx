import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Products() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = (keyword = '') => {
    const url = keyword ? `/products.php?search=${encodeURIComponent(keyword)}` : '/products.php';
    api.get(url)
      .then(r => {
        if (r.data && Array.isArray(r.data.data)) {
          const activeProducts = r.data.data.filter(p => Number(p.status) === 1);
          setItems(activeProducts);
        } else {
          setItems([]);
        }
      })
      .catch(error => console.error("Lỗi:", error));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addToCart = async (product) => {
    if (!user?.id) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng!");
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      };

      const res = await api.post("/add-to-cart.php", payload);
      alert(res.data.success ? "Đã thêm vào giỏ hàng!" : "Không thể thêm vào giỏ hàng!");
    } catch (error) {
      console.error(error);
      alert("Lỗi server, không thể thêm vào giỏ");
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className='text-3xl font-bold'>Sản phẩm Mới</h1>
        <div className="relative w-full md:w-1/3">
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded pl-4 pr-10 py-2 focus:outline-none focus:border-black"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-3 top-2 text-gray-400">🔍</span>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
        {items.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">Không tìm thấy sản phẩm nào.</div>}
        
        {items.map(p => (
          <div key={p.id} className='bg-white border rounded shadow-md hover:shadow-lg transition overflow-hidden group'>
            <Link to={`/products/${p.id}`} className='block overflow-hidden'>
              <img
                src={p.image?.startsWith('data:') ? p.image : `data:image/jpeg;base64,${p.image}`}
                alt={p.name}
              />

            </Link>
            <div className='p-4'>
              <Link to={`/products/${p.id}`}>
                <h3 className='font-bold text-lg hover:text-blue-600 truncate'>{p.name}</h3>
              </Link>
              <div className='text-red-500 font-bold mb-3'>
                {parseInt(p.price).toLocaleString()} đ
              </div>
              <button 
                onClick={() => addToCart(p)}
                className='w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition'
              >
                Thêm vào Giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
