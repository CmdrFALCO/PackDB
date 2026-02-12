import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import type { CompareResponse } from '@/types';
import { Button } from '@/components/ui/button';
import SourceBadge from '@/components/detail/SourceBadge';

interface CompareTableProps {
  data: CompareResponse;
  onRemovePack: (packId: number) => void;
}

export default function CompareTable({ data, onRemovePack }: CompareTableProps) {
  const navigate = useNavigate();
  const { packs, domains } = data;

  const sorted = [...domains].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="w-[220px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Field
            </th>
            {packs.map((pack) => (
              <th key={pack.id} className="min-w-[200px] px-4 py-3 text-left">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => navigate(`/packs/${pack.id}`)}
                    className="text-left hover:text-primary"
                  >
                    <p className="font-bold text-foreground">{pack.oem}</p>
                    <p className="text-xs text-muted-foreground">
                      {pack.variant ? `${pack.model} — ${pack.variant}` : pack.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{pack.year}</p>
                  </button>
                  {packs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemovePack(pack.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sorted.map((domain) => (
            <DomainSection
              key={domain.domain_id}
              domainName={domain.domain_name}
              fields={domain.fields}
              packs={packs}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DomainSection({
  domainName,
  fields,
  packs,
}: {
  domainName: string;
  fields: CompareResponse['domains'][number]['fields'];
  packs: CompareResponse['packs'];
}) {
  if (fields.length === 0) return null;

  return (
    <>
      <tr className="border-b border-border bg-accent/50">
        <td
          colSpan={packs.length + 1}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {domainName}
        </td>
      </tr>

      {fields.map((field, idx) => {
        const label = field.unit
          ? `${field.display_name} (${field.unit})`
          : field.display_name;

        return (
          <tr
            key={field.field_id}
            className={`border-b border-border ${idx % 2 === 0 ? '' : 'bg-surface/30'}`}
          >
            <td className="px-4 py-2 text-sm font-medium text-foreground">{label}</td>
            {packs.map((pack) => {
              const val = field.values_by_pack[pack.id];
              if (!val) {
                return (
                  <td key={pack.id} className="px-4 py-2 text-sm text-muted-foreground">
                    —
                  </td>
                );
              }
              const display = val.value_text ?? (val.value_numeric != null ? String(val.value_numeric) : '—');
              return (
                <td key={pack.id} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{display}</span>
                    <SourceBadge sourceType={val.source_type} />
                  </div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
