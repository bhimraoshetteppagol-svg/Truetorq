import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Eye, Box, Monitor, PenTool, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { ImageWithFallback } from './figma/ImageWithFallback';

const features = [
  {
    title: "TT Couplings",
    description: "Robust shaft couplings for heavy machinery applications.",
    image: "https://images.unsplash.com/photo-1650436986857-83a895e46daa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwc2hhZnQlMjBjb3VwbGluZyUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzEzMTk1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    title: "TT Half Gears",
    description: "Precision engineered gears for optimal power transmission.",
    image: "https://images.unsplash.com/photo-1759621165667-da064b86fdd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWV0YWwlMjBnZWFycyUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzEzMTk1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    title: "TT Full Gears",
    description: "Advanced manufacturing solutions for modern industry.",
    image: "https://images.unsplash.com/photo-1568205185702-9ef0ba5cb648?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWFudWZhY3R1cmluZyUyMGZhY3RvcnklMjBtaW5pbWFsaXN0JTIwYmxhY2slMjBhbmQlMjB3aGl0ZXxlbnwxfHx8fDE3NzEzMTk1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    title: "TT Servo",
    description: "High-precision components for specialized applications.",
    image: "https://images.unsplash.com/photo-1732881111920-fc14aa15f66e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbmMlMjBtYWNoaW5lJTIwcHJlY2lzaW9uJTIwbWV0YWx3b3JraW5nJTIwYmxhY2slMjBhbmQlMjB3aGl0ZXxlbnwxfHx8fDE3NzEzMTk1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

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
    
    <div className="space-y-4 mt-auto">
      <h3 className="text-2xl font-black uppercase flex items-center gap-2 group-hover:text-black transition-colors">
        {feature.title.startsWith('TT') ? (
          <><span className="text-[#30578e]">TT</span>{feature.title.slice(2)}</>
        ) : feature.title}
        <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </h3>
      <p className="font-mono text-neutral-600 leading-relaxed border-l-4 border-transparent group-hover:border-black pl-0 group-hover:pl-4 transition-all duration-300 text-[12px]">
        {feature.description}
      </p>
    </div>
  </motion.div>
);

const TextBlock = ({ title, text, dark = false, index }: { title: string, text: string, dark?: boolean, index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className={`h-full flex flex-col justify-between p-8 border-4 border-black ${dark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}
  >
    <div className="mb-8">
      <Zap size={48} className={dark ? "text-white" : "text-black"} strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="text-3xl font-black uppercase leading-tight mb-4 tracking-tight">{title}</h3>
      <p className={`font-mono text-sm leading-relaxed ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
        {text}
      </p>
    </div>
  </motion.div>
);

export function Features() {
  const gridItems = [
    { type: 'card', data: features[0] },
    { type: 'card', data: features[1] },
    { 
      type: 'text', 
      data: { 
        title: "Engineering Excellence Since 2026", 
        text: "Driving industries forward with unmatched precision and reliability. Our components are the heartbeat of modern machinery.",
        dark: false
      }
    },
    { 
      type: 'text', 
      data: { 
        title: "Custom Solutions For Complex Challenges", 
        text: "Where innovation meets heavy-duty performance. tailored for specific industrial needs across the globe.",
        dark: true
      }
    },
    { type: 'card', data: features[2] },
    { type: 'card', data: features[3] },
  ];

  return (
    <section className="py-20 bg-white border-t-4 border-black">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="font-black uppercase tracking-tighter text-4xl md:text-[64px] leading-none mb-2">
            Product Range
          </h2>
          <div className="w-24 h-2 bg-[#30578e]"></div>
        </div>

        <p className="md:hidden text-[10px] text-neutral-500 mb-2 font-mono uppercase tracking-widest text-right">
          Scroll to right to view all product ranges →
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0 md:overflow-visible">
          {gridItems.map((item, index) => (
             <div key={index} className={`shrink-0 w-[260px] snap-center md:w-auto md:snap-align-none relative hover:z-20 ${item.type === 'text' ? 'hidden md:block lg:col-span-2' : 'col-span-1'}`}>
               {item.type === 'card' ? (
                  <Link 
                    to={item.data.title === "TT Couplings" ? "/tt-couplings" : "/coming-soon"} 
                    className="block h-full"
                  >
                    <FeatureCard feature={item.data} index={index} />
                  </Link>
                ) : (
                  <TextBlock 
                    // @ts-ignore
                    title={item.data.title} 
                    // @ts-ignore
                    text={item.data.text} 
                    // @ts-ignore
                    dark={item.data.dark} 
                    index={index} 
                  />
                )}
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
