import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { comparePacks } from '@/api/compare';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CompareTable from '@/components/compare/CompareTable';

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['compare', ids],
    queryFn: () => comparePacks(ids),
    enabled: ids.length >= 2,
  });

  function handleRemovePack(packId: number) {
    const remaining = ids.filter((id) => id !== packId);
    if (remaining.length < 2) {
      navigate('/');
    } else {
      setSearchParams({ ids: remaining.join(',') });
    }
  }

  if (ids.length < 2) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Select at least 2 packs to compare.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Failed to load comparison data.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          Compare Packs ({data.packs.length})
        </h1>
      </div>

      <CompareTable data={data} onRemovePack={handleRemovePack} />
    </div>
  );
}
