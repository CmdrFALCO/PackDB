import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createField } from '@/api/domains';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainId: number;
  domainName: string;
  packId: number;
}

export default function AddFieldDialog({
  open,
  onOpenChange,
  domainId,
  domainName,
  packId,
}: AddFieldDialogProps) {
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [unit, setUnit] = useState('');
  const [dataType, setDataType] = useState('text');
  const [selectOptions, setSelectOptions] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDisplayName('');
      setUnit('');
      setDataType('text');
      setSelectOptions('');
      setError('');
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof createField>[1]) => createField(domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack', packId] });
      toast.success('Field added');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to add field');
    },
  });

  function toSnakeCase(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    const name = toSnakeCase(displayName);
    if (!name) {
      setError('Display name must contain at least one letter or number');
      return;
    }

    const data: Parameters<typeof createField>[1] = {
      name,
      display_name: displayName.trim(),
      data_type: dataType,
    };

    if (unit.trim()) {
      data.unit = unit.trim();
    }

    if (dataType === 'select' && selectOptions.trim()) {
      data.select_options = selectOptions
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    }

    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
          <DialogDescription>{domainName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display Name *</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Cell Energy Density"
            />
            {displayName.trim() && (
              <p className="text-xs text-muted-foreground">
                Internal name: <code>{toSnakeCase(displayName)}</code>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Wh/kg, mm, V"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Data Type</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dataType === 'select' && (
            <div className="space-y-1.5">
              <Label htmlFor="select-options">Select Options</Label>
              <Input
                id="select-options"
                value={selectOptions}
                onChange={(e) => setSelectOptions(e.target.value)}
                placeholder="e.g. NMC 811, NMC 622, LFP, NCA"
              />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
