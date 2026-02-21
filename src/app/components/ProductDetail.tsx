import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ArrowLeft, Plus, Minus, Download, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { ProductRequestModal } from './ProductRequestModal';

// Mock Data
const productData = {
  name: "Industrial Flexible Coupling",
  code: "IFC-2000",
  description: "A high-performance flexible coupling designed for heavy-duty industrial applications. Engineered to accommodate misalignment while transmitting torque efficiently, the IFC-2000 series reduces vibration and protects driven equipment from shock loads. Its robust construction ensures longevity in the most demanding environments, from mining conveyors to marine propulsion systems.",
  features: [
    "High torque capacity with compact dimensions",
    "Accommodates angular, parallel, and axial misalignment",
    "Torsionally flexible to dampen vibrations",
    "Maintenance-free operation with no lubrication required",
    "ATEX certified for hazardous environments"
  ],
  specs: [
    { label: "Nominal Torque (Tkn)", value: "2,400 Nm" },
    { label: "Max Torque (Tkmax)", value: "6,000 Nm" },
    { label: "Max Speed", value: "3,500 RPM" },
    { label: "Bore Diameter (d1/d2)", value: "25 - 120 mm" },
    { label: "Material", value: "Cast Iron GG25 / Steel" },
    { label: "Temperature Range", value: "-40°C to +100°C" },
    { label: "Weight", value: "18.5 kg" }
  ],
  faqs: [
    { 
      question: "What types of misalignment can this coupling handle?", 
      answer: "The IFC-2000 series is designed to accommodate angular misalignment up to 1°, parallel misalignment up to 0.5mm, and axial displacement up to ±2mm, depending on the specific size and operating conditions." 
    },
    { 
      question: "Is lubrication required for maintenance?", 
      answer: "No, this is a dry-running coupling that requires absolutely no lubrication, significantly reducing maintenance costs and eliminating the risk of oil leakage." 
    },
    { 
      question: "Can this coupling be used in explosive atmospheres?", 
      answer: "Yes, the standard IFC-2000 series is ATEX certified for use in hazardous zones 1 and 21, as well as 2 and 22, making it suitable for oil & gas and chemical applications." 
    },
    { 
      question: "How do I select the correct size?", 
      answer: "Size selection depends on the application service factor, nominal torque of the driver, and shaft dimensions. Please refer to our selection guide or contact our engineering team for a detailed calculation." 
    }
  ]
};

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b-2 border-black last:border-b-0">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left group hover:bg-neutral-50 transition-colors px-4"
      >
        <span className="font-bold text-lg md:text-xl uppercase pr-8">{question}</span>
        <span className="shrink-0 border-2 border-black p-1 transition-transform duration-300 group-hover:bg-black group-hover:text-white">
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 pt-2 px-4 font-mono text-neutral-600 leading-relaxed max-w-3xl">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function ProductDetail() {
  const { categoryId, productId } = useParams();
  const [openFaq, setOpenFaq] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId, productId]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="pt-24 pb-20 container mx-auto px-6">
        
        {/* Breadcrumb / Back */}
        <div className="mb-6 md:mb-12 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500">
          <Link to="/" className="hover:text-black hover:underline">Home</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/tt-couplings" className="hover:text-black hover:underline"><span className="text-[#30578e]">TT</span> Couplings</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to={`/products/${categoryId}`} className="hover:text-black hover:underline">{categoryId}</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-black">{productId}</span>
        </div>

        {/* Section 1: Product Intro (70% Left / 30% Right) */}
        <section className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32">
          {/* Left Column (70%) */}
          <div className="w-full lg:w-[70%]">
            <div className="inline-block px-3 py-1 bg-[#30578e] text-white font-mono text-xs mb-4 uppercase">
              Heavy Duty Series
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-2">
              {productId}
            </h1>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-neutral-800">
              {productData.name}
            </h2>
            
            <p className="text-base md:text-lg leading-relaxed text-neutral-700 font-medium max-w-3xl mb-8">
              {productData.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8">
              {productData.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-[#30578e] shrink-0" />
                  <span className="font-mono text-xs md:text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsModalOpen(true)} className="bg-[#30578e] text-white hover:bg-white hover:text-black border-2 border-black h-12 px-6">
                Product Request
              </Button>
              <ProductRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                productCode={productId || ''} 
              />
              <Button variant="secondary" className="flex items-center gap-2 h-12 px-6">
                <Download size={16} /> Download Datasheet
              </Button>
            </div>
          </div>

          {/* Right Column (30%) */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-32">
              <div className="border-4 border-black bg-neutral-100 p-8 shadow-[12px_12px_0px_0px_#30578e] aspect-[3/4] flex items-center justify-center relative overflow-hidden group">
                {/* Decorative grid background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
                
                <img 
                  src="https://images.unsplash.com/photo-1653352639760-a833bd505ee5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWV0YWwlMjBjb3VwbGluZyUyMG1hY2hpbmVyeSUyMHBhcnQlMjBpc29sYXRlZCUyMGJsYWNrJTIwYW5kJTIwd2hpdGV8ZW58MXx8fHwxNzcxMzUyMzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                  alt={productData.name}
                  className="w-full h-auto object-contain mix-blend-multiply drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                />
                
                <div className="absolute bottom-0 right-0 bg-black text-white px-4 py-2 font-mono text-xs font-bold">
                  IMG: {productId}-A1
                </div>
              </div>
              
              <div className="mt-8 border-t-2 border-black pt-4">
                <div className="flex justify-between items-center text-sm font-bold uppercase">
                  <span>Stock Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Technical Drawing */}
        <section className="mb-32 border-t-4 border-black pt-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h3 className="text-4xl md:text-5xl font-black uppercase mb-2">Technical Drawings</h3>
              <div className="w-24 h-2 bg-[#30578e]"></div>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <button className="px-4 py-2 border-2 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors text-sm">Top View</button>
              <button className="px-4 py-2 border-2 border-transparent hover:border-black font-bold uppercase text-sm text-neutral-500 hover:text-black transition-colors">Side View</button>
              <button className="px-4 py-2 border-2 border-transparent hover:border-black font-bold uppercase text-sm text-neutral-500 hover:text-black transition-colors">3D Model</button>
            </div>
          </div>
          
          <div className="w-full bg-black p-1 border-4 border-black">
            <div className="bg-white p-8 md:p-16 relative overflow-hidden" 
                 style={{ backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
              
              <div className="aspect-[16/9] w-full flex items-center justify-center relative">
                 <img 
                    src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobmljYWwlMjBlbmdpbmVlcmluZyUyMGJsdWVwcmludCUyMHNjaGVtYXRpYyUyMGJsYWNrJTIwYW5kJTIwd2hpdGV8ZW58MXx8fHwxNzcxMzUyMzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Technical Drawing"
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 contrast-125 grayscale"
                 />
                 
                 {/* Fake dimension lines overlay */}
                 <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 border-l-2 border-t-2 border-black w-8 h-8"></div>
                    <div className="absolute bottom-10 right-10 border-r-2 border-b-2 border-black w-8 h-8"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 border border-black font-mono text-xs font-bold">
                        SCALE 1:5
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white border-2 border-black p-4 max-w-xs shadow-[4px_4px_0px_0px_#30578e]">
                <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between"><span>DWG NO:</span> <span className="font-bold">A-2024-X</span></div>
                    <div className="flex justify-between"><span>REV:</span> <span className="font-bold">04</span></div>
                    <div className="flex justify-between"><span>DATE:</span> <span className="font-bold">17/02/26</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Specifications */}
        <section className="mb-32">
           <div className="flex flex-col md:flex-row gap-16">
              <div className="w-full md:w-1/3">
                 <h3 className="text-4xl font-black uppercase mb-6">Specifications</h3>
                 <p className="font-mono text-neutral-600 mb-8">
                    Detailed technical specifications for the standard configuration. Custom modifications available upon request.
                 </p>
                 <Button className="w-full flex items-center justify-between group border-2 border-black bg-white text-black hover:bg-white hover:text-black active:bg-neutral-100 active:text-black shadow-[6px_6px_0px_0px_#30578e] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-200 py-4 px-6 h-auto rounded-none">
                    <span className="font-black uppercase tracking-wider text-sm md:text-base">Full Spec Sheet</span>
                    <div className="bg-[#30578e] text-white p-2 border-2 border-black group-hover:bg-white group-hover:text-[#30578e] transition-colors">
                       <Download size={18} />
                    </div>
                 </Button>
              </div>
              
              <div className="w-full md:w-2/3">
                <div className="border-4 border-black">
                   {productData.specs.map((spec, i) => (
                      <div key={i} className="flex border-b-2 border-black last:border-b-0 group hover:bg-neutral-50 transition-colors">
                         <div className="w-1/2 p-4 md:p-6 border-r-2 border-black font-bold uppercase text-sm md:text-base flex items-center">
                            {spec.label}
                         </div>
                         <div className="w-1/2 p-4 md:p-6 font-mono text-neutral-700 text-sm md:text-base flex items-center">
                            {spec.value}
                         </div>
                      </div>
                   ))}
                </div>
              </div>
           </div>
        </section>

        {/* Section 4: FAQ */}
        <section className="max-w-4xl mx-auto mb-20 border-t-4 border-black pt-16">
           <div className="border-2 border-black">
              {/* Function Item */}
              <div className="border-b-2 border-black last:border-b-0">
                 <button 
                   onClick={() => setOpenFaq(openFaq === -2 ? -1 : -2)}
                   className="w-full flex items-center justify-between p-6 bg-neutral-100 hover:bg-neutral-200 transition-colors text-left group"
                 >
                    <h3 className="text-2xl md:text-3xl font-black uppercase">Function</h3>
                    <span className="shrink-0 border-2 border-black p-1 transition-transform duration-300 group-hover:bg-[#30578e] group-hover:text-white">
                       {openFaq === -2 ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                 </button>
                 <AnimatePresence>
                   {openFaq === -2 && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3, ease: "easeInOut" }}
                       className="overflow-hidden border-t-2 border-black bg-white"
                     >
                       <div className="p-8 font-mono text-neutral-800 leading-relaxed space-y-6 text-sm md:text-base">
                          <h4 className="font-bold">Function of torsionally flexible jaw couplings:</h4>
                          <p>
                             Jaw couplings ensure torsional vibration-damping power transmission and offset shocks generated by irregularly operating machines.
                          </p>
                          <p>
                             In contrast to flexible couplings the connecting elements of which are stressed on bending and therefore to earlier wear, the flexible teeth of ROTEX couplings (elastomers) are subjected to compressive stress only. The benefit of the elastomer coupling thus is to withstand significantly higher loads.
                          </p>
                          <p>
                             The elastomers deform with load and high speeds. Sufficient expansion space must be provided.
                          </p>
                          <p>
                             All sizes of ROTEX jaw couplings have a maximum torsion angle of 5°. They can be mounted both horizontally and vertically.
                          </p>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              {/* Material Item */}
              <div className="border-b-2 border-black last:border-b-0">
                 <button 
                   onClick={() => setOpenFaq(openFaq === -3 ? -1 : -3)}
                   className="w-full flex items-center justify-between p-6 bg-neutral-100 hover:bg-neutral-200 transition-colors text-left group"
                 >
                    <h3 className="text-2xl md:text-3xl font-black uppercase">Material</h3>
                    <span className="shrink-0 border-2 border-black p-1 transition-transform duration-300 group-hover:bg-[#30578e] group-hover:text-white">
                       {openFaq === -3 ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                 </button>
                 <AnimatePresence>
                   {openFaq === -3 && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3, ease: "easeInOut" }}
                       className="overflow-hidden border-t-2 border-black bg-white"
                     >
                       <div className="p-8 font-mono text-neutral-800 leading-relaxed space-y-6 text-sm md:text-base">
                          <h4 className="font-bold">Material of torsionally flexible jaw couplings:</h4>
                          <p>
                             Our elastomer material T-PUR® is resistant to higher temperatures and has a considerably longer service life than common polyurethanes. From a visual point of view we marked the T-PUR® (elastomer) material by the colours orange (92 Shore A), purple (98 Shore A) and light green (64 Shore D).
                          </p>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </section>

        <section className="max-w-4xl mx-auto mb-20 pt-8">
            <h3 className="text-4xl md:text-5xl font-black uppercase mb-8">Downloads</h3>
            <div className="border-t border-neutral-200">
                {/* Item 1 */}
                <div className="flex items-start md:items-center gap-4 py-6 border-b border-neutral-300 group hover:bg-neutral-50 transition-colors px-2">
                    <div className="w-12 h-12 bg-[#30578e] text-white flex items-center justify-center shrink-0 mt-1 md:mt-0">
                        <span className="font-bold text-xs tracking-tighter">PDF</span>
                    </div>
                    <div className="flex-grow flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0">
                        <div className="font-bold text-lg leading-tight">Catalogue Drive technology</div>
                        <div className="text-sm font-mono text-neutral-500 whitespace-nowrap flex items-center gap-4 md:gap-8 md:ml-auto">
                            <span className="hidden md:inline-block w-20"></span>
                            <span className="w-24 text-right">PDF | 73 MB</span>
                            <Download size={20} className="text-[#30578e] group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start md:items-center gap-4 py-6 border-b border-neutral-300 group hover:bg-neutral-50 transition-colors px-2">
                    <div className="w-12 h-12 bg-[#30578e] text-white flex items-center justify-center shrink-0 mt-1 md:mt-0">
                        <span className="font-bold text-xs tracking-tighter">PDF</span>
                    </div>
                    <div className="flex-grow flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0">
                        <div className="font-bold text-lg leading-tight">Questionnaire: Selection of couplings general</div>
                        <div className="text-sm font-mono text-neutral-500 whitespace-nowrap flex items-center gap-4 md:gap-8 md:ml-auto">
                            <span className="hidden md:inline-block w-20 text-left">20004</span>
                            <span className="w-24 text-right">PDF | 179 KB</span>
                            <Download size={20} className="text-[#30578e] group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start md:items-center gap-4 py-6 border-b border-neutral-300 group hover:bg-neutral-50 transition-colors px-2">
                    <div className="w-12 h-12 bg-[#30578e] text-white flex items-center justify-center shrink-0 mt-1 md:mt-0">
                        <span className="font-bold text-xs tracking-tighter">PDF</span>
                    </div>
                    <div className="flex-grow flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0">
                        <div className="font-bold text-lg leading-tight">ROTEX Operating/Assembly instructions AFN, BFN, CF, CFN, DF and DFN</div>
                        <div className="text-sm font-mono text-neutral-500 whitespace-nowrap flex items-center gap-4 md:gap-8 md:ml-auto">
                            <span className="hidden md:inline-block w-20 text-left">40212</span>
                            <span className="w-24 text-right">PDF | 2 MB</span>
                            <Download size={20} className="text-[#30578e] group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-start md:items-center gap-4 py-6 border-b border-neutral-300 group hover:bg-neutral-50 transition-colors px-2">
                    <div className="w-12 h-12 bg-[#30578e] text-white flex items-center justify-center shrink-0 mt-1 md:mt-0">
                        <span className="font-bold text-xs tracking-tighter">PDF</span>
                    </div>
                    <div className="flex-grow flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0">
                        <div className="font-bold text-lg leading-tight">T-PUR material comparison</div>
                        <div className="text-sm font-mono text-neutral-500 whitespace-nowrap flex items-center gap-4 md:gap-8 md:ml-auto">
                            <span className="hidden md:inline-block w-20"></span>
                            <span className="w-24 text-right">PDF | 202 KB</span>
                            <Download size={20} className="text-[#30578e] group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="max-w-4xl mx-auto mb-20 border-t-4 border-black pt-16">
            <div className="mb-10">
                <h3 className="text-4xl md:text-5xl font-black uppercase mb-6">CAD drawings</h3>
                <div className="text-neutral-600 space-y-1 mb-6">
                    <p>Find 2D CAD drawings for download here.</p>
                    <p>You need 3D drawings instead? Then please visit our 3D CAD library.</p>
                </div>
                <button className="font-bold uppercase flex items-center gap-2 hover:gap-4 transition-all group">
                    to the 3D-SpaceCenter <ArrowLeft className="rotate-180" size={16} />
                </button>
            </div>

            <div className="border-t-2 border-black group/drawings">
                {/* Initial Items */}
                {[
                    { name: "ROTEX® BFN - 24", id: "449700", type: "ZIP", size: "215 KB" },
                    { name: "ROTEX® BFN - 24", id: "449700", type: "PDF", size: "163 KB" },
                    { name: "ROTEX® BFN - 28", id: "449702", type: "ZIP", size: "222 KB" },
                    { name: "ROTEX® BFN - 28", id: "449702", type: "PDF", size: "164 KB" }
                ].map((file, idx) => (
                    <div key={idx} className={`flex items-center gap-4 py-4 px-4 border-b border-neutral-200 ${idx % 2 === 1 ? 'bg-neutral-100' : 'bg-white'}`}>
                        <div className="w-10 h-10 bg-[#30578e] flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div className="flex-grow font-bold text-sm md:text-base">{file.name}</div>
                        <div className="hidden md:block font-mono text-sm text-neutral-500 w-24 text-right">{file.id}</div>
                        <div className="font-mono text-sm text-neutral-500 w-32 text-right">{file.type} | {file.size}</div>
                        <div className="flex items-center gap-4 ml-4 text-neutral-400">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                             </svg>
                             <Download size={18} className="text-[#30578e] cursor-pointer hover:scale-110 transition-transform" />
                        </div>
                    </div>
                ))}

                {/* Checkbox Hack */}
                <input type="checkbox" id="show-more-drawings" className="peer hidden" />
                
                {/* Collapsible Content */}
                <div className="grid grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                    <div className="overflow-hidden">
                        {[
                            { name: "ROTEX® BFN - 38", id: "449704", type: "ZIP", size: "235 KB" },
                            { name: "ROTEX® BFN - 38", id: "449704", type: "PDF", size: "175 KB" },
                            { name: "ROTEX® BFN - 42", id: "449706", type: "ZIP", size: "245 KB" },
                            { name: "ROTEX® BFN - 42", id: "449706", type: "PDF", size: "185 KB" }
                        ].map((file, idx) => (
                             <div key={idx + 4} className={`flex items-center gap-4 py-4 px-4 border-b border-neutral-200 ${idx % 2 === 1 ? 'bg-neutral-100' : 'bg-white'}`}>
                                <div className="w-10 h-10 bg-[#30578e] flex items-center justify-center shrink-0">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <div className="flex-grow font-bold text-sm md:text-base">{file.name}</div>
                                <div className="hidden md:block font-mono text-sm text-neutral-500 w-24 text-right">{file.id}</div>
                                <div className="font-mono text-sm text-neutral-500 w-32 text-right">{file.type} | {file.size}</div>
                                <div className="flex items-center gap-4 ml-4 text-neutral-400">
                                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                     </svg>
                                     <Download size={18} className="text-[#30578e] cursor-pointer hover:scale-110 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Label Button */}
                <div className="mt-8 flex justify-center peer-checked:[&_.show-all]:hidden peer-checked:[&_.show-less]:block peer-checked:[&_svg]:rotate-45">
                     <label htmlFor="show-more-drawings" className="bg-[#30578e] text-white px-8 py-3 font-bold uppercase text-sm tracking-wider flex items-center gap-2 hover:bg-[#20406e] transition-colors cursor-pointer select-none">
                        <span className="show-all block">Show All</span>
                        <span className="show-less hidden">Show Less</span>
                        <Plus size={16} className="transition-transform duration-300" />
                     </label>
                </div>
            </div>
        </section>

        <section className="max-w-4xl mx-auto border-t-4 border-black pt-16">
            <h3 className="text-4xl md:text-5xl font-black uppercase mb-12 text-center">Frequently Asked Questions</h3>
            <div className="border-t-2 border-black">
                {productData.faqs.map((faq, i) => (
                    <AccordionItem 
                        key={i}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openFaq === i}
                        onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    />
                ))}
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
