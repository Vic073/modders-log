'use client';

import { useState, useEffect } from 'react';
import { 
  Terminal, Plus, Settings, StickyNote, Command as CmdIcon, FileCode, 
  Menu, X, ChevronDown, Hash, Clock, Download 
} from 'lucide-react';
import { Command, CommandFilters } from './types/commands';
import SearchBar from './components/SearchBar';
import FilterPills from './components/FilterPills';
import CommandList from './components/CommandList';
import CommandPalette from './components/CommandPalette';
import ExportPanel from './components/ExportPanel';
import WebUSBPanel from './components/WebUSBPanel';
import CommandEditor from './components/CommandEditor';

export default function Home() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [filters, setFilters] = useState<CommandFilters>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogText, setQuickLogText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('modders-log-quick') || '';
    }
    return '';
  });
  const [showPalette, setShowPalette] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCommands, setSelectedCommands] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWebUSB, setShowWebUSB] = useState(true);

  useEffect(() => {
    loadCommands();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!showEditor) setShowPalette(true);
      }
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditor]);

  // Persist quick log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('modders-log-quick', quickLogText);
    }
  }, [quickLogText]);

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

  const handleSaveCommand = (commandData: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCommand: Command = {
      ...commandData,
      id: editingCommand?.id || `cmd-${Date.now()}`,
      createdAt: editingCommand?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingCommand) {
      setCommands(prev => prev.map(cmd => cmd.id === editingCommand.id ? newCommand : cmd));
    } else {
      setCommands(prev => [newCommand, ...prev]);
    }
    setEditingCommand(null);
  };

  const handleEditCommand = (command: Command) => {
    setEditingCommand(command);
    setShowEditor(true);
  };

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
      {/* Modals */}
      <CommandPalette
        commands={commands}
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onSelectCommand={handleSelectCommandFromPalette}
      />

      <CommandEditor
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingCommand(null);
        }}
        onSave={handleSaveCommand}
        initialCommand={editingCommand}
      />

      {/* Export Panel */}
      {showExport && (
        <ExportPanel
          selectedCommands={selectedCommandsList}
          onClearSelection={handleClearSelection}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Selection Mode Banner */}
      {selectionMode && (
        <div className="selection-banner">
          <div className="selection-banner-content">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-[var(--t2)]">
                <Hash className="w-4 h-4 inline mr-1" />
                {selectedCommands.size} selected
              </span>
              <button
                onClick={() => setShowExport(true)}
                disabled={selectedCommands.size === 0}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </button>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-xs font-mono text-[var(--t3)] hover:text-[var(--t1)] px-3 py-1.5 rounded-lg hover:bg-[var(--s3)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-section">
          {/* Mobile Menu Toggle */}
          <button 
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--yd)] rounded-lg">
              <Terminal className="w-4 h-4 text-[var(--y)]" />
            </div>
            <span className="nav-logo hidden sm:block">The Modder's Log</span>
            <span className="nav-logo sm:hidden">Modder's Log</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            <button
              onClick={() => setShowPalette(true)}
              className="nav-link"
            >
              <CmdIcon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Palette</span>
              <kbd className="ml-1.5 px-1 py-0.5 text-[9px] bg-[var(--s3)] rounded hidden xl:inline">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setSelectionMode(!selectionMode)}
              className={`nav-link ${selectionMode ? 'active' : ''}`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Select</span>
            </button>

            <button
              onClick={() => setShowQuickLog(!showQuickLog)}
              className={`nav-link ${showQuickLog ? 'active' : ''}`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Log</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`nav-link ${showFilters ? 'active' : ''}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Filters</span>
            </button>
          </div>
        </div>
        
        <div className="nav-section">
          <button 
            className="btn-primary text-xs sm:text-sm"
            onClick={() => {
              setEditingCommand(null);
              setShowEditor(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Command</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[var(--hdr)] left-0 right-0 z-50 bg-[var(--s1)] border-b border-[var(--b2)] p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setShowPalette(true); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--s2)] text-[var(--t2)] hover:text-[var(--t1)] transition-colors"
            >
              <CmdIcon className="w-4 h-4" />
              Command Palette
              <kbd className="ml-auto px-2 py-0.5 text-[10px] bg-[var(--s3)] rounded">⌘K</kbd>
            </button>
            <button
              onClick={() => { setSelectionMode(!selectionMode); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                selectionMode ? 'bg-[var(--s2)] text-[var(--t1)]' : 'hover:bg-[var(--s2)] text-[var(--t2)]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Select Commands
            </button>
            <button
              onClick={() => { setShowQuickLog(!showQuickLog); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                showQuickLog ? 'bg-[var(--s2)] text-[var(--t1)]' : 'hover:bg-[var(--s2)] text-[var(--t2)]'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              Quick Log
            </button>
            <button
              onClick={() => { setShowFilters(!showFilters); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                showFilters ? 'bg-[var(--s2)] text-[var(--t1)]' : 'hover:bg-[var(--s2)] text-[var(--t2)]'
              }`}
            >
              <Settings className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => { setShowWebUSB(!showWebUSB); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                showWebUSB ? 'bg-[var(--s2)] text-[var(--t1)]' : 'hover:bg-[var(--s2)] text-[var(--t2)]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              USB Devices
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`container pt-4 ${selectionMode ? 'pt-[calc(var(--hdr)+3.5rem)]' : ''}`}>
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-display mb-2">The Modder's Log</h1>
              <p className="text-body text-[var(--t2)] max-w-2xl">
                A terminal-aesthetic command library for Android modders. Built for one-handed use on a second phone while your primary device sits in fastboot.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[var(--t3)]">
              <Clock className="w-3.5 h-3.5" />
              <span>{commands.length} commands</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={filters.search || ''}
            onChange={(value) => handleFilterChange('search', value)}
            placeholder="Search commands, tags, or descriptions..."
          />
        </div>

        {/* Main Layout */}
        <div className={`main-layout ${!showFilters ? 'no-sidebar' : ''}`}>
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="sidebar-sticky">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-heading text-lg">Filters</h3>
                  <button 
                    onClick={() => setFilters({})}
                    className="text-xs font-mono text-[var(--t3)] hover:text-[var(--y)] transition-colors"
                  >
                    Clear all
                  </button>
                </div>
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

          {/* Content Area */}
          <div className="content-area">
            {/* Active Filters Display */}
            {(filters.category || filters.chipset || filters.type || filters.risk || filters.search) && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-[var(--t3)] font-mono text-xs">Active:</span>
                {filters.search && (
                  <span className="px-2 py-1 bg-[var(--yd)] text-[var(--y)] rounded text-xs font-mono">
                    search: {filters.search}
                  </span>
                )}
                {filters.category && (
                  <span className="px-2 py-1 bg-[var(--s3)] text-[var(--t2)] rounded text-xs font-mono">
                    {filters.category}
                  </span>
                )}
                {filters.chipset && (
                  <span className="px-2 py-1 bg-[var(--s3)] text-[var(--t2)] rounded text-xs font-mono">
                    {filters.chipset}
                  </span>
                )}
                {filters.type && (
                  <span className="px-2 py-1 bg-[var(--s3)] text-[var(--t2)] rounded text-xs font-mono">
                    {filters.type}
                  </span>
                )}
                {filters.risk && (
                  <span className="px-2 py-1 bg-[var(--s3)] text-[var(--t2)] rounded text-xs font-mono">
                    {filters.risk}
                  </span>
                )}
              </div>
            )}

            {/* Command List */}
            <CommandList 
              commands={commands} 
              filters={filters} 
              selectionMode={selectionMode}
              selectedCommands={selectedCommands}
              onToggleSelection={handleToggleSelection}
              onEditCommand={handleEditCommand}
            />

            {/* WebUSB Section */}
            <div className="section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading text-xl">Device Connection</h2>
                <button
                  onClick={() => setShowWebUSB(!showWebUSB)}
                  className="flex items-center gap-1 text-xs font-mono text-[var(--t3)] hover:text-[var(--t1)] transition-colors"
                >
                  {showWebUSB ? 'Hide' : 'Show'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showWebUSB ? '' : '-rotate-90'}`} />
                </button>
              </div>
              {showWebUSB && <WebUSBPanel />}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Log Panel - Improved Positioning */}
      {showQuickLog && (
        <div className="floating-panel bottom-right">
          <div className="p-4 border-b border-[var(--b1)] flex items-center justify-between">
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-[var(--y)]" />
              Quick Log
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const timestamp = new Date().toLocaleString();
                  setQuickLogText(prev => prev + (prev ? '\n' : '') + `[${timestamp}] `);
                }}
                className="p-1.5 rounded hover:bg-[var(--s3)] transition-colors"
                title="Insert timestamp"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--t3)]" />
              </button>
              <button
                onClick={() => setShowQuickLog(false)}
                className="p-1.5 rounded hover:bg-[var(--s3)] transition-colors"
              >
                <X className="w-4 h-4 text-[var(--t3)]" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={quickLogText}
              onChange={(e) => setQuickLogText(e.target.value)}
              placeholder="Session notes, serial numbers, error codes...&#10;Auto-saved to browser storage"
              className="w-full h-40 p-3 bg-[var(--s2)] border border-[var(--b2)] rounded-lg text-[var(--t1)] font-mono text-sm resize-none focus:border-[var(--y)] focus:outline-none"
            />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs font-mono text-[var(--t3)]">
                {quickLogText.length} chars • Auto-saved
              </span>
              <button
                onClick={() => setQuickLogText('')}
                className="text-xs font-mono text-[var(--t3)] hover:text-[var(--red)] transition-colors px-2 py-1 rounded hover:bg-[var(--red-bg)]"
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
