import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Pack } from '@/types';
import { createPack, updatePack } from '@/api/packs';
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

const MARKET_OPTIONS = ['EU', 'China', 'USA', 'Global'];
const FUEL_TYPE_OPTIONS = ['BEV', 'BEV+RE', 'PHEV'];
const VEHICLE_CLASS_OPTIONS = ['Small', 'Mid', 'Large', 'SUV'];
const DRIVETRAIN_OPTIONS = ['AWD', 'RWD', 'FWD'];

const NONE_VALUE = '__none__';

interface PackFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pack?: Pack | null; // null/undefined = add mode, Pack = edit mode
}

export default function PackFormDialog({ open, onOpenChange, pack }: PackFormDialogProps) {
  const isEdit = !!pack;
  const queryClient = useQueryClient();

  const [oem, setOem] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [variant, setVariant] = useState('');
  const [market, setMarket] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [vehicleClass, setVehicleClass] = useState('');
  const [drivetrain, setDrivetrain] = useState('');
  const [platform, setPlatform] = useState('');
  const [error, setError] = useState('');

  // Reset form when dialog opens or pack changes
  useEffect(() => {
    if (open) {
      if (pack) {
        setOem(pack.oem);
        setModel(pack.model);
        setYear(pack.year);
        setVariant(pack.variant || '');
        setMarket(pack.market || '');
        setFuelType(pack.fuel_type || '');
        setVehicleClass(pack.vehicle_class || '');
        setDrivetrain(pack.drivetrain || '');
        setPlatform(pack.platform || '');
      } else {
        setOem('');
        setModel('');
        setYear(new Date().getFullYear());
        setVariant('');
        setMarket('');
        setFuelType('');
        setVehicleClass('');
        setDrivetrain('');
        setPlatform('');
      }
      setError('');
    }
  }, [open, pack]);

  const createMutation = useMutation({
    mutationFn: createPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack created successfully');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to create pack');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updatePack>[1] }) =>
      updatePack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack updated successfully');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to update pack');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!oem.trim() || !model.trim()) {
      setError('OEM and Model are required');
      return;
    }

    const data = {
      oem: oem.trim(),
      model: model.trim(),
      year,
      variant: variant.trim() || undefined,
      market: market || undefined,
      fuel_type: fuelType || undefined,
      vehicle_class: vehicleClass || undefined,
      drivetrain: drivetrain || undefined,
      platform: platform.trim() || undefined,
    };

    if (isEdit && pack) {
      updateMutation.mutate({ id: pack.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pack' : 'Add Pack'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update pack details below.' : 'Enter the details for the new battery pack.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OEM */}
          <div className="space-y-1.5">
            <Label htmlFor="oem">OEM / Brand *</Label>
            <Input
              id="oem"
              value={oem}
              onChange={(e) => setOem(e.target.value)}
              placeholder="e.g. BMW, Tesla, BYD"
            />
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. iX3, Model Y"
            />
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              min={2000}
              max={2100}
            />
          </div>

          {/* Variant */}
          <div className="space-y-1.5">
            <Label htmlFor="variant">Variant</Label>
            <Input
              id="variant"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="e.g. Long Range, Performance"
            />
          </div>

          {/* Two-column layout for selects */}
          <div className="grid grid-cols-2 gap-3">
            {/* Market */}
            <div className="space-y-1.5">
              <Label>Market</Label>
              <Select value={market || NONE_VALUE} onValueChange={(v) => setMarket(v === NONE_VALUE ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {MARKET_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-1.5">
              <Label>Fuel Type</Label>
              <Select value={fuelType || NONE_VALUE} onValueChange={(v) => setFuelType(v === NONE_VALUE ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {FUEL_TYPE_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Class */}
            <div className="space-y-1.5">
              <Label>Vehicle Class</Label>
              <Select value={vehicleClass || NONE_VALUE} onValueChange={(v) => setVehicleClass(v === NONE_VALUE ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {VEHICLE_CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drivetrain */}
            <div className="space-y-1.5">
              <Label>Drivetrain</Label>
              <Select value={drivetrain || NONE_VALUE} onValueChange={(v) => setDrivetrain(v === NONE_VALUE ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {DRIVETRAIN_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. MEB, CLAR, e-GMP"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Pack'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
