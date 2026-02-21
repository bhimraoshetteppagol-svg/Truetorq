import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CipherLink } from './CipherLink';
import { CipherText } from './CipherText';

const navLinks = [
  { label: 'TTC', href: '/tt-couplings' },
  { label: 'TTFG', href: '/coming-soon' },
  { label: 'TTHG', href: '/coming-soon' },
  { label: 'TTS', href: '/coming-soon' }
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between md:grid md:grid-cols-3 text-black">
        <Link to="/" className="flex items-center gap-3 group md:justify-self-start">
          <CipherText 
            initialText="TT" 
            expandedText="rueTorq" 
            className="text-3xl font-black uppercase tracking-tighter group-hover:underline decoration-4 underline-offset-4" 
          />
          <span className="text-[10px] uppercase tracking-widest border-l-2 border-black pl-3 py-1">
            Together We Move
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 md:justify-self-center">
          {navLinks.map((link) => (
            <CipherLink 
              key={link.label}
              label={link.label}
              href={link.href}
              expandedText={
                link.label === 'TTC' ? 'ouplings' : 
                (link.label === 'TTHG' || link.label === 'TTFG') ? 'ears' : 
                link.label === 'TTS' ? 'ervo' : ''
              }
            />
          ))}
        </div>

        <div className="hidden md:block md:justify-self-end">
          <div className="flex items-center gap-6">
            <span className="whitespace-nowrap text-[10px] font-bold">INDIA | EN</span>
            <button 
              className="hover:opacity-60 transition-opacity"
              onClick={() => navigate('/login')}
              aria-label="Login"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button className="hover:opacity-60 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button className="hover:opacity-60 transition-opacity">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 border-2 border-black bg-black text-white active:bg-neutral-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t-2 border-black bg-white overflow-hidden shadow-xl"
          >
            <div className="flex flex-col p-6 gap-6 text-black">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-2xl font-black uppercase hover:underline decoration-4 underline-offset-4"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label.startsWith('TT') ? (
                    <><span className="text-[#30578e]">TT</span>{link.label.slice(2)}</>
                  ) : link.label}
                </Link>
              ))}
              <div className="h-[2px] bg-black w-full my-2"></div>
              <div className="flex flex-col gap-4">
                 <span className="font-bold">INDIA | EN</span>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        navigate('/login');
                        setIsOpen(false);
                      }}
                      aria-label="Login"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </button>
                    <button><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
