import { AppShell } from '@/components/layout/app-shell';

export default function EmailPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold md:text-3xl">Email</h1>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p>Email functionality will be implemented here.</p>
        </div>
      </div>
    </AppShell>
  );
}
