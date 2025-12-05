import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Contact() {
  // 1. Setup State cho thông tin công ty (Job #1)
  const [settings, setSettings] = useState({
    company_name: 'Fashion Co.',
    contact_address: 'Loading...',
    contact_email: 'Loading...',
    contact_phone: 'Loading...',
    working_hours: 'Loading...'
  });

  // 2. Setup State cho Form liên hệ
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', msg: '' });

  // 3. Fetch Settings khi tải trang
  useEffect(() => {
    fetch(`${API_URL}/settings.php`)
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(err => console.error("Settings Fetch Error:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Đang gửi tin nhắn...' });

    try {
      const response = await fetch(`${API_URL}/contact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', msg: data.message || 'Có lỗi xảy ra.' });
      }

    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', msg: 'Lỗi kết nối đến máy chủ.' });
    }
  };

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
      
      {/* 1. HERO HEADER (Đồng bộ style với Home/About) */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên Hệ</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe bạn.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* TRÁI: Thông tin liên hệ (Lấy từ DB) */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Bạn có câu hỏi về sản phẩm, đơn hàng hoặc muốn hợp tác? 
                Hãy để lại tin nhắn hoặc ghé thăm cửa hàng của chúng tôi.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Thẻ Địa chỉ */}
              <div className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="bg-gray-100 p-3 rounded-full mr-4 text-2xl">📍</div>
                <div>
                  <h4 className="font-bold text-gray-900">Địa chỉ</h4>
                  <p className="text-gray-600">{settings.contact_address}</p>
                </div>
              </div>

              {/* Thẻ Hotline & Email */}
              <div className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="bg-gray-100 p-3 rounded-full mr-4 text-2xl">📞</div>
                <div>
                  <h4 className="font-bold text-gray-900">Liên lạc</h4>
                  <p className="text-gray-600">Hotline: {settings.contact_phone}</p>
                  <p className="text-gray-600">Email: {settings.contact_email}</p>
                </div>
              </div>

              {/* Thẻ Giờ làm việc (Mới!) */}
              <div className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="bg-gray-100 p-3 rounded-full mr-4 text-2xl">⏰</div>
                <div>
                  <h4 className="font-bold text-gray-900">Giờ làm việc</h4>
                  <p className="text-gray-600">
                    {settings.working_hours || "8:00 - 22:00 (Hàng ngày)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PHẢI: Form liên hệ */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Gửi tin nhắn</h3>

            {status.msg && (
              <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
                status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700'
              }`}>
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="Nhập tên của bạn"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  name="subject"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="Bạn cần hỗ trợ gì?"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea 
                  name="message"
                  required
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="Nhập nội dung tin nhắn..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={status.type === 'loading'}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform active:scale-95"
              >
                {status.type === 'loading' ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}