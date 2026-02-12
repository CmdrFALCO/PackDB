import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { SOURCE_TYPES } from '@/types';
import { getSourcePriority, updateSourcePriority } from '@/api/sourcePriority';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SourceBadge from '@/components/detail/SourceBadge';

const DEFAULT_ORDER = [...SOURCE_TYPES] as string[];

export default function SourcePriorityEditor() {
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: priority, isLoading } = useQuery({
    queryKey: ['sourcePriority'],
    queryFn: getSourcePriority,
  });

  useEffect(() => {
    if (priority) {
      setOrder(priority.priority_order);
      setHasChanges(false);
    }
  }, [priority]);

  const saveMutation = useMutation({
    mutationFn: () => updateSourcePriority({ priority_order: order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sourcePriority'] });
      queryClient.invalidateQueries({ queryKey: ['pack'] });
      queryClient.invalidateQueries({ queryKey: ['compare'] });
      toast.success('Source priority saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save source priority');
    },
  });

  function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrder(next);
    setHasChanges(true);
  }

  function moveDown(index: number) {
    if (index >= order.length - 1) return;
    const next = [...order];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrder(next);
    setHasChanges(true);
  }

  function resetToDefault() {
    setOrder(DEFAULT_ORDER);
    setHasChanges(true);
  }

  if (isLoading) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Source Priority</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure which data sources are prioritized when multiple values exist for a field. Higher-ranked sources are displayed first.
          </p>
        </div>

        <div className="space-y-1">
          {order.map((sourceType, index) => (
            <div
              key={sourceType}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
            >
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <SourceBadge sourceType={sourceType} />
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={index === order.length - 1}
                  onClick={() => moveDown(index)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={resetToDefault}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Default
          </Button>
          <Button
            size="sm"
            disabled={!hasChanges || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
