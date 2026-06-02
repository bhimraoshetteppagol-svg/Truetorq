import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface CatalogProduct {
  _id: string;
  name?: string;
  productName?: string;
  description?: string;
  productDescription?: string;
  price?: number;
  category?: string;
}

interface ProductNameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: CatalogProduct) => void;
  catalog: CatalogProduct[];
  placeholder?: string;
}

const getProductName = (product: CatalogProduct) =>
  product.productName || product.name || '';

export function ProductNameAutocomplete({
  value,
  onChange,
  onSelect,
  catalog,
  placeholder = 'Search product',
}: ProductNameAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    const sorted = [...catalog].sort((a, b) =>
      getProductName(a).localeCompare(getProductName(b))
    );
    if (!query) {
      return sorted.slice(0, 12);
    }
    return sorted
      .filter((product) => getProductName(product).toLowerCase().includes(query))
      .slice(0, 12);
  }, [value, catalog]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, suggestions.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pickProduct = (product: CatalogProduct) => {
    onSelect(product);
    setOpen(false);
  };

  const inputClass =
    'w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors';

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && suggestions[highlightIndex]) {
            e.preventDefault();
            pickProduct(suggestions[highlightIndex]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-[110] left-0 right-0 mt-1 border-4 border-black bg-white max-h-52 overflow-y-auto shadow-[4px_4px_0px_0px_#30578e]"
          role="listbox"
        >
          {suggestions.map((product, index) => {
            const name = getProductName(product);
            const price =
              product.price != null && !Number.isNaN(Number(product.price))
                ? `₹${Number(product.price).toFixed(2)}`
                : '';
            return (
              <li key={product._id} role="option" aria-selected={index === highlightIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickProduct(product);
                  }}
                  className={`w-full text-left px-3 py-2 border-b-2 border-neutral-200 last:border-b-0 transition-colors ${
                    index === highlightIndex
                      ? 'bg-black text-white'
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  <div className="font-bold text-sm break-words">{name}</div>
                  <div className="text-[10px] sm:text-xs opacity-80 flex flex-wrap gap-x-2 gap-y-0.5">
                    {product.category && <span>{product.category}</span>}
                    {price && <span>{price}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && value.trim() && suggestions.length === 0 && (
        <div className="absolute z-[110] left-0 right-0 mt-1 border-4 border-black bg-white px-3 py-2 font-mono text-xs shadow-[4px_4px_0px_0px_#30578e]">
          No matching products
        </div>
      )}
    </div>
  );
}
