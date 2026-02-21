import React from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white border-t-4 border-black">
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Contact */}
            <div className="flex flex-col gap-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Contact</h4>
              <div className="flex flex-col gap-4">
                <p className="font-bold text-lg">TrueTorq Pvt. Ltd.</p>
                <p className="font-mono text-sm text-neutral-300 leading-relaxed">
                  C53, 6th Main Road,<br/>
                  KSSIDC, Gamanagatti,<br/>
                  Hubballi, Karnataka 580025,<br/>
                  India
                </p>
                <div className="flex flex-col gap-1 font-mono text-sm text-neutral-300">
                  <a href="mailto:contact@truetorq.com" className="hover:text-white transition-colors">contact@truetorq.com</a>
                  <p>T: +91 836 222 3344</p>
                </div>
              </div>
            </div>

            {/* Pages */}
            <div className="flex flex-col gap-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Pages</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="font-bold text-white hover:text-neutral-300 transition-colors">Home</a>
                <a href="#work" className="font-bold text-white hover:text-neutral-300 transition-colors">Work</a>
                <a href="#services" className="font-bold text-white hover:text-neutral-300 transition-colors">Services</a>
                <a href="#about" className="font-bold text-white hover:text-neutral-300 transition-colors">About</a>
                <a href="#contact" className="font-bold text-white hover:text-neutral-300 transition-colors">Contact</a>
              </div>
            </div>

            {/* Follow Us */}
            <div className="flex flex-col gap-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-white text-black p-2 hover:bg-neutral-200 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="bg-white text-black p-2 hover:bg-neutral-200 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="bg-white text-black p-2 hover:bg-neutral-200 transition-colors">
                  <Github size={20} />
                </a>
              </div>
            </div>

          </div>

          <div className="bg-white text-black p-4 flex flex-col md:flex-row justify-between items-center text-xs font-bold font-mono tracking-tight uppercase">
            <p>© TrueTorq Pvt. Ltd. 2026</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:underline">Imprint</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
