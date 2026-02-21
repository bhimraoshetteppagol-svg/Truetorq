import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Features } from './components/Features';
import { Gallery } from './components/Gallery';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ComingSoon } from './components/ComingSoon';
import { TTCouplings } from './components/TTCouplings';
import { CategoryProducts } from './components/CategoryProducts';
import { Stories } from './components/Stories';
import { StoryDetail } from './components/StoryDetail';
import { ProductDetail } from './components/ProductDetail';

import { ContactPage } from './components/ContactPage';
import { Services } from './components/Services';
import { Shop } from './components/Shop';
import { Login } from './components/Login';
import { Admin } from './components/Admin';
import { Employee } from './components/Employee';

function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <div id="services">
          <Features />
        </div>

        <div id="work">
          <Gallery />
        </div>
        <div id="contact-section">
          <Contact />
        </div>
      </main>
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/tt-couplings" element={<TTCouplings />} />
        <Route path="/products/:categoryId" element={<CategoryProducts />} />
        <Route path="/products/:categoryId/:productId" element={<ProductDetail />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<StoryDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee" element={<Employee />} />
      </Routes>
    </Router>
  );
}
