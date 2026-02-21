import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const images = [
  "https://images.unsplash.com/photo-1744870132281-f7768476b520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwbWluaW1hbGlzdCUyMGludGVyaW9yfGVufDF8fHx8MTc3MTMxNzcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1644670054190-2eba01ace931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwZ3J1bmdlJTIwdGV4dHVyZXxlbnwxfHx8fDE3NzEzMTc3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1687509830842-4b706e209664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwYnJ1dGFsaXN0JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcxMzE3NzA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1635280878121-ad290dd74cbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwZ2VvbWV0cmljJTIwc2hhcGVzfGVufDF8fHx8MTc3MTMxNzc4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1738918921961-72d2f3f6509e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwaW5kdXN0cmlhbCUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzEzMTc3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1690796802822-677fa8d8023f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwY29uY3JldGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MTMxNzc4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
];

export function StoryDetail() {
  const { id } = useParams();
  const index = parseInt(id || '0');
  const image = images[index] || images[0];
  const nextIndex = (index + 1) % images.length;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-32 pb-20 container mx-auto px-6">
        
        {/* Navigation */}
        <div className="mb-12 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
          <Link to="/" className="hover:text-black hover:underline">Home</Link>
          <ChevronRight size={12} />
          <Link to="/stories" className="hover:text-black hover:underline">Stories</Link>
          <ChevronRight size={12} />
          <span className="text-black">Story 0{index + 1}</span>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-16 border-t-4 border-black pt-12">
            
            {/* Left Column: Text (70%) */}
            <div className="w-full lg:w-[70%]">
                <div className="flex items-center gap-4 mb-6">
                   <span className="font-mono text-xs text-neutral-500">STORY 0{index + 1}</span>
                   <div className="h-[1px] w-12 bg-black"></div>
                   <span className="font-mono text-xs text-neutral-500 uppercase">Architecture / Design</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-8 break-words">
                    Industrial Echoes & Concrete Forms
                </h1>
                
                <p className="text-xl md:text-3xl font-bold leading-tight mb-16 max-w-3xl">
                    An exploration of structural integrity and raw materiality in the modern era, defining the space between void and mass.
                </p>

                {/* Article Content */}
                <article className="prose prose-xl prose-neutral max-w-none font-mono text-neutral-800">
                    <p className="mb-8 indent-12 first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
                        The brutalist movement was never just about concrete. It was about an ethic—a commitment to truth in materials and the honest expression of function. In this project, we explore how these principles translate to contemporary spaces, stripping away the superfluous to reveal the essential.
                    </p>
                    
                    <div className="border-l-4 border-black pl-8 my-12 py-2">
                        <p className="text-2xl font-bold italic text-black">
                            "Gravity is not an adversary, but a partner. The way a building touches the ground defines its soul."
                        </p>
                    </div>

                    <h3 className="text-3xl font-black uppercase mt-16 mb-6">The Philosophy of Weight</h3>
                    <p className="mb-8">
                        Gravity is the primary force we contend with. By exposing the load-bearing elements, we create a visual dialogue between the structure and the earth it sits upon. The massive forms are not meant to intimidate, but to ground us in reality. Every beam and column tells a story of support and resistance.
                    </p>
                    <p className="mb-8">
                        We stripped away the cladding, the paint, the decorative trim. Just the raw skeleton of the building remains, standing naked and unashamed. This honesty allows the user to understand the building's anatomy at a glance.
                    </p>

                    <h3 className="text-3xl font-black uppercase mt-16 mb-6">Light and Shadow</h3>
                    <p className="mb-8">
                        In a monochromatic environment, light becomes the only painter. The deep recesses of the waffle slab ceiling catch the shadows, creating a rhythmic texture that changes throughout the day. As the sun moves, the building breathes, transforming from a static object into a dynamic experience.
                    </p>
                     <p className="mb-8">
                        The interplay of sharp geometric shadows against the rough texture of the concrete creates a natural ornamentation that no architect could design manually. It is the result of pure form meeting natural light.
                    </p>
                </article>
            </div>

            {/* Right Column: Image (30%) */}
            <div className="w-full lg:w-[30%]">
                <div className="sticky top-32 flex flex-col gap-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border-4 border-black shadow-[12px_12px_0px_0px_#30578e] bg-white"
                    >
                        <div className="aspect-[3/4] w-full relative border-b-4 border-black">
                            <img 
                                src={image} 
                                alt="Story visual" 
                                className="w-full h-full object-cover grayscale"
                            />
                        </div>
                        <div className="p-6 font-mono text-xs bg-white">
                            <div className="flex justify-between py-2 border-b border-black">
                                <span className="text-neutral-500">DATE</span>
                                <span className="font-bold">FEB 2026</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-black">
                                <span className="text-neutral-500">LOCATION</span>
                                <span className="font-bold uppercase">Berlin, DE</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-black">
                                <span className="text-neutral-500">PHOTOGRAPHY</span>
                                <span className="font-bold uppercase">Unsplash</span>
                            </div>
                             <div className="flex justify-between py-2 pt-4">
                                <span className="text-neutral-500">SHARE</span>
                                <div className="flex gap-2 font-bold underline cursor-pointer">
                                    <span>TW</span>
                                    <span>IG</span>
                                    <span>LI</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="p-6 bg-black text-white border-4 border-black">
                        <h4 className="font-black uppercase text-xl mb-4">Related Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Brutalism', 'Concrete', 'Minimal', 'Architecture', 'Design'].map(tag => (
                                <span key={tag} className="px-3 py-1 border border-white/50 text-xs uppercase font-mono hover:bg-white hover:text-black cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-32 border-t-4 border-black pt-12">
            <Link to={`/stories/${nextIndex}`} className="group block">
                <span className="font-mono text-xs text-neutral-500 mb-2 block">NEXT STORY</span>
                <div className="flex items-center justify-between">
                    <h3 className="text-4xl md:text-6xl font-black uppercase group-hover:underline decoration-4 underline-offset-8">
                        View Next Project
                    </h3>
                    <ArrowRight size={48} className="transform group-hover:translate-x-4 transition-transform duration-300" />
                </div>
            </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
