'use client';

import { useState, useMemo } from 'react';
import { Copy, Terminal, AlertTriangle, Shield, Zap, Edit3, Check, X, Pencil } from 'lucide-react';
import { Command, CommandType, RiskLevel } from '../types/commands';

interface CommandCardProps {
  command: Command;
  className?: string;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: (command: Command) => void;
}

const riskIcons = {
  safe: Shield,
  caution: AlertTriangle,
  destructive: Zap,
};

const riskColors = {
  safe: 'text-green-400',
  caution: 'text-orange-400', 
  destructive: 'text-red-400',
};

const typeColors = {
  adb: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  fastboot: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  python: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  shell: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  edl: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const categoryColors = {
  bootloader: 'bg-blue-500/10 text-blue-400',
  recovery: 'bg-green-500/10 text-green-400',
  flashing: 'bg-orange-500/10 text-orange-400',
  backup: 'bg-cyan-500/10 text-cyan-400',
  debugging: 'bg-purple-500/10 text-purple-400',
  partition: 'bg-pink-500/10 text-pink-400',
  sideload: 'bg-lime-500/10 text-lime-400',
  scripting: 'bg-yellow-500/10 text-yellow-400',
};

const chipsetColors = {
  qualcomm: 'bg-blue-500/10 text-blue-400',
  unisoc: 'bg-orange-500/10 text-orange-400',
  mediatek: 'bg-green-500/10 text-green-400',
  'samsung-exynos': 'bg-purple-500/10 text-purple-400',
  generic: 'bg-gray-500/10 text-gray-400',
};

// Extract variables from command text
function extractVariables(command: string): string[] {
  const varPattern = /\[([A-Z_]+)\]|\$\{?([A-Z_]+)\}?/g;
  const matches: string[] = [];
  let match;
  while ((match = varPattern.exec(command)) !== null) {
    matches.push(match[1] || match[2]);
  }
  return [...new Set(matches)];
}

function highlightSyntax(command: string, variables: Record<string, string>): string {
  let highlighted = command;
  
  // Replace variables with their values
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`\\[${key}\\]|\\$\\{?${key}\\}?`, 'g');
    highlighted = highlighted.replace(pattern, `<span class="token-var">${value}</span>`);
  });
  
  // Highlight commands (adb, fastboot, python3, etc.)
  highlighted = highlighted.replace(/\b(adb|fastboot|python|python3|shell|dd|lsusb|reboot|install|flash|boot|getprop|wipe|sideload)\b/g, 
    '<span class="token-cmd">$1</span>');
  
  // Highlight flags and options
  highlighted = highlighted.replace(/(--[\w-]+|-[a-zA-Z])/g, 
    '<span class="token-flag">$1</span>');
  
  // Highlight strings in quotes
  highlighted = highlighted.replace(/"([^"]*)"/g, 
    '<span class="token-string">"$1"</span>');
  
  // Highlight file paths
  highlighted = highlighted.replace(/(\/[\w\/.-]+|\.img|\.apk|\.zip|\.py)/g, 
    '<span class="token-path">$1</span>');
  
  // Highlight comments
  highlighted = highlighted.replace(/(#.*)$/gm, 
    '<span class="token-comment">$1</span>');
  
  // Highlight numbers and ports
  highlighted = highlighted.replace(/\b(\d+)\b/g, 
    '<span class="token-num">$1</span>');
  
  return highlighted.replace(/\n/g, '<br>');
}

