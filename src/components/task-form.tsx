'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestTaskListForCrmTaskSync } from '@/ai/flows/sync-crm-tasks-to-google-tasks-with-list-suggestions';

const taskFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  syncToGoogleTasks: z.boolean().default(false),
  googleTaskList: z.string().optional(),
});

// Mock data
const googleTaskLists = [
  'My Tasks',
  'Work Projects',
  'Personal Errands',
  'Shopping List',
  'Q3 Sales Follow-ups',
];
const crmOrgName = 'Synergize Inc.';
const crmUserName = 'John Doe';


export function TaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestedLists, setSuggestedLists] = React.useState<string[]>([]);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      syncToGoogleTasks: false,
    },
  });

  async function onSubmit(values: z.infer<typeof taskFormSchema>) {
    console.log(values);
    toast({
      title: 'Task Created',
      description: 'The new task has been added successfully.',
    });
    onTaskCreated();
  }

  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestedLists([]);
    try {
      const taskTitle = form.getValues('title');
      const taskDescription = form.getValues('description') || '';
      
      if (!taskTitle) {
          toast({
              variant: 'destructive',
              title: 'Title is required',
              description: 'Please enter a task title to get suggestions.',
          });
          return;
      }

      const result = await suggestTaskListForCrmTaskSync({
        taskTitle,
        taskDescription,
        orgName: crmOrgName,
        userName: crmUserName,
        googleTaskListNames: googleTaskLists,
      });

      if (result.suggestedTaskListNames && result.suggestedTaskListNames.length > 0) {
        setSuggestedLists(result.suggestedTaskListNames);
        form.setValue('googleTaskList', result.suggestedTaskListNames[0]);
        toast({
          title: 'AI Suggestions Ready',
          description: 'We\'ve suggested the most relevant task list for you.',
        });
      } else {
        toast({
          title: 'No specific suggestion found',
          description: 'You can select a list manually.',
        });
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get AI suggestions at this time.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Follow up with Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <FormField
          control={form.control}
          name="syncToGoogleTasks"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Sync to Google Tasks
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        {form.watch('syncToGoogleTasks') && (
            <div className="space-y-4 pl-4 border-l-2 ml-2">
                <FormField
                control={form.control}
                name="googleTaskList"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Google Task List</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {googleTaskLists.map(list => (
                                <SelectItem key={list} value={list}>
                                    {suggestedLists.includes(list) && <Wand2 className="inline-block mr-2 h-4 w-4 text-primary" />}
                                    {list}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleGetSuggestions} disabled={isSuggesting}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isSuggesting ? 'Thinking...' : 'Get AI Suggestions'}
                </Button>
            </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Form>
  );
}
