import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getPack } from '@/api/packs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DomainTabs from '@/components/detail/DomainTabs';

export default function PackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const packId = Number(id);

  const { data: pack, isLoading, isError } = useQuery({
    queryKey: ['pack', packId],
    queryFn: () => getPack(packId),
    enabled: !!id && !isNaN(packId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !pack) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Pack not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </div>
    );
  }

  const displayName = pack.variant
    ? `${pack.model} — ${pack.variant}`
    : pack.model;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Button>

      {/* Pack header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{pack.oem}</h1>
        <p className="text-lg text-muted-foreground">{displayName}</p>
        <p className="text-sm text-muted-foreground">{pack.year}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {pack.market && (
            <Badge variant="secondary">{pack.market}</Badge>
          )}
          {pack.fuel_type && (
            <Badge variant="outline">{pack.fuel_type}</Badge>
          )}
          {pack.vehicle_class && (
            <Badge variant="outline">{pack.vehicle_class}</Badge>
          )}
          {pack.drivetrain && (
            <Badge variant="outline">{pack.drivetrain}</Badge>
          )}
          {pack.platform && (
            <Badge variant="secondary" className="text-xs">
              {pack.platform}
            </Badge>
          )}
        </div>
      </div>

      {/* Domain tabs with field rows */}
      <DomainTabs domains={pack.domains} packId={pack.id} />
    </div>
  );
}
