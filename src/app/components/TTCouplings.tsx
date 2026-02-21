import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { couplingCategories } from '../data/couplingCategories';
import { ProductRequestModal } from './ProductRequestModal';

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="group cursor-pointer flex flex-col h-full"
  >
    <div className="relative mb-6 border-4 border-black shadow-[8px_8px_0px_0px_#30578e] group-hover:shadow-[12px_12px_0px_0px_#30578e] group-hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[3/4] overflow-hidden bg-black">
        <ImageWithFallback 
          src={feature.image} 
          alt={feature.title}
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
        />
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-2xl font-black uppercase flex items-center gap-2 group-hover:text-black transition-colors">
        {feature.title}
        <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </h3>
      <p className="font-mono text-neutral-600 leading-relaxed border-l-4 border-transparent group-hover:border-black pl-0 group-hover:pl-4 transition-all duration-300 text-[12px]">
        {feature.description}
      </p>
    </div>
  </motion.div>
);

export function TTCouplings() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="py-20 bg-white min-h-screen">
          <div className="container mx-auto px-6">
            
            <div className="mb-16">
              <div className="flex flex-row justify-between items-end gap-2 md:gap-6 mb-6">
                <div>
                  <h2 className="font-black uppercase tracking-tighter text-2xl md:text-[64px] leading-none mb-2">
                    <span className="text-[#30578e]">TT</span> Couplings
                  </h2>
                  <div className="w-24 h-2 bg-[#30578e]"></div>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#30578e] text-white px-3 py-2 md:px-6 md:py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_#30578e] hover:-translate-y-0.5 flex items-center gap-2 text-[10px] md:text-xs shrink-0"
                >
                  Product Request <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
              <p className="font-mono text-sm text-neutral-600 max-w-3xl leading-relaxed">
                Explore our comprehensive range of high-performance shaft couplings designed for heavy machinery, precision engineering, and extreme industrial environments. Engineered for reliability and maximum torque transmission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-6 auto-rows-fr">
              {couplingCategories.map((category, index) => (
                 <div key={index} className="col-span-1 h-full border-b border-black md:border-0 last:border-b-0">
                    <Link to={`/products/${category.id}`} className="block h-full group">
                      <div className="hidden md:block h-full">
                        <FeatureCard feature={category} index={index} />
                      </div>
                      <div className="md:hidden flex items-center justify-between gap-4 py-4">
                        <div className="flex-1 min-w-0 pr-4">
                           <h3 className="font-black uppercase text-xl leading-tight group-hover:underline decoration-2 underline-offset-4">{category.title}</h3>
                           <p className="font-mono text-[10px] text-neutral-500 mt-1 line-clamp-2">{category.description}</p>
                        </div>
                        <div className="w-20 h-20 shrink-0 border-2 border-black overflow-hidden bg-neutral-100 shadow-[4px_4px_0px_0px_#30578e]">
                           <ImageWithFallback 
                             src={category.image} 
                             alt={category.title}
                             className="w-full h-full object-cover grayscale"
                           />
                        </div>
                      </div>
                    </Link>
                 </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ProductRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productCode="General Inquiry" 
      />
    </div>
  );
}
