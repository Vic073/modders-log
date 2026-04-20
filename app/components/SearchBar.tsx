'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search commands...", 
  className = "" 
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`search-wrap ${className}`}>
      <Search className="search-icon" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`search-input ${focused ? 'border-[var(--y)]' : ''}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-10 p-1 rounded hover:bg-[var(--s4)] transition-colors"
        >
          <X className="w-3 h-3 text-[var(--t3)]" />
        </button>
      )}
      <kbd className="search-shortcut">
        {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+K
      </kbd>
    </div>
  );
}
