import { FormEvent } from 'react';
import { Button } from '@medusajs/ui';
import { Input } from '@medusajs/ui';
import { ArrrowRight } from '@medusajs/icons';

interface ChatInputProps {
  onSubmit: (e: FormEvent<HTMLFormElement>, value: string) => void;
  isLoading?: boolean;
  input: string;
  setInput: (value: string) => void;
}

export const ChatInput = ({ onSubmit, isLoading, input, setInput }: ChatInputProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(e, input);
    setInput(''); // Clear input after submission
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-10 p-3 pb-5 bg-ui-bg-base border-t border-ui-border-base"
    >
      <div className="flex mt-3 justify-stretch gap-2 w-full [&>div]:flex-1">
        <Input
          placeholder="Type your message..."
          disabled={isLoading}
          className="w-full"
          value={input}
          autoFocus
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={isLoading}>
          <ArrrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
