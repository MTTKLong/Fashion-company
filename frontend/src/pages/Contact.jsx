import React, { useState } from 'react';
import { API_URL } from '../config';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Sending message...' });

    try {
      // Use dynamic API_URL
      const response = await fetch(`${API_URL}/contact.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Message sent! We will reply shortly.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', msg: data.message || 'Something went wrong.' });
      }

    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', msg: 'Failed to connect to server.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Contact Us</h2>

      {status.msg && (
        <div className={`p-4 mb-4 rounded ${
          status.type === 'success' ? 'bg-green-100 text-green-700' : 
          status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Your Name</label>
          <input 
            type="text" 
            name="name"
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email Address</label>
          <input 
            type="email" 
            name="email"
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Subject</label>
          <input 
            type="text" 
            name="subject"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Message</label>
          <textarea 
            name="message"
            required
            rows="4"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={status.type === 'loading'}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          {status.type === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}