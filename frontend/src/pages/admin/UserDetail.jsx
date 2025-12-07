import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchUserDetail();
    fetchUserOrders();
  }, [id]);

  // Lấy thông tin người dùng
  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/Fashion-company/backend/api/admin/users.php?id=${id}`,
        { withCredentials: true }
      );
      setUser(response.data);
    } catch (err) {
      alert('Không thể tải thông tin người dùng');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đơn hàng
  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost/Fashion-company/backend/api/admin/get-orders.php?user_id=${id}`
      );
      setUser(prev => ({ ...prev, orders: res.data.orders || [] }));
    } catch (err) {
      console.error(err);
    }
  };

  // Lấy chi tiết sản phẩm trong đơn
  const fetchOrderItems = async (orderId) => {
    try {
      setLoadingItems(true);
      const res = await axios.get(
        `http://localhost/Fashion-company/backend/api/admin/get-order-detail.php?order_id=${orderId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setOrderItems(res.data.order.items || []);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải chi tiết đơn hàng");
    } finally {
      setLoadingItems(false);
    }
  };

  // Thao tác user
  const handleToggleStatus = async () => {
    if (!confirm('Bạn có chắc muốn thay đổi trạng thái người dùng này?')) return;
    try {
      const newStatus = user.status === 'active' ? 'locked' : 'active';
      await axios.put(
        'http://localhost/Fashion-company/backend/api/admin/users.php',
        { id: user.id, action: 'toggle_status', status: newStatus },
        { withCredentials: true }
      );
      alert('Đã cập nhật trạng thái');
      fetchUserDetail();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Bạn có chắc muốn reset mật khẩu cho người dùng này?')) return;
    try {
      const response = await axios.put(
        'http://localhost/Fashion-company/backend/api/admin/users.php',
        { id: user.id, action: 'reset_password' },
        { withCredentials: true }
      );
      alert(response.data.message);
    } catch (err) {
      alert('Lỗi khi reset mật khẩu');
    }
  };

  const handleChangeRole = async () => {
    if (!confirm('Bạn có chắc muốn thay đổi vai trò người dùng này?')) return;
    try {
      const newRole = user.role === 'admin' ? 'customer' : 'admin';
      await axios.put(
        'http://localhost/Fashion-company/backend/api/admin/users.php',
        { id: user.id, action: 'change_role', role: newRole },
        { withCredentials: true }
      );
      alert('Đã thay đổi vai trò');
      fetchUserDetail();
    } catch (err) {
      alert('Lỗi khi thay đổi vai trò');
    }
  };

  // Xác nhận đơn (admin, pending)
  const handleConfirmOrder = async (order_id) => {
    if (!confirm(`Xác nhận đơn #${order_id}?`)) return;
    try {
      await axios.put(
        'http://localhost/Fashion-company/backend/api/admin/confirm-order.php',
        { order_id, action: 'confirm' },
        { withCredentials: true }
      );
      alert('Đơn hàng đã được xác nhận');
      fetchUserOrders();
    } catch (err) {
      console.error(err);
      alert('Lỗi server khi xác nhận đơn');
    }
  };

  // Hủy đơn (admin mọi trạng thái, user chỉ pending của chính họ)
  const handleCancelOrder = async (order_id) => {
    if (!confirm(`Bạn có chắc muốn hủy đơn #${order_id}?`)) return;
    try {
      const res = await axios.put(
        'http://localhost/Fashion-company/backend/api/cancel-order.php',
        { order_id, action: 'cancel' },
        { withCredentials: true }
      );
      alert(res.data.message);
      fetchUserOrders();
    } catch (err) {
      console.error(err);
      alert('Lỗi server khi hủy đơn');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy người dùng</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết người dùng</h1>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Quay lại
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
                {user.full_name.charAt(0)}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                <p className="text-gray-900">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Họ và tên</label>
                <p className="text-gray-900">{user.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
                <p className="text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác quản lý</h3>
          <div className="space-y-3">
            <button
              onClick={handleToggleStatus}
              className={`w-full px-4 py-2 rounded-md font-medium ${user.status === 'active' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
            <button
              onClick={handleResetPassword}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium"
            >
              Reset mật khẩu
            </button>
            <button
              onClick={handleChangeRole}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
            >
              Chuyển thành {user.role === 'admin' ? 'Khách hàng' : 'Quản trị viên'}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng của người dùng</h3>
          {user.orders && user.orders.length > 0 ? (
            <table className="w-full text-left border">
              <thead>
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Ngày tạo</th>
                  <th className="p-2 border">Tổng tiền</th>
                  <th className="p-2 border">Trạng thái</th>
                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {user.orders.map((order, index) => (
                  <tr key={order.id || index}>
                    <td className="p-2 border">{order.id}</td>
                    <td className="p-2 border">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                    <td className="p-2 border">{order.total.toLocaleString()} đ</td>
                    <td className="p-2 border">
                      {order.status === 'pending'
                        ? 'Chờ xác nhận'
                        : order.status === 'confirmed'
                        ? 'Đã xác nhận'
                        : order.status === 'canceled'
                        ? 'Đã hủy'
                        : 'Đã giao'}
                    </td>
                    <td className="p-2 border flex gap-2">
                      {/* Xem chi tiết */}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          fetchOrderItems(order.id);
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Xem chi tiết
                      </button>

                      {/* Xác nhận đơn: chỉ admin, đơn pending */}
                      {user.role === 'admin' && order.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Xác nhận
                        </button>
                      )}

                      {/* Hủy đơn */}
                      {((user.role === 'admin' && (order.status === 'pending' || order.status === 'confirmed')) ||
                        (user.role !== 'admin' && order.status === 'pending')) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Người dùng chưa có đơn hàng.</p>
          )}
        </div>

        {/* Modal chi tiết đơn hàng */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 relative">
              <h3 className="text-2xl font-bold mb-3">Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedOrder.status === "pending"
                  ? "Chờ xác nhận"
                  : selectedOrder.status === "confirmed"
                  ? "Đã xác nhận"
                  : selectedOrder.status === "canceled"
                  ? "Đã hủy"
                  : "Đã giao"}
              </p>

              <hr className="my-4" />

              <h4 className="text-lg font-semibold mb-2">Sản phẩm trong đơn</h4>

              {loadingItems ? (
                <p>Đang tải sản phẩm...</p>
              ) : orderItems.length === 0 ? (
                <p className="text-gray-600">Không có sản phẩm</p>
              ) : (
                <table className="w-full text-left border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Ảnh</th>
                      <th className="p-2 border">Tên</th>
                      <th className="p-2 border">Giá</th>
                      <th className="p-2 border">SL</th>
                      <th className="p-2 border">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
  {orderItems.map((item, idx) => {
    // Xử lý hiển thị ảnh giống Product
    let imgSrc = "/no-image.png"; // default
    if (item.image) {
      if (item.image.startsWith("http")) {
        imgSrc = item.image;
      } else if (item.image.startsWith("data:")) {
        imgSrc = item.image;
      } else {
        imgSrc = `http://localhost/Fashion-company/backend/${item.image}`;
      }
    }

    return (
      <tr key={idx}>
        <td className="p-2 border">
          <img
            src={imgSrc}
            alt={item.name}
            className="w-14 h-14 object-cover rounded"
            onError={(e) => (e.target.src = "/no-image.png")}
          />
        </td>
        <td className="p-2 border">{item.name}</td>
        <td className="p-2 border">{item.price.toLocaleString()} đ</td>
        <td className="p-2 border">{item.quantity}</td>
        <td className="p-2 border font-semibold">
          {(item.price * item.quantity).toLocaleString()} đ
        </td>
      </tr>
    );
  })}
</tbody>

                </table>
              )}

              <div className="text-right mt-4 text-lg font-bold">
                Tổng đơn: {selectedOrder.total.toLocaleString()} đ
              </div>

              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setOrderItems([]);
                }}
                className="mt-5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
