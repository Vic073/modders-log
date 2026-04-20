'use client';

import { CommandCategory, Chipset, CommandType, RiskLevel } from '../types/commands';

interface FilterPillsProps {
  selectedCategory?: CommandCategory;
  selectedChipset?: Chipset;
  selectedType?: CommandType;
  selectedRisk?: RiskLevel;
  onCategoryChange: (category?: CommandCategory) => void;
  onChipsetChange: (chipset?: Chipset) => void;
  onTypeChange: (type?: CommandType) => void;
  onRiskChange: (risk?: RiskLevel) => void;
  className?: string;
}

const categories: CommandCategory[] = [
  'bootloader', 'recovery', 'flashing', 'backup', 
  'debugging', 'partition', 'sideload', 'scripting'
];

const chipsets: Chipset[] = [
  'qualcomm', 'unisoc', 'mediatek', 'samsung-exynos', 'generic'
];

const types: CommandType[] = [
  'adb', 'fastboot', 'python', 'shell', 'edl'
];

const risks: RiskLevel[] = [
  'safe', 'caution', 'destructive'
];

const categoryColors = {
  bootloader: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  recovery: 'bg-green-500/10 text-green-400 border-green-500/20',
  flashing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  backup: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  debugging: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  partition: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  sideload: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  scripting: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const chipsetColors = {
  qualcomm: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  unisoc: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  mediatek: 'bg-green-500/10 text-green-400 border-green-500/20',
  'samsung-exynos': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  generic: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const typeColors = {
  adb: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  fastboot: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  python: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  shell: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  edl: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const riskColors = {
  safe: 'bg-green-500/10 text-green-400 border-green-500/20',
  caution: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  destructive: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function FilterPills({
  selectedCategory,
  selectedChipset,
  selectedType,
  selectedRisk,
  onCategoryChange,
  onChipsetChange,
  onTypeChange,
  onRiskChange,
  className = ""
}: FilterPillsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2">
          Category
        </h4>
        <div className="filter-pills">
          <button
            className={`pill ${!selectedCategory ? 'active' : ''}`}
            onClick={() => onCategoryChange(undefined)}
          >
            all
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Chipset Filter */}
      <div>
        <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2">
          Chipset
        </h4>
        <div className="filter-pills">
          <button
            className={`pill ${!selectedChipset ? 'active' : ''}`}
            onClick={() => onChipsetChange(undefined)}
          >
            all
          </button>
          {chipsets.map(chipset => (
            <button
              key={chipset}
              className={`pill ${selectedChipset === chipset ? 'active' : ''}`}
              onClick={() => onChipsetChange(chipset)}
            >
              {chipset}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2">
          Type
        </h4>
        <div className="filter-pills">
          <button
            className={`pill ${!selectedType ? 'active' : ''}`}
            onClick={() => onTypeChange(undefined)}
          >
            all
          </button>
          {types.map(type => (
            <button
              key={type}
              className={`pill ${selectedType === type ? 'active' : ''}`}
              onClick={() => onTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Filter */}
      <div>
        <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2">
          Risk Level
        </h4>
        <div className="filter-pills">
          <button
            className={`pill ${!selectedRisk ? 'active' : ''}`}
            onClick={() => onRiskChange(undefined)}
          >
            all
          </button>
          {risks.map(risk => (
            <button
              key={risk}
              className={`pill ${selectedRisk === risk ? 'active' : ''}`}
              onClick={() => onRiskChange(risk)}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
