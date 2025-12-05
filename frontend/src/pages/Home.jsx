import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Using the dynamic config again
import { API_URL, UPLOADS_URL } from '../config';

export default function Home() {
  const [settings, setSettings] = useState({ company_name: 'Fashion Co.', site_logo: '' });
  const [products, setProducts] = useState([]);
  
  const MOCK_PRODUCTS = [
      { id: 'm1', name: '[MOCK] Urban Jacket', price: '120', image: '', isNew: true },
      { id: 'm2', name: '[MOCK] Pilot Tee', price: '45', image: '', isNew: false },
      { id: 'm3', name: '[MOCK] Cargo Pants', price: '64', image: '', isNew: false, sale: true },
      { id: 'm4', name: '[MOCK] Tech Hoodie', price: '85', image: '', isNew: false },
  ];

  useEffect(() => {
    fetch(`${API_URL}/settings.php`)
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(err => console.error("Settings Error:", err));
  }, []);

  useEffect(() => {
    console.log("Fetching products from:", `${API_URL}/products.php`);
    fetch(`${API_URL}/products.php`)
      .then(res => res.json())
      .then(data => {
        console.log("API Response:", data);
        if (Array.isArray(data) && data.length > 0) {
           setProducts(data.slice(0, 4)); 
        } else {
           console.warn("API returned empty array. Keeping Mocks.");
        }
      })
      .catch(err => console.error("Fetch Failed:", err));
  }, []);

  const getImgSrc = (img) => {
      if (!img) return null;
      if (img.startsWith('http')) return img;
      return `${UPLOADS_URL}/${img}`;
  };

  const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
      
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          
          {settings.site_logo ? (
             <img 
               src={`${UPLOADS_URL}/${settings.site_logo}?t=${new Date().getTime()}`}
               alt="Logo" 
               className="h-24 w-auto mb-8 drop-shadow-2xl object-contain bg-white p-3 rounded-lg"
             />
          ) : (
            <div className="h-20 w-20 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-xl">
               {settings.company_name.charAt(0)}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {settings.company_name}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
            High-Performance Fashion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="px-8 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-bold transition shadow-lg transform hover:-translate-y-1">
              Shop Now
            </Link>
            <Link to="/contact" className="px-8 py-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-lg font-bold transition transform hover:-translate-y-1">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">New Arrivals</h2>
            <div className="h-1 w-20 bg-gray-900 mx-auto rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((product, index) => (
            <div key={product.id || index} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
                <div className="h-72 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                    <span className="text-gray-500 font-bold text-lg">
                        {product.image ? 'Loading...' : 'No Image'}
                    </span>
                    {product.image && (
                        <img 
                            src={getImgSrc(product.image)}
                            alt={product.name || 'Product'}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => e.target.style.display = 'none'} 
                        />
                    )}
                    {(product.isNew || index === 0) && (
                        <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">New</div>
                    )}
                </div>

                <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-gray-600 transition truncate">
                        {product.name || "Untitled"}
                    </h3>
                    <div className="flex justify-between items-center border-t pt-4 border-gray-100">
                        <span className="font-bold text-xl text-gray-900">
                            ${product.price || '0'}
                        </span>
                        <button className="text-sm font-semibold text-gray-900 hover:text-gray-600 uppercase tracking-wide">
                            Add
                        </button>
                    </div>
                </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
            <Link to="/products" className="inline-block px-8 py-3 border border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-900 hover:text-white transition">
                View All →
            </Link>
        </div>
      </div>
    </div>
  )
}