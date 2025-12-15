import { OverviewCards } from './overview-cards';
import { DealsChart } from './deals-chart';
import { RecentActivities } from './recent-activities';
import { TasksOverview } from './tasks-overview';

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
