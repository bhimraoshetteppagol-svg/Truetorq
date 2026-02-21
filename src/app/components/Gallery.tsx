import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

const images = [
  "https://images.unsplash.com/photo-1744870132281-f7768476b520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwbWluaW1hbGlzdCUyMGludGVyaW9yfGVufDF8fHx8MTc3MTMxNzcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1644670054190-2eba01ace931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwZ3J1bmdlJTIwdGV4dHVyZXxlbnwxfHx8fDE3NzEzMTc3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1687509830842-4b706e209664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwYnJ1dGFsaXN0JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcxMzE3NzA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1635280878121-ad290dd74cbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwZ2VvbWV0cmljJTIwc2hhcGVzfGVufDF8fHx8MTc3MTMxNzc4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1738918921961-72d2f3f6509e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwaW5kdXN0cmlhbCUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzEzMTc3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1690796802822-677fa8d8023f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwY29uY3JldGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MTMxNzc4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
];

export function Gallery() {
  return (
    <section className="py-20 bg-black text-white border-t-4 border-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-8">
          <div className="self-start md:self-auto">
            <h2 className="font-black uppercase tracking-tighter text-4xl md:text-[64px] leading-none mb-2">
              Stories
            </h2>
            <div className="w-24 h-2 bg-[#30578e]"></div>
          </div>
          <p className="max-w-md font-mono text-neutral-400 text-[13px]">
            A collection of brutalist experiments and monochromatic studies.
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:grid md:grid-cols-3 md:gap-6 md:pb-0 md:mx-0 md:px-0">
          {images.slice(0, 3).map((image, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ zIndex: 50 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="shrink-0 w-[260px] snap-center md:w-auto md:snap-align-none relative"
            >
              <Link to={`/stories/${i}`} className="block h-full group">
                <div className="flex flex-col h-full border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 bg-neutral-900">
                  <div className="aspect-[3/2] w-full relative border-b-4 border-white overflow-hidden">
                    <img
                      src={image}
                      alt={`Gallery item ${i + 1}`}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-[#30578e] text-white font-bold px-4 py-2 uppercase text-xs tracking-widest">
                        Read Story
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-black flex flex-col flex-1 border-t-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800 px-2 py-1">Archive 0{i+1}</span>
                      <span className="w-2 h-2 bg-neutral-500 rounded-full group-hover:bg-white transition-colors"></span>
                    </div>
                    <h3 className="text-xl font-black uppercase leading-[0.9] text-white group-hover:text-neutral-300 transition-colors mt-auto">
                      Industrial Echoes
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/stories">
            <Button variant="secondary" size="lg" className="border-[#30578e] text-black bg-white hover:bg-black hover:text-white hover:border-[#30578e] transition-colors">
              View All Stories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
