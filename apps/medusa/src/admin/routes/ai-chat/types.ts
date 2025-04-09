import type { Message as AiMessage } from 'ai';

export type Part = NonNullable<AiMessage['parts']>[number];
export type ToolPart = Extract<Part, { type: 'tool-invocation' }>;
export type ReasoningPart = Extract<Part, { type: 'reasoning' }>;

export type Message = AiMessage;
