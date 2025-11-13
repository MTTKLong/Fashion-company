import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Posts from './pages/Posts'
import Contact from './pages/Contact'

export default function App(){
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='bg-black text-white p-4'>
        <div className='container mx-auto flex justify-between'>
          <Link to='/' className='font-bold'>Fashion Co.</Link>
          <nav className='space-x-4'>
            <Link to='/products'>Products</Link>
            <Link to='/posts'>News</Link>
            <Link to='/contact'>Contact</Link>
          </nav>
        </div>
      </header>
      <main className='flex-1 container mx-auto p-4'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='/product/:id' element={<ProductDetail />} />
          <Route path='/posts' element={<Posts />} />
          <Route path='/contact' element={<Contact />} />
        </Routes>
      </main>
      <footer className='bg-gray-100 p-4 text-center'>© Fashion Company</footer>
    </div>
  )
}
