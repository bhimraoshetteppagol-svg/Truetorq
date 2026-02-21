import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { couplingCategories } from '../data/couplingCategories';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductRequestModal } from './ProductRequestModal';

export function CategoryProducts() {
  const { categoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const category = couplingCategories.find(c => c.id === categoryId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-4">Category Not Found</h2>
          <Link to="/tt-couplings" className="text-blue-600 underline">Back to Categories</Link>
        </div>
      </div>
    );
  }

  // Create an extended list of products by repeating existing ones to simulate more inventory
  const products = category.products || [];
  const extendedProducts = [
    ...products,
    ...Array(8).fill(null).map((_, i) => products[i % products.length])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="py-20 bg-white min-h-screen">
          <div className="container mx-auto px-6">
            
            {/* Breadcrumb / Back */}
            <div className="mb-8">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
                <Link to="/" className="hover:text-black hover:underline">Home</Link>
                <ChevronRight size={12} />
                <Link to="/tt-couplings" className="hover:text-black hover:underline">TT Couplings</Link>
                <ChevronRight size={12} />
                <span className="text-black">{category.title}</span>
              </div>
            </div>

            <div className="mb-16">
              <div className="flex flex-row justify-between items-end gap-2 md:gap-6">
                <div>
                  <h2 className="font-black uppercase tracking-tighter text-4xl md:text-[64px] leading-none mb-2">
                    {category.title.startsWith('TT') ? (
                      <><span className="text-[#30578e]">TT</span>{category.title.slice(2)}</>
                    ) : category.title}
                  </h2>
                  <div className="w-24 h-2 bg-[#30578e]"></div>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#30578e] text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_#30578e] hover:-translate-y-0.5 flex items-center gap-2 text-xs"
                >
                  Product Request <ArrowRight size={16} />
                </button>
              </div>
              <p className="mt-6 text-neutral-600 max-w-4xl font-mono text-sm md:text-base leading-relaxed">
                {category.description} Engineered for superior performance and longevity, our {category.title} range delivers robust solutions for complex mechanical power transmission challenges across diverse industrial sectors.
              </p>
            </div>

            <div className="flex flex-col border-t-2 border-black">
              {extendedProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to={`/products/${categoryId}/${product.code}`}
                    className="group relative flex items-center justify-between border-b border-black p-4 md:px-6 md:py-5 hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6 relative z-10 flex-1 min-w-0 pr-6">
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300 shrink-0">
                        {product.code}
                      </h3>
                      <p className="font-mono text-xs md:text-sm text-neutral-500 truncate group-hover:text-black transition-colors duration-300 w-full md:w-auto">
                        {product.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                       <div className="w-16 h-16 md:w-20 md:h-20 border border-black overflow-hidden bg-white transition-all duration-300 group-hover:shadow-[3px_3px_0px_0px_#30578e]">
                          <ImageWithFallback 
                            src={category.image} 
                            alt={product.code}
                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                       </div>
                       
                       <div className="hidden md:flex items-center justify-center w-8 h-8 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight className="w-5 h-5" />
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ProductRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productCode={category ? category.title : ''} 
      />
    </div>
  );
}
