import React from 'react';

export interface ProductChip {
  _id?: string;
  code?: string;
  label: string;
  color?: string;
  icon?: string | null;
  priority?: number;
}

const COLOR_MAP: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function chipColorCls(color: string | undefined): string {
  return COLOR_MAP[color || 'indigo'] || COLOR_MAP.indigo;
}

interface ChipProps {
  chip: ProductChip;
  size?: 'sm' | 'md';
}

export default function Chip({ chip, size = 'sm' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'} rounded-full font-bold uppercase tracking-widest border shadow-sm ${chipColorCls(chip.color)}`}
    >
      {chip.icon && <span className="not-italic">{chip.icon}</span>}
      <span>{chip.label}</span>
    </span>
  );
}

interface ChipListProps {
  chips: ProductChip[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  align?: 'start' | 'end';
}

export function ChipList({ chips, max = 3, size = 'sm', className = '', align = 'start' }: ChipListProps) {
  if (!chips || chips.length === 0) return null;
  const visible = chips.slice(0, max);
  const overflow = chips.length - visible.length;
  return (
    <div className={`flex flex-wrap gap-1 ${align === 'end' ? 'justify-end' : ''} ${className}`}>
      {visible.map((c) => (
        <Chip key={c._id || c.code || c.label} chip={c} size={size} />
      ))}
      {overflow > 0 && (
        <span className={`inline-flex items-center ${size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'} rounded-full font-bold border bg-white/80 text-slate-600 border-slate-200 backdrop-blur`}>
          +{overflow}
        </span>
      )}
    </div>
  );
}
