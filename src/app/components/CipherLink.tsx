import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

interface CipherLinkProps {
  label: string;
  href: string;
  expandedText: string;
}

export function CipherLink({ label, href, expandedText }: CipherLinkProps) {
  const [displayText, setDisplayText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      let iteration = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setDisplayText(prev =>
          label
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return label[index];
              }
              return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
            })
            .join('')
        );

        if (iteration >= label.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDisplayText(label);
        }

        iteration += 1 / 3;
      }, 30);
    } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(label);
    }

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, label]);

  return (
    <Link
      to={href}
      className="group flex items-center font-bold text-[13px] relative py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="uppercase tracking-tighter shrink-0 relative z-10 font-black">
        {displayText.startsWith('TT') ? (
          <>
            <span className="text-[#30578e]">TT</span>
            {displayText.slice(2)}
          </>
        ) : displayText}
      </span>
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out relative z-10 ${isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
        {expandedText}
      </span>
      
      <span className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ease-in-out ${isHovered ? 'w-full' : 'w-0'}`} />
    </Link>
  );
}
