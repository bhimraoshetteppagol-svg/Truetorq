import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export function Shop() {
  // Ensure page loads at the top so the Back button is visible
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden border-b-4 border-black bg-white">
          {/* Background with noise texture overlay */}
          <div 
            className="absolute inset-0 z-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
          
          {/* Diagonal stripes background */}
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />

          <div className="absolute top-6 left-6 z-30 flex items-center gap-2 font-bold uppercase text-xs bg-white/50 px-3 py-1 backdrop-blur-sm rounded-sm border border-black/10 transition-colors text-neutral-500">
            <Link to="/" className="hover:text-black hover:underline">Home</Link>
            <ChevronRight size={12} />
            <span className="text-black">Shop</span>
          </div>

          <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              <h1 className="font-black uppercase tracking-tighter leading-none mb-4 drop-shadow-sm text-4xl md:text-[64px]">
                KTR Shop
              </h1>
              <h1 className="font-black uppercase tracking-tighter leading-none mb-8 drop-shadow-sm text-4xl md:text-[64px]">
                <span className="text-white bg-black px-6 py-2 inline-block transform -rotate-1 shadow-[12px_12px_0px_0px_rgba(200,200,200,0.5)]">Coming Soon</span>
              </h1>
              <p className="max-w-xl text-neutral-600 font-mono text-lg mb-12">
                We are currently building a seamless online ordering experience for our full range of products. Stay tuned.
              </p>
              
              <Link to="/contact-us" className="inline-block bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border-4 border-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1">
                Contact Sales
              </Link>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 w-full bg-black text-white border-t-4 border-black z-20 overflow-hidden py-3">
            <motion.div 
              className="flex whitespace-nowrap gap-12"
              animate={{ x: "-50%" }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-12 items-center shrink-0">
                  <span className="text-xl font-black uppercase tracking-tighter">New Products Added Daily</span>
                  <span className="w-3 h-3 bg-white"></span>
                  <span className="text-xl font-black uppercase tracking-tighter">Fast Shipping</span>
                  <span className="w-3 h-3 bg-white"></span>
                  <span className="text-xl font-black uppercase tracking-tighter">Secure Checkout</span>
                  <span className="w-3 h-3 bg-white"></span>
                  <span className="text-xl font-black uppercase tracking-tighter">Global Delivery</span>
                  <span className="w-3 h-3 bg-white"></span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}