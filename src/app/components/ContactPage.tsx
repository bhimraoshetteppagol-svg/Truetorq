import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-20">
        
        {/* Header Section */}
        <section className="bg-black text-white py-24 border-b-4 border-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1574184383650-5f859b6793c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHN1cHBvcnQlMjB0ZWFtJTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3NzEzNTQyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')] bg-cover bg-center"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                   <Link to="/" className="hover:text-white hover:underline">Home</Link>
                   <ChevronRight size={12} />
                   <span className="text-white">Contact Us</span>
                </div>
                <h1 className="font-black uppercase tracking-tighter text-6xl md:text-8xl mb-6">
                    Get In Touch
                </h1>
                <p className="text-xl md:text-2xl font-mono text-neutral-400 max-w-2xl">
                    Our team is ready to assist with technical inquiries, quotes, and custom solutions.
                </p>
            </div>
        </section>

        <div className="container mx-auto px-6 py-20">
            <div className="flex flex-col lg:flex-row gap-16">
                
                {/* Contact Info */}
                <div className="w-full lg:w-1/3 space-y-12">
                    <div>
                        <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                            <MapPin className="text-black" />
                            Headquarters
                        </h3>
                        <address className="not-italic font-mono text-neutral-600 leading-relaxed text-lg border-l-4 border-black pl-4">
                            TrueTorq Pvt. Ltd.<br/>
                            C53, 6th Main Road,<br/>
                            KSSIDC, Gamanagatti,<br/>
                            Hubballi, Karnataka 580025,<br/>
                            India
                        </address>
                    </div>

                    <div>
                        <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                            <Phone className="text-black" />
                            Direct Line
                        </h3>
                        <p className="font-mono text-neutral-600 text-lg border-l-4 border-black pl-4">
                            +91 836 221 5400
                        </p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                            <Mail className="text-black" />
                            Email Support
                        </h3>
                        <p className="font-mono text-neutral-600 text-lg border-l-4 border-black pl-4">
                            support@truetorq.com
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="w-full lg:w-2/3">
                    <div className="border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white relative">
                        <h3 className="text-3xl font-black uppercase mb-8">Send us a message</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="font-bold uppercase text-sm tracking-wide">Full Name</label>
                                    <input type="text" id="name" className="w-full bg-neutral-100 border-2 border-black p-4 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono" placeholder="JOHN DOE" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="font-bold uppercase text-sm tracking-wide">Email Address</label>
                                    <input type="email" id="email" className="w-full bg-neutral-100 border-2 border-black p-4 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono" placeholder="JOHN@EXAMPLE.COM" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="subject" className="font-bold uppercase text-sm tracking-wide">Subject</label>
                                <select id="subject" className="w-full bg-neutral-100 border-2 border-black p-4 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono appearance-none rounded-none cursor-pointer">
                                    <option>General Inquiry</option>
                                    <option>Sales & Quotes</option>
                                    <option>Technical Support</option>
                                    <option>Partnership</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="font-bold uppercase text-sm tracking-wide">Message</label>
                                <textarea id="message" rows={6} className="w-full bg-neutral-100 border-2 border-black p-4 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono resize-none" placeholder="HOW CAN WE HELP?"></textarea>
                            </div>

                            <button type="button" className="w-full bg-black text-white font-black uppercase tracking-widest py-4 border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 group">
                                Send Message
                                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}