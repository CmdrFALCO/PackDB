import SourcePriorityEditor from '@/components/settings/SourcePriorityEditor';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      <SourcePriorityEditor />
    </div>
  );
}
