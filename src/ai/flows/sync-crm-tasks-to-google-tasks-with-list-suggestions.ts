'use server';

/**
 * @fileOverview Implements the Genkit flow for suggesting relevant Google Task lists to sync with CRM tasks.
 *
 * - `suggestTaskListForCrmTaskSync` - A function that suggests Google Task lists for CRM task synchronization.
 * - `SuggestTaskListForCrmTaskSyncInput` - The input type for the `suggestTaskListForCrmTaskSync` function.
 * - `SuggestTaskListForCrmTaskSyncOutput` - The return type for the `suggestTaskListForCrmTaskSync` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskListForCrmTaskSyncInputSchema = z.object({
  taskTitle: z.string().describe('The title of the CRM task.'),
  taskDescription: z.string().describe('The description of the CRM task.'),
  orgName: z.string().describe('The name of the CRM organization.'),
  userName: z.string().describe('The name of the user creating the task.'),
  googleTaskListNames: z
    .array(z.string())
    .describe('The names of the Google Task lists available for the user.'),
});

export type SuggestTaskListForCrmTaskSyncInput = z.infer<
  typeof SuggestTaskListForCrmTaskSyncInputSchema
>;

const SuggestTaskListForCrmTaskSyncOutputSchema = z.object({
  suggestedTaskListNames: z
    .array(z.string())
    .describe(
      'The names of the Google Task lists that are most relevant for syncing with the CRM task, based on the task title, description, organization name, and user name.'
    ),
});

export type SuggestTaskListForCrmTaskSyncOutput = z.infer<
  typeof SuggestTaskListForCrmTaskSyncOutputSchema
>;

export async function suggestTaskListForCrmTaskSync(
  input: SuggestTaskListForCrmTaskSyncInput
): Promise<SuggestTaskListForCrmTaskSyncOutput> {
  return suggestTaskListForCrmTaskSyncFlow(input);
}

const suggestTaskListForCrmTaskSyncPrompt = ai.definePrompt({
  name: 'suggestTaskListForCrmTaskSyncPrompt',
  input: {schema: SuggestTaskListForCrmTaskSyncInputSchema},
  output: {schema: SuggestTaskListForCrmTaskSyncOutputSchema},
  prompt: `You are an AI assistant that suggests the most relevant Google Task lists for syncing with a CRM task.

  Given the following information about the CRM task, the CRM organization, the user, and the available Google Task lists, determine which Google Task lists are most suitable for syncing with the CRM task.

  CRM Task Title: {{{taskTitle}}}
  CRM Task Description: {{{taskDescription}}}
  CRM Organization Name: {{{orgName}}}
  User Name: {{{userName}}}
  Available Google Task List Names: {{#each googleTaskListNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Consider the task title, description, organization name, and user name when determining the relevance of each Google Task list.
  The suggested task list names should be highly relevant to the provided information.
  Return ONLY the names of the suggested task lists in a JSON array. 
`,
});

const suggestTaskListForCrmTaskSyncFlow = ai.defineFlow(
  {
    name: 'suggestTaskListForCrmTaskSyncFlow',
    inputSchema: SuggestTaskListForCrmTaskSyncInputSchema,
    outputSchema: SuggestTaskListForCrmTaskSyncOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskListForCrmTaskSyncPrompt(input);
    return output!;
  }
);
