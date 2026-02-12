import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createValue, updateValue } from '@/api/values';
import { SOURCE_TYPES, SOURCE_DISPLAY, type SourceType } from '@/types';
import type { FieldValue } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packId: number;
  fieldId: number;
  fieldName: string;
  editValue?: FieldValue | null;
}

export default function AddValueDialog({
  open,
  onOpenChange,
  packId,
  fieldId,
  fieldName,
  editValue,
}: AddValueDialogProps) {
  const isEdit = !!editValue;
  const queryClient = useQueryClient();

  const [valueText, setValueText] = useState('');
  const [sourceType, setSourceType] = useState<string>('');
  const [sourceDetail, setSourceDetail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editValue) {
        setValueText(editValue.value_text ?? String(editValue.value_numeric ?? ''));
        setSourceType(editValue.source_type);
        setSourceDetail(editValue.source_detail);
      } else {
        setValueText('');
        setSourceType('');
        setSourceDetail('');
      }
      setError('');
    }
  }, [open, editValue]);

  const createMutation = useMutation({
    mutationFn: (data: { field_id: number; value_text: string; source_type: string; source_detail: string }) =>
      createValue(packId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack', packId] });
      toast.success('Value added');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to add value');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { value_text?: string; source_detail?: string }) =>
      updateValue(editValue!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack', packId] });
      toast.success('Value updated');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to update value');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!valueText.trim()) {
      setError('Value is required');
      return;
    }
    if (!isEdit && !sourceType) {
      setError('Source type is required');
      return;
    }
    if (!sourceDetail.trim()) {
      setError('Source detail is required');
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        value_text: valueText.trim(),
        source_detail: sourceDetail.trim(),
      });
    } else {
      createMutation.mutate({
        field_id: fieldId,
        value_text: valueText.trim(),
        source_type: sourceType,
        source_detail: sourceDetail.trim(),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Value' : 'Add Value'}</DialogTitle>
          <DialogDescription>{fieldName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="value-text">Value *</Label>
            <Input
              id="value-text"
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder='e.g. "196", "NMC 811", "42.5"'
            />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Source Type *</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source type..." />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {SOURCE_DISPLAY[st as SourceType].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="source-detail">Source Detail *</Label>
            <Textarea
              id="source-detail"
              value={sourceDetail}
              onChange={(e) => setSourceDetail(e.target.value)}
              placeholder="e.g. A2Mac1 report #4521, measured weight"
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Value'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
