'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Terminal, Copy, X } from 'lucide-react';
import { Command } from '../types/commands';

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (command: Command) => void;
}

export default function CommandPalette({ 
  commands, 
  isOpen, 
  onClose, 
  onSelectCommand 
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => {
    return new Fuse(commands, {
      keys: ['title', 'command', 'description', 'tags', 'category', 'type'],
      threshold: 0.3,
    });
  }, [commands]);

  const results = useMemo(() => {
    if (!search.trim()) return commands.slice(0, 10);
    return fuse.search(search).map(r => r.item);
  }, [search, fuse, commands]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelectCommand(results[selectedIndex]);
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectCommand]);

  // Scroll selected into view
  useEffect(() => {
    const element = listRef.current?.children[selectedIndex] as HTMLElement;
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const typeColors: Record<string, string> = {
    adb: 'text-purple-400',
    fastboot: 'text-lime-400',
    python: 'text-pink-400',
    shell: 'text-blue-400',
    edl: 'text-orange-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-[var(--s1)] border border-[var(--b2)] rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--b1)]">
          <Search className="w-5 h-5 text-[var(--t3)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, type 'adb' or 'flash'..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--t1)] text-lg placeholder:text-[var(--t3)]"
          />
          <kbd className="px-2 py-1 text-xs font-mono text-[var(--t3)] bg-[var(--s3)] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-[var(--t3)]">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            results.map((cmd, index) => (
              <div
                key={cmd.id}
                onClick={() => {
                  onSelectCommand(cmd);
                  onClose();
                }}
                className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-[var(--yd)] border-l-2 border-[var(--y)]' 
                    : 'hover:bg-[var(--s2)] border-l-2 border-transparent'
                }`}
              >
                <Terminal className={`w-4 h-4 mt-1 ${typeColors[cmd.type] || 'text-[var(--t2)]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--t1)] truncate">{cmd.title}</span>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${typeColors[cmd.type] || ''} bg-opacity-10`}>
                      {cmd.type}
                    </span>
                    <span className="text-xs font-mono text-[var(--t3)]">
                      {cmd.category}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--t2)] truncate mt-0.5">
                    {cmd.description}
                  </p>
                  <code className="text-xs text-[var(--t3)] truncate block mt-1">
                    {cmd.command.split('\n')[0]}
                  </code>
                </div>
                {index === selectedIndex && (
                  <kbd className="px-1.5 py-0.5 text-xs font-mono text-[var(--y)] bg-[var(--yd)] rounded">
                    ↵
                  </kbd>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--b1)] bg-[var(--s2)] text-xs text-[var(--t3)]">
          <div className="flex items-center gap-4">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
          <span>{results.length} commands</span>
        </div>
      </div>
    </div>
  );
}
