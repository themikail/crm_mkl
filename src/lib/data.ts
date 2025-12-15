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
  googleTaskId?: string;
  title: string;
  notes?: string;
  due: string;
  status: 'needsAction' | 'completed';
  completedAt?: string;
  linkedEntity?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  syncState?: 'ok' | 'pending' | 'error';
  updatedAt?: string;
};

export const tasks: Task[] = [
  { id: '1', title: 'Follow up with TechCorp', due: '2024-07-29T10:00:00Z', status: 'needsAction', linkedEntity: 'TechCorp' },
  { id: '2', title: 'Prepare proposal for Innovate LLC', due: '2024-07-30T10:00:00Z', status: 'needsAction', linkedEntity: 'Innovate LLC' },
  { id: '3', title: 'Schedule demo with Globex Inc.', due: '2024-08-01T10:00:00Z', status: 'needsAction', linkedEntity: 'Globex Inc.' },
  { id: '4', title: 'Send invoice to Acme Corp', due: '2024-07-27T10:00:00Z', status: 'needsAction', linkedEntity: 'Acme Corp' },
  { id: '5', title: 'Onboard new client - Stellar Solutions', due: '2024-07-22T10:00:00Z', status: 'completed', linkedEntity: 'Stellar Solutions' },
];

export type CalendarEvent = {
    id: string;
    googleEventId?: string;
    summary: string;
    start: string;
    end: string;
    attendees: string[];
    htmlLink?: string;
    linkedEntityType?: string;
    linkedEntityId?: string;
    linkedEntity?: string;
    updatedAt?: string;
};


export type Email = {
  id: string;
  googleMessageId?: string;
  threadId?: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
};

export const crmEntities = ['Project Phoenix', 'Innovate LLC', 'TechCorp', 'Acme Corp', 'Stellar Solutions'];
