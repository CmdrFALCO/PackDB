import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type { ResolvedFieldValue, FieldValue } from '@/types';
import { deleteValue } from '@/api/values';
import { Button } from '@/components/ui/button';
import SourceBadge from './SourceBadge';
import AddValueDialog from './AddValueDialog';
import CommentsSection from './CommentsSection';

interface FieldRowProps {
  field: ResolvedFieldValue;
  packId: number;
}

export default function FieldRow({ field, packId }: FieldRowProps) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [commentValueId, setCommentValueId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editValue, setEditValue] = useState<FieldValue | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack', packId] });
      toast.success('Value deleted');
    },
    onError: () => {
      toast.error('Failed to delete value');
    },
  });

  const resolved = field.resolved_value;
  const displayValue = resolved
    ? (resolved.value_text ?? (resolved.value_numeric != null ? String(resolved.value_numeric) : '—'))
    : '—';

  const fieldLabel = field.unit
    ? `${field.display_name} (${field.unit})`
    : field.display_name;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="min-w-[200px] text-sm font-medium text-foreground">
          {fieldLabel}
        </span>

        <span className={`text-sm ${resolved ? 'text-foreground' : 'text-muted-foreground'}`}>
          {displayValue}
        </span>

        {resolved && <SourceBadge sourceType={resolved.source_type} />}

        {field.alternative_count > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-primary hover:bg-accent"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            +{field.alternative_count} source{field.alternative_count !== 1 ? 's' : ''}
          </button>
        )}

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded multi-source view */}
      {expanded && field.all_values.length > 0 && (
        <div className="ml-6 border-l-2 border-border pb-2 pl-4">
          {field.all_values.map((val) => (
            <div key={val.id}>
              <div className="flex items-center gap-3 py-1.5 text-sm">
                <span className="min-w-[100px] text-foreground">
                  {val.value_text ?? (val.value_numeric != null ? String(val.value_numeric) : '—')}
                </span>
                <SourceBadge sourceType={val.source_type} />
                <span className="max-w-[250px] truncate text-xs text-muted-foreground" title={val.source_detail}>
                  {val.source_detail}
                </span>
                <span className="text-xs text-muted-foreground">
                  {val.contributor_name ?? 'Unknown'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(val.created_at)}
                </span>

                {/* Comment icon */}
                <button
                  onClick={() =>
                    setCommentValueId(commentValueId === val.id ? null : val.id)
                  }
                  className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="h-3 w-3" />
                  {val.comment_count > 0 && <span>{val.comment_count}</span>}
                </button>

                {/* Edit / Delete */}
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditValue(val)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(val.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Inline comments */}
              {commentValueId === val.id && (
                <div className="ml-4 mb-2">
                  <CommentsSection valueId={val.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add value dialog */}
      <AddValueDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        packId={packId}
        fieldId={field.field_id}
        fieldName={fieldLabel}
      />

      {/* Edit value dialog */}
      <AddValueDialog
        open={!!editValue}
        onOpenChange={(open) => { if (!open) setEditValue(null); }}
        packId={packId}
        fieldId={field.field_id}
        fieldName={fieldLabel}
        editValue={editValue}
      />
    </div>
  );
}
