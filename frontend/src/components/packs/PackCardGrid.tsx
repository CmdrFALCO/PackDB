import type { Pack } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import PackCard from './PackCard';

interface PackCardGridProps {
  packs: Pack[];
  total: number;
  isLoading: boolean;
  hasFilters: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onEdit: (pack: Pack) => void;
  onDelete: (pack: Pack) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-4 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    </div>
  );
}

export default function PackCardGrid({
  packs,
  total,
  isLoading,
  hasFilters,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: PackCardGridProps) {
  if (isLoading) {
    return (
      <div>
        <div className="mb-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">
          {hasFilters
            ? 'No packs match your filters.'
            : 'No battery packs yet. Add your first pack to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} {total === 1 ? 'pack' : 'packs'}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {packs.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            isSelected={selectedIds.has(pack.id)}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