export default function CommandCard({ command, className = '', isSelected, onToggleSelect, onEdit }: CommandCardProps) {
  const [copied, setCopied] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  const variables = useMemo(() => extractVariables(command.command), [command.command]);
  const RiskIcon = riskIcons[command.risk];

  const adaptedCommand = useMemo(() => {
    let cmd = command.command;
    Object.entries(variableValues).forEach(([key, value]) => {
      if (value) {
        const pattern = new RegExp(`\\[${key}\\]|\\$\\{?${key}\\}?`, 'g');
        cmd = cmd.replace(pattern, value);
      }
    });
    return cmd;
  }, [command.command, variableValues]);

  const handleCopy = async (useAdapted = false) => {
    try {
      const textToCopy = useAdapted && isAdapting ? adaptedCommand : command.command;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVariableChange = (varName: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [varName]: value }));
  };

  return (
    <div className={`snippet-card ${className} ${isSelected ? 'ring-2 ring-[var(--y)]' : ''}`}>
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-[var(--y)] border-[var(--y)] text-black' 
                : 'border-[var(--b2)] hover:border-[var(--y)]'
            }`}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="snippet-header">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-4 h-4 text-lime-400 flex-shrink-0" />
          <h3 className="font-display font-bold text-white truncate">{command.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <RiskIcon className={`w-4 h-4 ${riskColors[command.risk]}`} />
          <span className={`badge ${typeColors[command.type]}`}>
            {command.type}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(command)}
              className="p-1.5 rounded hover:bg-[var(--s3)] transition-colors"
              title="Edit command"
            >
              <Pencil className="w-3.5 h-3.5 text-[var(--t3)] hover:text-[var(--y)]" />
            </button>
          )}
        </div>
      </div>
      
      <div className="snippet-body">
        <pre 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: highlightSyntax(command.command, variableValues) 
          }}
        />
      </div>

      {/* Copy & Adapt - Variable Inputs */}
      {variables.length > 0 && (
        <div className="px-4 py-3 border-t border-[var(--b1)] bg-[var(--s2)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[var(--t3)]">Copy & Adapt Variables</span>
            <button
              onClick={() => setIsAdapting(!isAdapting)}
              className="text-xs flex items-center gap-1 text-[var(--y)] hover:opacity-80 transition-opacity"
            >
              {isAdapting ? <X className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              {isAdapting ? 'Close' : 'Adapt'}
            </button>
          </div>
          
          {isAdapting && (
            <div className="space-y-2 mb-3">
              {variables.map(varName => (
                <div key={varName} className="flex items-center gap-2">
                  <label className="text-xs font-mono text-[var(--t2)] min-w-[80px]">
                    {varName}:
                  </label>
                  <input
                    type="text"
                    value={variableValues[varName] || ''}
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    placeholder={`Enter ${varName.toLowerCase()}...`}
                    className="flex-1 px-2 py-1 text-xs bg-[var(--s3)] border border-[var(--b2)] rounded text-[var(--t1)] focus:border-[var(--y)] outline-none"
                  />
                </div>
              ))}
              <button
                onClick={() => handleCopy(true)}
                className="w-full py-2 mt-2 text-xs font-mono bg-[var(--yd)] text-[var(--y)] rounded hover:bg-[var(--yb)] transition-colors"
              >
                Copy Adapted Command
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="snippet-footer">
        <div className="snippet-badges">
          <span className={`badge ${categoryColors[command.category]}`}>
            {command.category}
          </span>
          {command.chipset.map(chip => (
            <span key={chip} className={`badge ${chipsetColors[chip]}`}>
              {chip}
            </span>
          ))}
        </div>
        
        <button
          onClick={() => handleCopy(false)}
          className={`btn-copy ${copied ? 'copied' : ''} transition-all duration-200`}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      
      {command.description && (
        <div className="snippet-description">
          <p className="text-sm text-[var(--t2)] leading-relaxed">
            {command.description}
          </p>
        </div>
      )}

      {command.notes && (
        <div className="snippet-notes">
          <p className="text-sm text-[var(--t2)] leading-relaxed">
            <span className="text-orange-400 font-mono text-xs">NOTE:</span> {command.notes}
          </p>
        </div>
      )}

      {command.tags.length > 0 && (
        <div className="snippet-tags">
          {command.tags.map(tag => (
            <span key={tag} className="text-xs font-mono text-[var(--t3)] bg-[var(--s3)] px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
