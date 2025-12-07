import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import axios from "axios";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // POPUP
  const [popup, setPopup] = useState({ show: false, title: "", message: "", action: null });
  const openPopup = (title, message, action = null) => setPopup({ show: true, title, message, action });
  const closePopup = () => setPopup({ show: false, title: "", message: "", action: null });
  const confirmPopup = () => { if (popup.action) popup.action(); closePopup(); };

  // FETCH DATA
  useEffect(() => { user?.id ? (fetchCart(user.id), fetchOrders(user.id)) : setLoading(false); }, [user]);
  const fetchCart = async (userId) => {
    try {
      setLoading(true);
      const res = await api.get(`/get-cart.php?user_id=${userId}`, { withCredentials: true });
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch { openPopup("Lỗi", "Không thể tải giỏ hàng"); } finally { setLoading(false); }
  };
  const fetchOrders = async (userId) => {
    try {
      const res = await api.get(`/get-order.php?user_id=${userId}`, { withCredentials: true });
      setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
    } catch (err) { console.error(err); }
  };

  // ACTIONS
  const handleRemove = (id) => {
    openPopup("Xóa sản phẩm", "Bạn muốn xóa sản phẩm khỏi giỏ?", async () => {
      try { await api.delete("/remove-from-cart.php", { data: { id }, withCredentials: true });
        fetchCart(user.id); openPopup("Thành công", "Đã xóa sản phẩm."); 
      } catch { openPopup("Thất bại", "Không thể xóa sản phẩm."); }
    });
  };
  const handleCheckout = () => {
    if (!cart.length) return openPopup("Thông báo", "Giỏ hàng trống!");
    openPopup("Thanh toán", "Xác nhận thanh toán toàn bộ giỏ hàng?", async () => {
      try {
        const res = await api.post("/checkout.php", { user_id: user.id }, { withCredentials: true });
        res.data.success ? (setCart([]), fetchOrders(user.id), openPopup("Thành công", res.data.message))
                         : openPopup("Thất bại", res.data.message);
      } catch { openPopup("Lỗi", "Server lỗi, thử lại sau"); }
    });
  };
  const handleCancelOrder = (order_id) => {
    openPopup("Hủy đơn hàng", `Bạn muốn hủy đơn #${order_id}?`, async () => {
      try {
        const res = await axios.put("http://localhost/Fashion-company/backend/api/cancel-order.php",
            { order_id, action: "cancel" }, { withCredentials: true });
        fetchOrders(user.id); openPopup("Kết quả", res.data.message);
      } catch { openPopup("Thất bại", "Server lỗi khi hủy đơn"); }
    });
  };

  // LOADING
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
    </div>
  );
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <p className="text-gray-400 mb-4">Bạn cần đăng nhập để xem giỏ hàng.</p>
      <button onClick={() => navigate("/login")}
        className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-500">
        Đăng nhập
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* CART */}
        <h1 className="text-3xl font-extrabold mb-6 text-white">🛍️ Giỏ hàng của bạn</h1>

        {cart.length > 0 ? (
          <div className="space-y-4 mb-12">
            {cart.map((item) => (
              <div key={item.cart_item_id}
                className="flex items-center justify-between bg-gray-900/60 backdrop-blur-xl shadow-lg border border-white/10 p-4 rounded-2xl hover:border-pink-500/40 transition">
                <div className="flex items-center space-x-4">
                  <img src={item.product_image || "/placeholder.png"} alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-xl border border-white/10" />
                  <div>
                    <h2 className="font-bold text-lg text-white">{item.product_name}</h2>
                    <p className="text-gray-400">SL: {item.quantity}</p>
                    <p className="text-pink-400 font-semibold text-lg">
                      {item.price.toLocaleString()}₫
                    </p>
                  </div>
                </div>
                <button onClick={() => handleRemove(item.cart_item_id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">Xóa</button>
              </div>
            ))}

            {/* TOTAL */}
            <div className="flex justify-between items-center bg-gray-900/60 backdrop-blur-xl p-4 border border-white/10 rounded-2xl">
              <p className="text-xl font-bold text-white">
                Tổng: <span className="text-pink-400">
                {cart.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}₫</span>
              </p>
              <button onClick={handleCheckout}
                className="bg-pink-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-pink-500">
                Thanh toán
              </button>
            </div>
          </div>
        ) : (<p className="text-gray-500">Giỏ hàng đang trống...</p>)}

        {/* ORDERS */}
        <h2 className="text-2xl font-bold my-6 text-white">📦 Đơn hàng của bạn</h2>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500">Chưa có đơn hàng</p>
          ) : (orders.map((order) => (
            <div key={order.id}
              className="bg-gray-900/60 backdrop-blur-xl shadow-lg border border-white/10 p-5 rounded-2xl hover:border-pink-500/40 transition">
              <div className="flex justify-between">
                <h3 className="font-extrabold text-lg text-white">Đơn #{order.id}</h3>
                <p className="text-pink-400 font-semibold">{order.total.toLocaleString()}₫</p>
              </div>
              <p className="text-gray-500 text-sm mt-1">{new Date(order.created_at).toLocaleString("vi-VN")}</p>
              <span className={`mt-3 inline-block px-3 py-1 text-sm rounded-lg ${
                order.status === "pending" ? "bg-yellow-600/30 text-yellow-300" :
                order.status === "confirmed" ? "bg-green-600/30 text-green-300" :
                "bg-gray-600/40 text-gray-300"
              }`}>
                {order.status === "pending" ? "⏳ Chờ xác nhận" :
                 order.status === "confirmed" ? "✔️ Đã xác nhận" : "❌ Đã hủy"}
              </span>

              {order.status === "pending" && (
                <button onClick={() => handleCancelOrder(order.id)}
                  className="block mt-3 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500">
                  Hủy đơn
                </button>
              )}
            </div>
          )))}
        </div>
      </div>

      {/* POPUP */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 w-96 p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-white">{popup.title}</h2>
            <p className="mb-6 text-gray-300">{popup.message}</p>
            <div className="flex justify-end gap-2">
              <button onClick={closePopup} className="px-4 py-2 rounded border border-white/20 text-gray-300 hover:bg-gray-800">
                Đóng
              </button>
              {popup.action && (
                <button onClick={confirmPopup} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500">
                  Xác nhận
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
