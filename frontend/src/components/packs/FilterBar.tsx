import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PackListParams } from '@/api/packs';

const MARKET_OPTIONS = ['EU', 'China', 'USA', 'Global'];
const FUEL_TYPE_OPTIONS = ['BEV', 'BEV+RE', 'PHEV'];
const VEHICLE_CLASS_OPTIONS = ['Small', 'Mid', 'Large', 'SUV'];
const DRIVETRAIN_OPTIONS = ['AWD', 'RWD', 'FWD'];

interface FilterBarProps {
  filters: PackListParams;
  onFilterChange: (filters: Partial<PackListParams>) => void;
  onClear: () => void;
}

// Sentinel value for "All" option - Radix Select doesn't support empty string values
const ALL_VALUE = '__all__';

export default function FilterBar({ filters, onFilterChange, onClear }: FilterBarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.market ||
    filters.fuel_type ||
    filters.vehicle_class ||
    filters.drivetrain;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search OEM, model, platform..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value || undefined, page: 1 })}
          className="pl-9"
        />
      </div>

      {/* Market filter */}
      <Select
        value={filters.market || ALL_VALUE}
        onValueChange={(v) => onFilterChange({ market: v === ALL_VALUE ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Market" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Markets</SelectItem>
          {MARKET_OPTIONS.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Fuel Type filter */}
      <Select
        value={filters.fuel_type || ALL_VALUE}
        onValueChange={(v) => onFilterChange({ fuel_type: v === ALL_VALUE ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Fuel Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Fuel Types</SelectItem>
          {FUEL_TYPE_OPTIONS.map((f) => (
            <SelectItem key={f} value={f}>{f}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Vehicle Class filter */}
      <Select
        value={filters.vehicle_class || ALL_VALUE}
        onValueChange={(v) => onFilterChange({ vehicle_class: v === ALL_VALUE ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Classes</SelectItem>
          {VEHICLE_CLASS_OPTIONS.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Drivetrain filter */}
      <Select
        value={filters.drivetrain || ALL_VALUE}
        onValueChange={(v) => onFilterChange({ drivetrain: v === ALL_VALUE ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Drivetrain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Drivetrains</SelectItem>
          {DRIVETRAIN_OPTIONS.map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
