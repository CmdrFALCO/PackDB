import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Pack } from '@/types';
import { listPacks } from '@/api/packs';
import type { PackListParams } from '@/api/packs';
import { Button } from '@/components/ui/button';
import FilterBar from '@/components/packs/FilterBar';
import PackCardGrid from '@/components/packs/PackCardGrid';
import PackFormDialog from '@/components/packs/PackFormDialog';
import DeletePackDialog from '@/components/packs/DeletePackDialog';
import CompareButton from '@/components/packs/CompareButton';

const PAGE_SIZE = 20;

const DEFAULT_FILTERS: PackListParams = {
  page: 1,
  page_size: PAGE_SIZE,
};

export default function BrowserPage() {
  // Filter state
  const [filters, setFilters] = useState<PackListParams>(DEFAULT_FILTERS);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editPack, setEditPack] = useState<Pack | null>(null);
  const [deletePack, setDeletePack] = useState<Pack | null>(null);

  // Compare selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Fetch packs
  const { data, isLoading } = useQuery({
    queryKey: ['packs', filters],
    queryFn: () => listPacks(filters),
  });

  const packs = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Filter handlers
  const handleFilterChange = useCallback((partial: Partial<PackListParams>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasFilters = !!(
    filters.search ||
    filters.market ||
    filters.fuel_type ||
    filters.vehicle_class ||
    filters.drivetrain
  );

  // Compare handlers
  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) {
          toast.info('Maximum 3 packs for comparison');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Pagination
  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Battery Packs</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pack
        </Button>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Pack grid */}
      <PackCardGrid
        packs={packs}
        total={total}
        isLoading={isLoading}
        hasFilters={hasFilters}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onEdit={setEditPack}
        onDelete={setDeletePack}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}–{endItem} of {total} packs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handleFilterChange({ page: currentPage - 1 })}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handleFilterChange({ page: currentPage + 1 })}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Compare floating button */}
      <CompareButton selectedIds={selectedIds} onClear={handleClearSelection} />

      {/* Add pack dialog */}
      <PackFormDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Edit pack dialog */}
      <PackFormDialog
        open={!!editPack}
        onOpenChange={(open) => { if (!open) setEditPack(null); }}
        pack={editPack}
      />

      {/* Delete confirmation dialog */}
      <DeletePackDialog
        open={!!deletePack}
        onOpenChange={(open) => { if (!open) setDeletePack(null); }}
        pack={deletePack}
      />
    </div>
  );
}
