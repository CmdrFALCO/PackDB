import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Pack } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PackCardProps {
  pack: Pack;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (pack: Pack) => void;
  onDelete: (pack: Pack) => void;
}

export default function PackCard({
  pack,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: PackCardProps) {
  const navigate = useNavigate();

  const displayName = pack.variant
    ? `${pack.model} — ${pack.variant}`
    : pack.model;

  return (
    <Card
      className="group relative cursor-pointer border-surface-border bg-surface py-0 transition-colors hover:border-[#2d9cdb]/40 hover:bg-surface-hover data-[selected=true]:border-[#2d9cdb]/60"
      data-selected={isSelected}
      onClick={() => navigate(`/packs/${pack.id}`)}
    >
      {/* Checkbox overlay */}
      <div
        className={`absolute top-3 left-3 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(pack.id)}
        />
      </div>

      {/* 3-dot menu */}
      <div
        className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(pack)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(pack)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="px-4 py-4">
        <div className="space-y-2">
          <div>
            <p className="text-base font-bold text-foreground">{pack.oem}</p>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>

          <p className="text-sm text-muted-foreground">{pack.year}</p>

          {pack.platform && (
            <p className="text-xs text-foreground-muted">{pack.platform}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {pack.market && (
              <Badge variant="secondary" className="text-[11px]">
                {pack.market}
              </Badge>
            )}
            {pack.fuel_type && (
              <Badge variant="outline" className="text-[11px]">
                {pack.fuel_type}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
