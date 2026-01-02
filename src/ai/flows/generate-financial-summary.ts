'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a human-readable summary of a user's financial habits.
 *
 * - generateFinancialSummary - A function that generates a financial summary based on expense data.
 * - GenerateFinancialSummaryInput - The input type for the generateFinancialSummary function.
 * - GenerateFinancialSummaryOutput - The return type for the generateFinancialSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialSummaryInputSchema = z.object({
  expenses: z.array(
    z.object({
      title: z.string().describe('The title of the expense.'),
      amount: z.number().describe('The amount of the expense.'),
      category: z.string().describe('The category of the expense.'),
      date: z.string().describe('The date of the expense.'),
      timestamp: z.number().describe('The timestamp of the expense.'),
    })
  ).describe('An array of expenses to summarize.'),
});
export type GenerateFinancialSummaryInput = z.infer<typeof GenerateFinancialSummaryInputSchema>;

const GenerateFinancialSummaryOutputSchema = z.object({
  summary: z.string().describe('A human-readable summary of the user\'s financial habits.'),
});
export type GenerateFinancialSummaryOutput = z.infer<typeof GenerateFinancialSummaryOutputSchema>;

export async function generateFinancialSummary(input: GenerateFinancialSummaryInput): Promise<GenerateFinancialSummaryOutput> {
  // Check if the API key is missing.
  if (!process.env.GOOGLE_API_KEY) {
    return {
      summary: 'The AI features are currently disabled. To enable them, please set your `GOOGLE_API_KEY` in the `.env` file and restart the application.',
    };
  }
  return generateFinancialSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialSummaryPrompt',
  input: {schema: GenerateFinancialSummaryInputSchema},
  output: {schema: GenerateFinancialSummaryOutputSchema},
  prompt: `You are a personal finance expert. Generate a concise, human-readable summary of the user\'s spending habits based on the following expenses.\n\nExpenses:\n{{#each expenses}}
- {{date}} - {{title}} ({{category}}): $\{{amount}}\n{{/each}}\n\nSummary:`,
});

const generateFinancialSummaryFlow = ai.defineFlow(
  {
    name: 'generateFinancialSummaryFlow',
    inputSchema: GenerateFinancialSummaryInputSchema,
    outputSchema: GenerateFinancialSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
