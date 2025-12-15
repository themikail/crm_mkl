import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, Briefcase, Target } from 'lucide-react';

const overviewData = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1% from last month',
    icon: DollarSign,
  },
  {
    title: 'New Clients',
    value: '+2,350',
    change: '+180.1% from last month',
    icon: Users,
  },
  {
    title: 'Open Deals',
    value: '128',
    change: '+19% from last month',
    icon: Briefcase,
  },
  {
    title: 'Conversion Rate',
    value: '12.5%',
    change: '+2.1% from last month',
    icon: Target,
  },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {overviewData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
