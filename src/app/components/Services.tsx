import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion } from 'motion/react';
import { Settings, PenTool, Wrench, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "Engineering Consultation",
    description: "Expert analysis and optimization of your drive systems. Our engineers work directly with your team to enhance performance.",
    icon: Settings
  },
  {
    title: "Custom Design",
    description: "Tailored coupling and gear solutions for unique applications. From concept to production, we build what you need.",
    icon: PenTool
  },
  {
    title: "Installation Support",
    description: "On-site assistance ensuring proper setup and alignment. Maximizing lifespan and efficiency from day one.",
    icon: Wrench
  },
  {
    title: "Technical Documentation",
    description: "Comprehensive manuals, CAD drawings, and specifications. Full transparency for your maintenance teams.",
    icon: FileText
  }
];

export function Services() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-20">
        
        {/* Header Section */}
        <section className="bg-black text-white py-24 border-b-4 border-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1721244654392-9c912a6eb236?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZW5naW5lZXJpbmclMjBzZXJ2aWNlcyUyMGJsdWVwcmludHN8ZW58MXx8fHwxNzcxMzU0Mjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')] bg-cover bg-center"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                   <Link to="/" className="hover:text-white hover:underline">Home</Link>
                   <ChevronRight size={12} />
                   <span className="text-white">Services</span>
                </div>
                <h1 className="font-black uppercase tracking-tighter text-6xl md:text-8xl mb-6">
                    Our Services
                </h1>
                <p className="text-xl md:text-2xl font-mono text-neutral-400 max-w-2xl">
                    Beyond products. We deliver comprehensive engineering solutions to keep your industry moving forward.
                </p>
            </div>
        </section>

        {/* Services Grid */}
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {services.map((service, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group border-4 border-black p-8 hover:bg-black hover:text-white transition-colors duration-300 shadow-[8px_8px_0px_0px_#30578e] hover:shadow-[12px_12px_0px_0px_#30578e] hover:-translate-y-1 transform"
                        >
                            <div className="mb-6 inline-block p-4 border-2 border-black group-hover:border-white rounded-none">
                                <service.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">{service.title}</h3>
                            <p className="font-mono text-neutral-600 group-hover:text-neutral-300 leading-relaxed text-lg">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-100 py-24 border-t-4 border-black">
            <div className="container mx-auto px-6 text-center">
                <h2 className="font-black uppercase tracking-tighter text-5xl mb-8">Ready to Optimize?</h2>
                <Link to="/contact-us" className="inline-block bg-black text-white px-12 py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black border-4 border-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_#30578e] hover:-translate-y-1">
                    Contact Engineering Team
                </Link>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}