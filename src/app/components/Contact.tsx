import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Contact() {
  const cards = [
    {
      title: "Services and Tools",
      description: "Here you will find contacts, online tools, catalogues & brochures, our CAD library, assembly instructions and more.",
      image: "https://images.unsplash.com/photo-1768796370407-6d36619e7d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdpbmVlcnMlMjB3b3JraW5nJTIwYmx1ZXByaW50cyUyMGluZHVzdHJpYWwlMjB0ZWFtfGVufDF8fHx8MTc3MTMxODg2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "Shop",
      description: "KTR Shop: Obtain your products easily",
      image: "https://images.unsplash.com/photo-1759692071969-c32285cffc40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWFjaGluZXJ5JTIwd29ya2VycyUyMGluc3BlY3Rpb258ZW58MXx8fHwxNzcxMzE4ODYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "Contact",
      description: "Do you have a question? Our team is at your disposal",
      image: "https://images.unsplash.com/photo-1764726354539-96228698dc45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMGRpdmVyc2UlMjBjb3Jwb3JhdGUlMjB0ZWFtJTIwc3RhbmRpbmclMjB0b2dldGhlciUyMGZhY3Rvcnl8ZW58MXx8fHwxNzcxMzE4ODYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <section className="py-20 bg-white text-black border-t-4 border-black">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="font-black uppercase tracking-tighter text-4xl md:text-[64px] leading-none mb-2">
            Company
          </h2>
          <div className="w-24 h-2 bg-[#30578e]"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {cards.map((card, index) => {
            const route = card.title.toLowerCase().includes('services') ? '/services' :
                         card.title.toLowerCase().includes('shop') ? '/shop' :
                         '/contact-us';

            return (
              <Link to={route} key={index} className="group cursor-pointer block">
                <div className="relative mb-8 border-4 border-black shadow-[8px_8px_0px_0px_#30578e] group-hover:shadow-[12px_12px_0px_0px_#30578e] group-hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <ImageWithFallback 
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                    {card.title}
                    <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="font-mono text-neutral-600 leading-relaxed border-l-4 border-transparent group-hover:border-black pl-0 group-hover:pl-4 transition-all duration-300 text-[12px]">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
