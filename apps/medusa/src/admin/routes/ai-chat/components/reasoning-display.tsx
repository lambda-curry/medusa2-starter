import { Button, Text, Drawer } from '@medusajs/ui';
import type { ReasoningPart } from '../types';

export const ReasoningDisplay = ({ part }: { part: ReasoningPart }) => {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          🧠 View Reasoning
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          🧠 <Drawer.Title>AI's Reasoning Process</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex-1 overflow-y-auto p-4">
          <Text className="text-ui-fg-subtle italic whitespace-pre-wrap">{part.reasoning}</Text>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
};
