import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

const images = [
  "https://images.unsplash.com/photo-1744870132281-f7768476b520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwbWluaW1hbGlzdCUyMGludGVyaW9yfGVufDF8fHx8MTc3MTMxNzcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1644670054190-2eba01ace931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwZ3J1bmdlJTIwdGV4dHVyZXxlbnwxfHx8fDE3NzEzMTc3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1687509830842-4b706e209664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwYnJ1dGFsaXN0JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcxMzE3NzA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1635280878121-ad290dd74cbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwZ2VvbWV0cmljJTIwc2hhcGVzfGVufDF8fHx8MTc3MTMxNzc4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1738918921961-72d2f3f6509e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwaW5kdXN0cmlhbCUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzEzMTc3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1690796802822-677fa8d8023f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwY29uY3JldGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MTMxNzc4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
];

export function Stories() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar />
      <main className="pt-20">
        <section className="py-20 min-h-screen">
          <div className="container mx-auto px-6">
            
            {/* Back Button */}
            <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
               <Link to="/" className="hover:text-white hover:underline">Home</Link>
               <ChevronRight size={12} />
               <span className="text-white">Stories</span>
            </div>

            <div className="mb-16">
              <h2 className="font-black uppercase tracking-tighter text-4xl md:text-[64px] leading-none mb-2">
                All Stories
              </h2>
              <div className="w-24 h-2 bg-white"></div>
              <p className="mt-6 text-neutral-400 max-w-2xl font-mono text-[14px]">
                A complete collection of brutalist experiments and monochromatic studies.
              </p>
            </div>

            <div className="flex flex-col gap-16">
              {images.map((image, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col md:flex-row gap-8 md:gap-12 items-start border-b border-white/10 pb-16 last:border-0 last:pb-0"
                >
                  {/* Card Section - 30% */}
                  <div className="w-full md:w-[30%] shrink-0">
                    <Link to={`/stories/${i}`}>
                      <div className="relative group overflow-hidden border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 bg-neutral-900 cursor-pointer">
                        <div className="aspect-[3/4] w-full relative">
                          <img
                            src={image}
                            alt={`Story ${i + 1}`}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                            <Button variant="secondary" className="scale-0 group-hover:scale-100 transition-transform duration-300 pointer-events-none">
                              View Story
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Description Section - 70% */}
                  <div className="w-full md:w-[70%] pt-2 flex flex-col h-full justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="font-mono text-xs text-neutral-500">0{i + 1}</span>
                      <div className="h-[1px] w-12 bg-neutral-700"></div>
                      <span className="font-mono text-xs text-neutral-500">ARCHIVE</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-5xl font-black uppercase mb-6 leading-[0.9] tracking-tight">
                      Industrial Echoes & Concrete Forms {i + 1}
                    </h3>
                    
                    <p className="font-mono text-neutral-400 text-sm leading-relaxed max-w-2xl mb-8">
                      An exploration of structural integrity and raw materiality. This collection highlights the interplay between heavy concrete masses and negative space, creating a dialogue between the built environment and the void. The monochromatic palette emphasizes texture and form over superficial decoration.
                    </p>
                    
                    <div className="mt-auto">
                      <Link to={`/stories/${i}`}>
                        <Button variant="secondary" className="border-white text-white bg-transparent hover:bg-white hover:text-black transition-colors">
                          Read Full Story
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
