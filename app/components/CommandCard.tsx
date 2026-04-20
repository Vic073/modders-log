'use client';

import { useState } from 'react';
import { Copy, Terminal, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Command, CommandType, RiskLevel } from '../types/commands';

interface CommandCardProps {
  command: Command;
  className?: string;
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

function highlightSyntax(command: string): string {
  const lines = command.split('\n');
  return lines.map(line => {
    let highlighted = line;
    
    // Highlight commands (adb, fastboot, python3, etc.)
    highlighted = highlighted.replace(/\b(adb|fastboot|python|python3|shell|dd|lsusb|reboot|install|flash|boot|getprop|wipe|sideload)\b/g, 
      '<span class="token-cmd">$1</span>');
    
    // Highlight flags and options
    highlighted = highlighted.replace(/(--[\w-]+|-[a-zA-Z])/g, 
      '<span class="token-flag">$1</span>');
    
    // Highlight strings in quotes
    highlighted = highlighted.replace(/"([^"]*)"/g, 
      '<span class="token-string">"$1"</span>');
    
    // Highlight variables
    highlighted = highlighted.replace(/\$\{?[\w-]+\}?/g, 
      '<span class="token-var">$&</span>');
    
    // Highlight file paths
    highlighted = highlighted.replace(/(\/[\w\/.-]+|\.img|\.apk|\.zip|\.py)/g, 
      '<span class="token-path">$1</span>');
    
    // Highlight comments
    highlighted = highlighted.replace(/(#.*)$/g, 
      '<span class="token-comment">$1</span>');
    
    // Highlight numbers and ports
    highlighted = highlighted.replace(/\b(\d+)\b/g, 
      '<span class="token-num">$1</span>');
    
    return highlighted;
  }).join('\n');
}

export default function CommandCard({ command, className = '' }: CommandCardProps) {
  const [copied, setCopied] = useState(false);
  const RiskIcon = riskIcons[command.risk];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`snippet-card ${className}`}>
      <div className="snippet-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-lime-400" />
          <h3 className="font-display font-bold text-white">{command.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <RiskIcon className={`w-4 h-4 ${riskColors[command.risk]}`} />
          <span className={`badge ${typeColors[command.type]}`}>
            {command.type}
          </span>
        </div>
      </div>
      
      <div className="snippet-body">
        <pre 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightSyntax(command.command) }}
        />
      </div>
      
      <div className="snippet-footer">
        <div className="flex items-center gap-2">
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
          onClick={handleCopy}
          className={`btn-copy ${copied ? 'copied' : ''} transition-all duration-200`}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      
      {command.description && (
        <div className="p-4 border-t border-[var(--b1)]">
          <p className="text-sm text-[var(--t2)] leading-relaxed">
            {command.description}
          </p>
        </div>
      )}
      
      {command.notes && (
        <div className="p-4 border-t border-[var(--b1)] bg-[var(--s2)]">
          <p className="text-sm text-[var(--t2)] leading-relaxed">
            <span className="text-orange-400 font-mono">NOTE:</span> {command.notes}
          </p>
        </div>
      )}
      
      {command.tags.length > 0 && (
        <div className="p-4 border-t border-[var(--b1)]">
          <div className="flex flex-wrap gap-1">
            {command.tags.map(tag => (
              <span key={tag} className="text-xs font-mono text-[var(--t3)] bg-[var(--s3)] px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
