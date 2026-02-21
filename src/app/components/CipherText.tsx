import React, { useState, useEffect, useRef } from 'react';

const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

interface CipherTextProps {
  initialText: string;
  expandedText: string;
  className?: string;
}

export function CipherText({ initialText, expandedText, className = '' }: CipherTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Logic for the first part (e.g., "TT")
  // We keep the full text and use CSS to hide characters if needed
  const [displayInitial, setDisplayInitial] = useState(initialText);
  
  // Logic for the second part (e.g., "rueTorq")
  const [displayExpanded, setDisplayExpanded] = useState(expandedText);
  
  // Ref for intervals
  const intervalInitialRef = useRef<NodeJS.Timeout | null>(null);
  const intervalExpandedRef = useRef<NodeJS.Timeout | null>(null);

  // Scramble function
  const scrambleText = (text: string, setText: React.Dispatch<React.SetStateAction<string>>, intervalRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setText(prev =>
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setText(text);
      }

      iteration += 1 / 3;
    }, 30);
  };

  // Effect for Initial Text
  useEffect(() => {
    if (isHovered) {
      scrambleText(initialText, setDisplayInitial, intervalInitialRef);
    } else {
      setDisplayInitial(initialText);
      if (intervalInitialRef.current) clearInterval(intervalInitialRef.current);
    }
    return () => { if (intervalInitialRef.current) clearInterval(intervalInitialRef.current); };
  }, [isHovered, initialText]);

  // Effect for Expanded Text
  useEffect(() => {
    if (isHovered) {
      scrambleText(expandedText, setDisplayExpanded, intervalExpandedRef);
    } else {
      setDisplayExpanded(expandedText); // Reset to normal
      if (intervalExpandedRef.current) clearInterval(intervalExpandedRef.current);
    }
    return () => { if (intervalExpandedRef.current) clearInterval(intervalExpandedRef.current); };
  }, [isHovered, expandedText]);

  return (
    <span 
      className={`inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
       <span className="uppercase tracking-tighter shrink-0 relative z-10 inline-flex">
         {displayInitial.split('').map((char, index) => (
           <span 
             key={index} 
             className={`transition-all duration-300 ease-in-out inline-block ${
               isHovered && initialText === 'TT' && index === 1 
                 ? 'max-w-0 opacity-0 overflow-hidden' 
                 : 'max-w-[100px] opacity-100'
             } ${initialText === 'TT' ? 'text-[#30578e]' : ''}`}
           >
             {char}
           </span>
         ))}
       </span>
       <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out relative z-10 ${isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
         {displayExpanded}
       </span>
    </span>
  );
}
