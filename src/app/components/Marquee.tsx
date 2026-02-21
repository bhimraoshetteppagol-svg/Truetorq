import React from 'react';
import { motion } from 'motion/react';

export function Marquee() {
  const content = (
    <>
      <span className="mx-8">DESIGN WITHOUT COMPROMISE</span>
      <span className="mx-8">•</span>
      <span className="mx-8">RAW AESTHETICS</span>
      <span className="mx-8">•</span>
      <span className="mx-8">BOLD TYPOGRAPHY</span>
      <span className="mx-8">•</span>
      <span className="mx-8">HIGH CONTRAST</span>
      <span className="mx-8">•</span>
      <span className="mx-8">UNAPOLOGETIC</span>
      <span className="mx-8">•</span>
      <span className="mx-8">STRUCTURE FIRST</span>
      <span className="mx-8">•</span>
    </>
  );

  return (
    <div className="bg-black text-white border-y-4 border-black py-6 overflow-hidden flex relative z-20">
      <motion.div
        className="flex whitespace-nowrap text-4xl md:text-6xl font-black uppercase tracking-widest"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: 20 
        }}
      >
        {content}
        {content}
      </motion.div>
    </div>
  );
}
