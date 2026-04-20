'use client';

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Command, CommandFilters } from '../types/commands';
import CommandCard from './CommandCard';

interface CommandListProps {
  commands: Command[];
  filters: CommandFilters;
  className?: string;
}

export default function CommandList({ commands, filters, className = '' }: CommandListProps) {
  const filteredCommands = useMemo(() => {
    let filtered = commands;

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(cmd => cmd.category === filters.category);
    }

    // Apply chipset filter
    if (filters.chipset) {
      filtered = filtered.filter(cmd => cmd.chipset.includes(filters.chipset!));
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(cmd => cmd.type === filters.type);
    }

    // Apply risk filter
    if (filters.risk) {
      filtered = filtered.filter(cmd => cmd.risk === filters.risk);
    }

    // Apply search filter
    if (filters.search) {
      const fuse = new Fuse(filtered, {
        keys: [
          'title',
          'command',
          'description',
          'tags',
          'notes',
          'category',
          'type',
          'chipset'
        ],
        threshold: 0.3,
        includeScore: true,
        ignoreLocation: true,
        findAllMatches: true,
      });

      const searchResults = fuse.search(filters.search);
      filtered = searchResults.map(result => result.item);
    }

    return filtered;
  }, [commands, filters]);

  if (filteredCommands.length === 0) {
    return (
      <div className="state-empty">
        <span className="state-icon">No commands found</span>
        <p className="state-msg">
          {filters.search 
            ? `No results for "${filters.search}"`
            : 'No commands match your filters'
          }
        </p>
        <p className="state-sub">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-mono text-[var(--t3)] mb-4">
        {filteredCommands.length} of {commands.length} commands
      </div>
      
      <div className="grid-gap">
        {filteredCommands.map((command, index) => (
          <div
            key={command.id}
            className="anim-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CommandCard command={command} />
          </div>
        ))}
      </div>
    </div>
  );
}
