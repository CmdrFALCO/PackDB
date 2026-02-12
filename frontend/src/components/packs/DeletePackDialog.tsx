import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Pack } from '@/types';
import { deletePack } from '@/api/packs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeletePackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pack: Pack | null;
}

export default function DeletePackDialog({ open, onOpenChange, pack }: DeletePackDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack deleted');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to delete pack');
    },
  });

  if (!pack) return null;

  const displayName = [pack.oem, pack.model, pack.variant].filter(Boolean).join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Pack</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-foreground">{displayName}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(pack.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
