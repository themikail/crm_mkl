'use client';

import { OverviewCards } from './overview-cards';
import dynamic from 'next/dynamic';
import { RecentActivities } from './recent-activities';
import { TasksOverview } from './tasks-overview';
import { Skeleton } from '../ui/skeleton';

const DealsChart = dynamic(() => import('./deals-chart').then(mod => mod.DealsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[430px]" />
});

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
      </div>
      <OverviewCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DealsChart />
        </div>
        <div className="lg:col-span-1">
          <TasksOverview />
        </div>
      </div>
       <RecentActivities />
    </div>
  );
}
