import { AppShell } from '@/components/layout/app-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleIntegration } from '@/components/settings/google-integration';
import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        </div>
        <Tabs defaultValue="integrations">
          <TabsList>
            <TabsTrigger value="profile">
                <Link href="/settings">Profile</Link>
            </TabsTrigger>
            <TabsTrigger value="integrations">
                <Link href="/settings/integrations">Integrations</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="integrations">
            <GoogleIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
