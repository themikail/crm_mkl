import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentActivities, activityIcons } from '@/lib/data';

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>A log of the latest actions in your CRM.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={activity.person.avatarUrl} alt="Avatar" />
                  <AvatarFallback>{activity.person.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{activity.person.name}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium text-foreground">{activity.details}</span>.
                  </p>
                  <time className="text-xs text-muted-foreground">{activity.timestamp}</time>
                </div>
                 <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                 </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
