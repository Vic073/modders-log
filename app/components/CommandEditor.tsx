'use client';

import { useState, useEffect } from 'react';
import { X, Save, Terminal, AlertTriangle, Shield, Zap, Plus, Trash2 } from 'lucide-react';
import { Command, CommandType, CommandCategory, ChipsetType, RiskLevel } from '../types/commands';

interface CommandEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialCommand?: Command | null;
}

const TYPES: CommandType[] = ['adb', 'fastboot', 'python', 'shell', 'edl'];
const CATEGORIES: CommandCategory[] = ['bootloader', 'recovery', 'flashing', 'backup', 'debugging', 'partition', 'sideload', 'scripting'];
const CHIPSETS: ChipsetType[] = ['qualcomm', 'unisoc', 'mediatek', 'samsung-exynos', 'generic'];
const RISKS: { value: RiskLevel; label: string; icon: typeof Shield; color: string }[] = [
  { value: 'safe', label: 'Safe', icon: Shield, color: 'text-green-400' },
  { value: 'caution', label: 'Caution', icon: AlertTriangle, color: 'text-orange-400' },
  { value: 'destructive', label: 'Destructive', icon: Zap, color: 'text-red-400' },
];

export default function CommandEditor({ isOpen, onClose, onSave, initialCommand }: CommandEditorProps) {
  const [title, setTitle] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CommandCategory>('flashing');
  const [chipset, setChipset] = useState<ChipsetType[]>(['generic']);
  const [type, setType] = useState<CommandType>('adb');
  const [risk, setRisk] = useState<RiskLevel>('safe');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCommand) {
      setTitle(initialCommand.title);
      setCommand(initialCommand.command);
      setDescription(initialCommand.description);
      setCategory(initialCommand.category);
      setChipset(initialCommand.chipset);
      setType(initialCommand.type);
      setRisk(initialCommand.risk);
      setTags(initialCommand.tags);
      setNotes(initialCommand.notes || '');
      setSource(initialCommand.source || '');
    } else {
      resetForm();
    }
  }, [initialCommand, isOpen]);

  const resetForm = () => {
    setTitle('');
    setCommand('');
    setDescription('');
    setCategory('flashing');
    setChipset(['generic']);
    setType('adb');
    setRisk('safe');
    setTags([]);
    setNotes('');
    setSource('');
    setNewTag('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!command.trim()) newErrors.command = 'Command is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      title: title.trim(),
      command: command.trim(),
      description: description.trim(),
      category,
      chipset,
      type,
      risk,
      tags,
      notes: notes.trim() || undefined,
      source: source.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const toggleChipset = (chip: ChipsetType) => {
    if (chipset.includes(chip)) {
      if (chipset.length > 1) {
        setChipset(chipset.filter(c => c !== chip));
      }
    } else {
      setChipset([...chipset, chip]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--b1)]">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[var(--y)]" />
            <h2 className="font-display font-bold text-white">
              {initialCommand ? 'Edit Command' : 'New Command'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--s3)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--t2)]" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Command Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Flash Boot Image"
              className={`w-full px-3 py-2 bg-[var(--s3)] border rounded-lg text-[var(--t1)] focus:border-[var(--y)] outline-none transition-colors ${
                errors.title ? 'border-[var(--red)]' : 'border-[var(--b2)]'
              }`}
            />
            {errors.title && (
              <span className="text-xs text-[var(--red)] mt-1">{errors.title}</span>
            )}
          </div>

          {/* Command */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Command *
            </label>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., fastboot flash boot boot.img"
              rows={3}
              className={`w-full px-3 py-2 bg-[var(--s3)] border rounded-lg text-[var(--t1)] font-mono text-sm focus:border-[var(--y)] outline-none transition-colors resize-none ${
                errors.command ? 'border-[var(--red)]' : 'border-[var(--b2)]'
              }`}
            />
            {errors.command && (
              <span className="text-xs text-[var(--red)] mt-1">{errors.command}</span>
            )}
            <p className="text-xs text-[var(--t3)] mt-1">
              Use [VARIABLE] for values that can be adapted
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this command do?"
              className={`w-full px-3 py-2 bg-[var(--s3)] border rounded-lg text-[var(--t1)] focus:border-[var(--y)] outline-none transition-colors ${
                errors.description ? 'border-[var(--red)]' : 'border-[var(--b2)]'
              }`}
            />
            {errors.description && (
              <span className="text-xs text-[var(--red)] mt-1">{errors.description}</span>
            )}
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                      type === t
                        ? 'bg-[var(--yd)] border-[var(--y)] text-[var(--y)]'
                        : 'bg-[var(--s3)] border-[var(--b2)] text-[var(--t2)] hover:border-[var(--b3)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommandCategory)}
                className="w-full px-3 py-2 bg-[var(--s3)] border border-[var(--b2)] rounded-lg text-[var(--t1)] focus:border-[var(--y)] outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Risk Level
            </label>
            <div className="flex gap-2">
              {RISKS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setRisk(value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    risk === value
                      ? 'bg-[var(--s2)] border-[var(--b3)]'
                      : 'bg-[var(--s3)] border-[var(--b2)] hover:border-[var(--b3)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className={`text-xs ${risk === value ? 'text-[var(--t1)]' : 'text-[var(--t2)]'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chipsets */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Compatible Chipsets
            </label>
            <div className="flex flex-wrap gap-2">
              {CHIPSETS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => toggleChipset(chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    chipset.includes(chip)
                      ? 'bg-[var(--yd)] border-[var(--y)] text-[var(--y)]'
                      : 'bg-[var(--s3)] border-[var(--b2)] text-[var(--t2)] hover:border-[var(--b3)]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Tags
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--s3)] rounded-lg text-xs font-mono text-[var(--t2)]"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[var(--red)]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="flex-1 px-3 py-1.5 bg-[var(--s3)] border border-[var(--b2)] rounded-lg text-[var(--t1)] text-sm focus:border-[var(--y)] outline-none"
              />
              <button
                onClick={handleAddTag}
                className="p-2 bg-[var(--s3)] border border-[var(--b2)] rounded-lg hover:border-[var(--y)] transition-colors"
              >
                <Plus className="w-4 h-4 text-[var(--y)]" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Warnings, prerequisites, or helpful tips..."
              rows={2}
              className="w-full px-3 py-2 bg-[var(--s3)] border border-[var(--b2)] rounded-lg text-[var(--t1)] text-sm focus:border-[var(--y)] outline-none resize-none"
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2 block">
              Source (Optional)
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., xda-developers, official docs"
              className="w-full px-3 py-2 bg-[var(--s3)] border border-[var(--b2)] rounded-lg text-[var(--t1)] focus:border-[var(--y)] outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--b1)]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--s3)] border border-[var(--b2)] rounded-lg text-[var(--t2)] hover:text-[var(--t1)] hover:border-[var(--b3)] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--y)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Command
          </button>
        </div>
      </div>
    </div>
  );
}
