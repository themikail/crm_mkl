import { AppShell } from '@/components/layout/app-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        </div>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">
              <Link href="/settings">Profile</Link>
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link href="/settings/integrations">Integrations</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <p>Profile settings will be here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
