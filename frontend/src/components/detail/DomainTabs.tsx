import { useState } from 'react';
import type { DomainWithResolvedFields } from '@/types';
import { Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FieldRow from './FieldRow';
import AddFieldDialog from './AddFieldDialog';

interface DomainTabsProps {
  domains: DomainWithResolvedFields[];
  packId: number;
}

export default function DomainTabs({ domains, packId }: DomainTabsProps) {
  const [addFieldDomain, setAddFieldDomain] = useState<DomainWithResolvedFields | null>(null);

  if (domains.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No domains or fields available for this pack.
      </p>
    );
  }

  const sorted = [...domains].sort((a, b) => a.sort_order - b.sort_order);
  const defaultTab = String(sorted[0].domain_id);

  return (
    <>
      <Tabs defaultValue={defaultTab}>
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {sorted.map((d) => (
            <TabsTrigger key={d.domain_id} value={String(d.domain_id)}>
              {d.domain_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sorted.map((domain) => (
          <TabsContent key={domain.domain_id} value={String(domain.domain_id)}>
            <div className="mt-2 rounded-md border border-border">
              {domain.fields.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No fields in this domain yet.
                </p>
              ) : (
                domain.fields.map((field) => (
                  <FieldRow key={field.field_id} field={field} packId={packId} />
                ))
              )}
            </div>

            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setAddFieldDomain(domain)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Field
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {addFieldDomain && (
        <AddFieldDialog
          open={!!addFieldDomain}
          onOpenChange={(open) => { if (!open) setAddFieldDomain(null); }}
          domainId={addFieldDomain.domain_id}
          domainName={addFieldDomain.domain_name}
          packId={packId}
        />
      )}
    </>
  );
}
