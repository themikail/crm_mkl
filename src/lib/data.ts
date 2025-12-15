import type { Icon } from 'lucide-react';
import { Users, Building2, Handshake, Check, X, Clock } from 'lucide-react';

export type Deal = {
  stage: string;
  count: number;
};

export const dealsByStage: Deal[] = [
  { stage: 'Lead', count: 25 },
  { stage: 'Qualified', count: 45 },
  { stage: 'Proposal', count: 30 },
  { stage: 'Negotiation', count: 15 },
  { stage: 'Closed Won', count: 5 },
];

export type Activity = {
  id: string;
  type: 'contact' | 'company' | 'deal';
  action: string;
  person: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  details: string;
};

export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'contact',
    action: 'added a new contact',
    person: { name: 'Alex Johnson', avatarUrl: 'https://picsum.photos/seed/user1/40/40' },
    timestamp: '2 hours ago',
    details: 'Sarah Williams (sarah.w@techcorp.co)',
  },
  {
    id: '2',
    type: 'deal',
    action: 'updated a deal',
    person: { name: 'Maria Garcia', avatarUrl: 'https://picsum.photos/seed/user2/40/40' },
    timestamp: 'Yesterday',
    details: 'Project Phoenix to Negotiation stage',
  },
  {
    id: '3',
    type: 'company',
    action: 'logged a call with',
    person: { name: 'David Smith', avatarUrl: 'https://picsum.photos/seed/user3/40/40' },
    timestamp: '3 days ago',
    details: 'Innovate LLC',
  },
  {
    id: '4',
    type: 'deal',
    action: 'closed a deal',
    person: { name: 'Alex Johnson', avatarUrl: 'https://picsum.photos/seed/user1/40/40' },
    timestamp: '4 days ago',
    details: 'Alpha Initiative - $50,000',
  },
];

export const activityIcons: { [key: string]: Icon } = {
  contact: Users,
  company: Building2,
  deal: Handshake,
};

export type Task = {
  id: string;
  title: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'overdue';
};

export const tasks: Task[] = [
  { id: '1', title: 'Follow up with TechCorp', dueDate: 'Today', status: 'pending' },
  { id: '2', title: 'Prepare proposal for Innovate LLC', dueDate: 'Tomorrow', status: 'pending' },
  { id: '3', title: 'Schedule demo with Globex Inc.', dueDate: 'In 3 days', status: 'pending' },
  { id: '4', title: 'Send invoice to Acme Corp', dueDate: 'Yesterday', status: 'overdue' },
  { id: '5', title: 'Onboard new client - Stellar Solutions', dueDate: 'Last week', status: 'completed' },
];

export const taskIcons: { [key in Task['status']]: Icon } = {
  completed: Check,
  pending: Clock,
  overdue: X,
};
