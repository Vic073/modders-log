'use client';

import { useState, useEffect } from 'react';
import { Terminal, Plus, Settings, StickyNote, Command as CmdIcon, FileCode, Usb } from 'lucide-react';
import { Command, CommandFilters } from './types/commands';
import SearchBar from './components/SearchBar';
import FilterPills from './components/FilterPills';
import CommandList from './components/CommandList';
import CommandPalette from './components/CommandPalette';
import ExportPanel from './components/ExportPanel';

export default function Home() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [filters, setFilters] = useState<CommandFilters>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogText, setQuickLogText] = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCommands, setSelectedCommands] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCommands();
  }, []);

  // Keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadCommands = async () => {
    try {
      const response = await fetch('/data/commands.json');
      const data = await response.json();
      setCommands(data);
    } catch (error) {
      console.error('Failed to load commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CommandFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggleSelection = (commandId: string) => {
    setSelectedCommands(prev => {
      const next = new Set(prev);
      if (next.has(commandId)) {
        next.delete(commandId);
      } else {
        next.add(commandId);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedCommands(new Set());
    setSelectionMode(false);
  };

  const handleSelectCommandFromPalette = (command: Command) => {
    // Scroll to command or highlight it
    const element = document.getElementById(`command-${command.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('flash-copy');
      setTimeout(() => element.classList.remove('flash-copy'), 400);
    }
  };

  const selectedCommandsList = commands.filter(cmd => selectedCommands.has(cmd.id));

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="space-y-4">
            <div className="skeleton h-8 w-48"></div>
            <div className="skeleton h-12 w-full"></div>
            <div className="space-y-2">
              <div className="skeleton h-20 w-full"></div>
              <div className="skeleton h-20 w-full"></div>
              <div className="skeleton h-20 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Command Palette Modal */}
      <CommandPalette
        commands={commands}
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onSelectCommand={handleSelectCommandFromPalette}
      />

      {/* Export Panel */}
      {showExport && (
        <ExportPanel
          selectedCommands={selectedCommandsList}
          onClearSelection={handleClearSelection}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Selection Mode Bar */}
      {selectionMode && (
        <div className="fixed top-[var(--hdr)] left-0 right-0 z-30 bg-[var(--s1)] border-b border-[var(--b2)] px-4 py-3">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-[var(--t2)]">
                {selectedCommands.size} selected
              </span>
              <button
                onClick={() => setShowExport(true)}
                disabled={selectedCommands.size === 0}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
              >
                <FileCode className="w-3 h-3" />
                Export
              </button>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-xs font-mono text-[var(--t3)] hover:text-[var(--t1)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="nav">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[var(--y)]" />
            <span className="nav-logo">The Modder's Log</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowPalette(true)}
            className="nav-link hidden sm:flex"
          >
            <CmdIcon className="w-4 h-4 mr-1" />
            Command Palette
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-[var(--s3)] rounded">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setSelectionMode(!selectionMode)}
            className={`nav-link ${selectionMode ? 'active' : ''}`}
          >
            <FileCode className="w-4 h-4 mr-1" />
            Select
          </button>

          <button
            onClick={() => setShowQuickLog(!showQuickLog)}
            className={`nav-link ${showQuickLog ? 'active' : ''}`}
          >
            <StickyNote className="w-4 h-4 mr-1" />
            Quick Log
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`nav-link ${showFilters ? 'active' : ''}`}
          >
            <Settings className="w-4 h-4 mr-1" />
            Filters
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Command
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display mb-2">The Modder's Log</h1>
          <p className="text-body text-[var(--t2)] max-w-2xl">
            A terminal-aesthetic command library for Android modders. Built for one-handed use on a second phone while your primary device sits in fastboot.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={filters.search || ''}
            onChange={(value) => handleFilterChange('search', value)}
            placeholder="Search commands, tags, or descriptions..."
          />
        </div>

        <div className={`layout-split ${selectionMode ? 'pt-16' : ''}`}>
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="sticky top-20">
              <div className="card p-6">
                <h3 className="text-heading mb-6">Filters</h3>
                <FilterPills
                  selectedCategory={filters.category}
                  selectedChipset={filters.chipset}
                  selectedType={filters.type}
                  selectedRisk={filters.risk}
                  onCategoryChange={(cat) => handleFilterChange('category', cat)}
                  onChipsetChange={(chip) => handleFilterChange('chipset', chip)}
                  onTypeChange={(type) => handleFilterChange('type', type)}
                  onRiskChange={(risk) => handleFilterChange('risk', risk)}
                />
              </div>
            </aside>
          )}

          {/* Command List */}
          <div className={showFilters ? '' : 'col-span-full'}>
            <CommandList 
              commands={commands} 
              filters={filters} 
              selectionMode={selectionMode}
              selectedCommands={selectedCommands}
              onToggleSelection={handleToggleSelection}
            />
          </div>
        </div>

        {/* WebUSB Experimental Section */}
        <div className="mt-16 pt-8 border-t border-[var(--b1)]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--s2)] rounded-lg">
              <Usb className="w-6 h-6 text-[var(--y)]" />
            </div>
            <div>
              <h3 className="text-heading mb-2">WebUSB / WebADB Integration</h3>
              <p className="text-body text-[var(--t2)] mb-4">
                The "Holy Grail" feature - Connect to your Android device directly from the browser using the WebUSB API. 
                Imagine running <code>adb devices</code> and seeing your connected phone appear instantly.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-1 bg-[var(--red-bg)] text-[var(--red)] rounded">
                  EXPERIMENTAL
                </span>
                <span className="text-xs font-mono text-[var(--t3)]">
                  WebUSB API support varies by browser
                </span>
              </div>
              <p className="text-xs text-[var(--t3)] mt-2">
                Note: Per the original requirements, this feature is currently out of scope for MVP due to WebUSB reliability issues.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Log Panel */}
      {showQuickLog && (
        <div className="fixed bottom-0 right-4 w-96 max-w-[90vw] bg-[var(--s1)] border border-[var(--b2)] rounded-t-lg shadow-lg">
          <div className="p-4 border-b border-[var(--b1)] flex items-center justify-between">
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-[var(--y)]" />
              Quick Log
            </h3>
            <button
              onClick={() => setShowQuickLog(false)}
              className="text-[var(--t3)] hover:text-[var(--t1)] transition-colors"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <textarea
              value={quickLogText}
              onChange={(e) => setQuickLogText(e.target.value)}
              placeholder="Session notes, serial numbers, error codes..."
              className="w-full h-32 p-3 bg-[var(--s2)] border border-[var(--b2)] rounded text-[var(--t1)] font-mono text-sm resize-none focus:border-[var(--y)] focus:outline-none"
            />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs font-mono text-[var(--t3)]">
                Auto-timestamped scratch space
              </span>
              <button
                onClick={() => setQuickLogText('')}
                className="text-xs font-mono text-[var(--t3)] hover:text-[var(--t1)] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
