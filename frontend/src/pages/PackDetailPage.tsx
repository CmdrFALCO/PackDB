import { useParams } from 'react-router-dom';

export default function PackDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-lg text-muted-foreground">
        Pack Detail (ID: {id}) — coming in Phase 2C
      </p>
    </div>
  );
}
