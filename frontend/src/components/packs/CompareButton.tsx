import { useNavigate } from 'react-router-dom';
import { GitCompareArrows, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompareButtonProps {
  selectedIds: Set<number>;
  onClear: () => void;
}

export default function CompareButton({ selectedIds, onClear }: CompareButtonProps) {
  const navigate = useNavigate();
  const count = selectedIds.size;

  if (count < 2) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2.5 shadow-lg shadow-black/40">
      <Button
        onClick={() => navigate(`/compare?ids=${[...selectedIds].join(',')}`)}
        className="gap-2"
      >
        <GitCompareArrows className="h-4 w-4" />
        Compare ({count})
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
