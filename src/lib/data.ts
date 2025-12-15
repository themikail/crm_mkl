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
  linkedEntity?: string;
};

export const tasks: Task[] = [
  { id: '1', title: 'Follow up with TechCorp', dueDate: 'Today', status: 'pending', linkedEntity: 'TechCorp' },
  { id: '2', title: 'Prepare proposal for Innovate LLC', dueDate: 'Tomorrow', status: 'pending', linkedEntity: 'Innovate LLC' },
  { id: '3', title: 'Schedule demo with Globex Inc.', dueDate: 'In 3 days', status: 'pending', linkedEntity: 'Globex Inc.' },
  { id: '4', title: 'Send invoice to Acme Corp', dueDate: 'Yesterday', status: 'overdue', linkedEntity: 'Acme Corp' },
  { id: '5', title: 'Onboard new client - Stellar Solutions', dueDate: 'Last week', status: 'completed', linkedEntity: 'Stellar Solutions' },
];

export const taskIcons: { [key in Task['status']]: Icon } = {
  completed: Check,
  pending: Clock,
  overdue: X,
};

export type CalendarEvent = {
    id: string;
    summary: string;
    start: Date;
    end: Date;
    attendees: string[];
    linkedEntity?: string;
};

export const calendarEvents: CalendarEvent[] = [
    {
        id: '1',
        summary: 'Q3 Strategy Meeting',
        start: new Date(new Date().setDate(new Date().getDate() + 1)),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
        attendees: ['john.doe@example.com', 'jane.smith@example.com'],
        linkedEntity: 'Project Phoenix'
    },
    {
        id: '2',
        summary: 'Demo with Innovate LLC',
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2)),
        attendees: ['john.doe@example.com', 'contact@innovatellc.com'],
        linkedEntity: 'Innovate LLC'
    },
    {
        id: '3',
        summary: 'Follow-up Call with TechCorp',
        start: new Date(new Date().setDate(new Date().getDate() + 3)),
        end: new Date(new Date().setDate(new Date().getDate() + 3)),
        attendees: ['john.doe@example.com'],
        linkedEntity: 'TechCorp'
    }
];

export type Email = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  linkedEntity?: string;
};

export const emails: Email[] = [
    {
        id: '1',
        from: 'Elena Rodriguez &lt;elena.r@techcorp.co&gt;',
        subject: 'Re: Project Phoenix Proposal',
        snippet: 'Hi John, thanks for sending that over. I have a few questions about the timeline...',
        date: '2:45 PM',
        isRead: false,
    },
    {
        id: '2',
        from: 'Ben Carter &lt;ben.c@innovatellc.com&gt;',
        subject: 'Following up on our demo',
        snippet: 'Great demo yesterday! We\'re very interested in moving forward. Let\'s discuss next steps.',
        date: 'Yesterday',
        isRead: true,
    },
    {
        id: '3',
        from: 'Marketing Team &lt;marketing@synergize.com&gt;',
        subject: 'New Feature Announcement!',
        snippet: 'We\'re excited to launch a new feature that will revolutionize your workflow...',
        date: '3 days ago',
        isRead: true,
    }
]

export const crmEntities = ['Project Phoenix', 'Innovate LLC', 'TechCorp', 'Acme Corp', 'Stellar Solutions'];
