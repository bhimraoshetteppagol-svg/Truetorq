import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: string;
}

export function ProductRequestModal({ isOpen, onClose, productCode }: ProductRequestModalProps) {
  const [items, setItems] = useState([{ product: productCode, quantity: 1 }]);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Custom Country Select State
  const [countryCode, setCountryCode] = useState('+49');
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    // Initial check
    if (typeof window !== 'undefined') {
        checkMobile();
        window.addEventListener('resize', checkMobile);
    }
    return () => {
        if (typeof window !== 'undefined') window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!isOpen) return null;

  const countryOptions = [
    { code: '+49', label: 'DE' },
    { code: '+1', label: 'US' },
    { code: '+91', label: 'IN' },
    { code: '+44', label: 'UK' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-6xl w-auto max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        {/* Left Side: Contact Info - Compact Version */}
        <div className="p-6 w-full md:w-[380px] overflow-y-auto border-b-4 md:border-b-0 md:border-r-4 border-black bg-white z-0 shrink-0 custom-scrollbar">
           <h2 className="text-2xl font-black uppercase mb-1">Request Quote</h2>
           <p className="font-mono text-xs text-neutral-500 mb-6">Fill in your details for a quick quote.</p>
           
           <div className="space-y-4">
              <div>
                <label className="block font-bold uppercase text-xs mb-1">Email Address</label>
                <input type="email" className="w-full border-2 border-black p-2.5 font-mono text-sm focus:outline-none focus:bg-neutral-50 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow" placeholder="your@email.com" />
              </div>
              
              <div>
                <label className="block font-bold uppercase text-xs mb-1">Mobile Number</label>
                <div className="flex gap-0 relative">
                   {/* Custom Country Dropdown */}
                   <div className="relative">
                       <button 
                         onClick={() => setIsCountryOpen(!isCountryOpen)}
                         className="h-full border-2 border-black border-r-0 px-3 py-2.5 font-mono text-sm bg-neutral-100 w-24 font-bold focus:outline-none flex items-center justify-between hover:bg-neutral-200 transition-colors"
                       >
                         <span>{countryCode}</span>
                         <ChevronDown size={14} className={`transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                       </button>
                       
                       <AnimatePresence>
                        {isCountryOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 w-24 bg-white border-2 border-black border-t-0 z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                            >
                            {countryOptions.map((opt) => (
                                <button 
                                    key={opt.code}
                                    onClick={() => { setCountryCode(opt.code); setIsCountryOpen(false); }}
                                    className="w-full text-left p-2 hover:bg-black hover:text-white font-mono text-xs font-bold flex justify-between group transition-colors border-b border-neutral-100 last:border-b-0"
                                >
                                    <span>{opt.code}</span>
                                    <span className="text-neutral-400 group-hover:text-neutral-500">{opt.label}</span>
                                </button>
                            ))}
                            </motion.div>
                        )}
                       </AnimatePresence>
                   </div>

                   <input type="tel" className="w-full border-2 border-black p-2.5 font-mono text-sm focus:outline-none focus:bg-neutral-50 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow" placeholder="123 456 7890" />
                </div>
              </div>

              <div className="pt-2">
                 <button 
                   onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                   className={`w-full border-2 border-black p-3 flex justify-between items-center font-bold uppercase text-sm transition-all ${isSpecsOpen ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                 >
                    <div className="flex items-center gap-2">
                        <Settings size={16} />
                        <span>Add Specs</span>
                    </div>
                    <motion.div 
                        animate={{ rotate: isSpecsOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight size={16} />
                    </motion.div>
                 </button>
              </div>
           </div>

           <div className="mt-6">
                <button className="w-full bg-black text-white p-3 font-black uppercase tracking-widest hover:bg-neutral-800 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] text-sm">
                  Submit Request
                </button>
           </div>
        </div>

        {/* Right Side: Product Details */}
        <AnimatePresence initial={false}>
            {isSpecsOpen && (
                <motion.div 
                    initial={isMobile ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
                    animate={isMobile ? { height: "auto", opacity: 1 } : { width: 350, opacity: 1 }}
                    exit={isMobile ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-neutral-100 flex flex-col border-l-0 md:border-l-0 overflow-hidden shrink-0"
                    style={{ width: isMobile ? '100%' : 350 }}
                >
                <div className="p-6 h-full flex flex-col overflow-hidden w-full">
                    <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-black block"></span>
                        Order Details
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                        {items.map((item, idx) => (
                            <div key={idx} className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between mb-2 border-b-2 border-neutral-100 pb-1">
                                    <span className="font-bold text-xs bg-black text-white px-1.5 py-0.5">#{idx + 1}</span>
                                    {items.length > 1 && (
                                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-neutral-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-8">
                                        <label className="text-[10px] font-bold uppercase mb-0.5 block text-neutral-500">Product Code</label>
                                        <input 
                                            type="text" 
                                            value={item.product} 
                                            onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[idx].product = e.target.value;
                                                setItems(newItems);
                                            }}
                                            className="w-full border-b-2 border-neutral-300 focus:border-black p-0.5 text-xs font-mono font-bold bg-transparent outline-none" 
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label className="text-[10px] font-bold uppercase mb-0.5 block text-neutral-500">Qty</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={item.quantity} 
                                            onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                setItems(newItems);
                                            }}
                                            className="w-full border-b-2 border-neutral-300 focus:border-black p-0.5 text-xs font-mono font-bold bg-transparent outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setItems([...items, { product: '', quantity: 1 }])}
                        className="flex items-center justify-center gap-2 font-bold uppercase text-xs border-2 border-dashed border-neutral-400 p-3 hover:border-black hover:bg-white transition-all w-full text-neutral-500 hover:text-black"
                    >
                        <Plus size={14} /> Add another product
                    </button>
                </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
