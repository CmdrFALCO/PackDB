import { SOURCE_DISPLAY, type SourceType } from '@/types';

const SOURCE_COLORS: Record<string, string> = {
  teardown: 'var(--color-source-teardown)',
  a2mac1: 'var(--color-source-a2mac1)',
  oem: 'var(--color-source-oem)',
  regulatory: 'var(--color-source-regulatory)',
  cad: 'var(--color-source-cad)',
  calculated: 'var(--color-source-calculated)',
  press: 'var(--color-source-press)',
  user: 'var(--color-source-user)',
};

interface SourceBadgeProps {
  sourceType: string;
  className?: string;
}

export default function SourceBadge({ sourceType, className = '' }: SourceBadgeProps) {
  const display = SOURCE_DISPLAY[sourceType as SourceType];
  const label = display?.label ?? sourceType;
  const bgColor = SOURCE_COLORS[sourceType] ?? 'var(--color-source-user)';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {label}
    </span>
  );
}
