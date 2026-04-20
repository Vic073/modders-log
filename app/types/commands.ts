export type CommandCategory = 
  | 'bootloader'
  | 'recovery' 
  | 'flashing'
  | 'backup'
  | 'debugging'
  | 'partition'
  | 'sideload'
  | 'scripting';

export type Chipset = 
  | 'qualcomm'
  | 'unisoc'
  | 'mediatek'
  | 'samsung-exynos'
  | 'generic';

export type CommandType = 
  | 'adb'
  | 'fastboot'
  | 'python'
  | 'shell'
  | 'edl';

export type RiskLevel = 
  | 'safe'
  | 'caution'
  | 'destructive';

export interface Command {
  id: string;
  title: string;
  command: string;
  description: string;
  category: CommandCategory;
  chipset: Chipset[];
  type: CommandType;
  risk: RiskLevel;
  tags: string[];
  notes?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface CommandFilters {
  category?: CommandCategory;
  chipset?: Chipset;
  type?: CommandType;
  risk?: RiskLevel;
  search?: string;
}

export interface QuickLogEntry {
  id: string;
  timestamp: string;
  content: string;
}
