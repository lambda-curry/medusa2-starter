import { z } from 'zod';
import { type Tool } from 'ai';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is required');
}

interface PerplexityChoice {
  index: number;
  finish_reason: 'stop' | 'length';
  message: {
    content: string;
    role: 'system' | 'user' | 'assistant';
  };
  delta?: {
    content: string;
    role: 'system' | 'user' | 'assistant';
  };
}

interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: PerplexityChoice[];
  usage: PerplexityUsage;
}

const researchInput = z.object({
  query: z.string().describe('The research question or topic to investigate'),
});

export const researchTool = {
  type: 'function' as const,
  parameters: researchInput,
  description:
    'Research any topic or question using Perplexity AI. Returns detailed information with source references.',
  execute: async (input: z.infer<typeof researchInput>): Promise<string> => {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant. Provide accurate information with references.',
            },
            {
              role: 'user',
              content: input.query,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = (await response.json()) as PerplexityResponse;
      console.log('>>>>> data', data);

      const answer = data.choices.find((choice) => choice.finish_reason === 'stop')?.message.content;

      // Format the response with references
      const formattedAnswer = `
<answer>
${answer}
</answer>

<sources>
${data.citations
  .map(
    (url) => `<source>
  <url>${url}</url>
</source>`,
  )
  .join('\n')}
</sources>
`;

      return formattedAnswer.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Research tool error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred during research');
    }
  },
} satisfies Tool;
