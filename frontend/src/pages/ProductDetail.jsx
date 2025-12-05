import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/product-detail.php?id=${id}`)
      .then(res => {
        if (res.data.success) setProduct(res.data.data);
        else setError(res.data.message);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Không thể tải sản phẩm");
        setLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
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
      alert(res.data.success ? "Đã thêm vào giỏ hàng!" : "Không thể thêm vào giỏ!");
    } catch (e) {
      console.error(e);
      alert("Lỗi server");
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="container mx-auto p-4 mt-8">
      <Link to="/products" className="text-gray-500 hover:underline mb-4 block">← Quay lại danh sách</Link>
      
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded shadow-sm">
        <div className="w-full md:w-1/2">
          <img
                src={product.image?.startsWith('data:') ? product.image : `data:image/jpeg;base64,${product.image}`}
                alt={product.name}
              />




        </div>

        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">Danh mục: {product.category_name || 'Khác'}</p>
          
          <div className="text-2xl font-bold text-red-600 mb-6">
            {parseInt(product.price).toLocaleString()} VNĐ
          </div>

          <button 
            onClick={addToCart}
            className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition mb-6 w-full md:w-auto"
          >
            THÊM VÀO GIỎ HÀNG
          </button>

          <div className="prose border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Mô tả sản phẩm:</h3>
            <div dangerouslySetInnerHTML={{__html: product.description}} />
          </div>
        </div>
      </div>
    </div>
  );
}
