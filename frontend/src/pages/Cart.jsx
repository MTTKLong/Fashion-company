import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import axios from 'axios';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // danh sách đơn hàng của user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
      fetchOrders(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async (userId) => {
    try {
      setLoading(true);
      const res = await api.get(`/get-cart.php?user_id=${userId}`, {
        withCredentials: true,
      });
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (userId) => {
    try {
      const res = await api.get(`/get-order.php?user_id=${userId}`, {
        withCredentials: true,
      });
      setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (cartItemId) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ?")) return;
    try {
      await api.delete("/remove-from-cart.php", {
        data: { id: cartItemId },
        withCredentials: true,
      });
      fetchCart(user.id);
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  const handleCheckout = async () => {
    if (!user) return alert("Bạn cần đăng nhập!");
    if (!cart.length) return alert("Giỏ hàng trống!");
    if (!confirm("Xác nhận thanh toán tất cả sản phẩm trong giỏ?")) return;

    try {
      const res = await api.post("/checkout.php", { user_id: user.id }, { withCredentials: true });
      if (res.data.success) {
        alert(res.data.message);
        setCart([]); // xóa giỏ hàng
        fetchOrders(user.id); // tải lại đơn hàng của user
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server, thử lại sau");
    }
  };

  const handleCancelOrder = async (order_id) => {
  if (!confirm(`Bạn có chắc muốn hủy đơn #${order_id}?`)) return;
  try {
    const res = await axios.put(
      'http://localhost/Fashion-company/backend/api/cancel-order.php',
      { order_id, action: 'cancel' }, // thêm action: 'cancel'
      { withCredentials: true }
    );
    alert(res.data.message);
    fetchOrders(user.id);
  } catch (err) {
    console.error(err);
    alert('Lỗi server khi hủy đơn');
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem giỏ hàng.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>

        {/* Giỏ hàng */}
        {cart.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            {cart.map((item) => (
              <div
                key={item.cart_item_id}
                className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product_image || "/placeholder.png"}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">{item.product_name}</h2>
                    <p className="text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-gray-900 font-medium">{item.price.toLocaleString()}₫</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.cart_item_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            ))}
            <div className="mt-4 flex justify-end gap-4 p-4">
              <p className="text-xl font-semibold">
                Tổng: {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}₫
              </p>
              <button
                onClick={handleCheckout}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}

        {/* Danh sách đơn hàng */}
        <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
        {orders.length === 0 ? (
          <p>Chưa có đơn hàng</p>
        ) : (
          <table className="w-full border mb-6 bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Ngày tạo</th>
                <th className="p-2 border">Tổng tiền</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-2 border">{order.id}</td>
                  <td className="p-2 border">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                  <td className="p-2 border">{order.total.toLocaleString()}₫</td>
                  <td className="p-2 border">
                    {order.status === "pending"
                      ? "Chờ xác nhận"
                      : order.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Đã hủy"}
                  </td>
                  <td className="p-2 border">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
