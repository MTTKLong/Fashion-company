import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Eye, Trash2, Circle } from 'lucide-react';
// Config & Context
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';

const AdminContacts = () => {
  const { success, error } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  // Endpoint construction
  const ENDPOINT = `${API_URL}/admin/contacts.php`;

  // Fetch Logic
  const fetchMessages = async () => {
    try {
      const res = await axios.get(ENDPOINT, { withCredentials: true });
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Actions
  const handleView = async (id) => {
    try {
      const res = await axios.get(`${ENDPOINT}?action=view&id=${id}`, { withCredentials: true });
      if (res.data.success) {
        setSelectedMsg(res.data.data);
        fetchMessages(); // Refresh UI to show "read" status
      } else {
        error(res.data.message);
      }
    } catch (err) {
      error("Lỗi kết nối server");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tin nhắn này?')) return;
    try {
      const res = await axios.post(`${ENDPOINT}?action=delete&id=${id}`, {}, { withCredentials: true });
      if (res.data.success) {
        success("Đã xóa tin nhắn");
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        error(res.data.message);
      }
    } catch (err) {
      error("Lỗi xóa tin nhắn");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.post(`${ENDPOINT}?action=status&val=${newStatus}&id=${id}`, {}, { withCredentials: true });
      if (res.data.success) {
        success("Đã cập nhật trạng thái");
        fetchMessages();
      }
    } catch (err) {
      error("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Mail className="w-6 h-6" /> Hộp thư khách hàng
        </h2>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Status</th>
                    <th className="p-4">Ngày gửi</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Tiêu đề</th>
                    <th className="p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">Chưa có tin nhắn nào.</td></tr>
                  ) : messages.map(msg => (
                    <tr key={msg.id} className={`hover:bg-gray-50 ${msg.status === 'unread' ? 'bg-blue-50/50 font-medium' : ''}`}>
                      <td className="p-4">
                        {msg.status === 'unread' && <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs">Mới</span>}
                        {msg.status === 'replied' && <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Đã trả lời</span>}
                        {msg.status === 'read' && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Đã xem</span>}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(msg.created_at).toLocaleString('vi-VN')}</td>
                      <td className="p-4">
                        <div className="text-gray-900">{msg.customer_name}</div>
                        <div className="text-xs text-gray-500">{msg.customer_email}</div>
                      </td>
                      <td className="p-4 text-gray-800">{msg.subject}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => handleView(msg.id)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Xem"><Eye size={16} /></button>
                        
                        <div className="relative group">
                           <button className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><Circle size={16} /></button>
                           <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-lg rounded border hidden group-hover:block z-10">
                              <button onClick={() => handleStatusChange(msg.id, 'unread')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">🔴 Chưa đọc</button>
                              <button onClick={() => handleStatusChange(msg.id, 'replied')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">🟢 Đã trả lời</button>
                           </div>
                        </div>

                        <button onClick={() => handleDelete(msg.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Xóa"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedMsg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{selectedMsg.subject}</h3>
                <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Người gửi</label>
                    <p className="text-gray-900">
                        <strong>{selectedMsg.customer_name}</strong> &lt;{selectedMsg.customer_email}&gt;
                    </p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nội dung</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-gray-700 whitespace-pre-wrap border border-gray-100">
                        {selectedMsg.message}
                    </div>
                </div>
                <div className="text-xs text-gray-400 text-right">
                   Gửi lúc: {new Date(selectedMsg.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-2">
                <button onClick={() => setSelectedMsg(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Đóng</button>
                <a href={`mailto:${selectedMsg.customer_email}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Trả lời qua Email</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;