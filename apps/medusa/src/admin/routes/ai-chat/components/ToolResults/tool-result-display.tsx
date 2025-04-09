import { Button, Text, Code, CodeBlock, Drawer } from '@medusajs/ui';
import type { ToolPart, Message } from '../../types';
import { ProductList } from '../product-list';
import { toolResultHasProducts } from './tool-result-display.helpers';

interface ToolResultDisplayProps {
  result: ToolPart;
}

export const ToolResultDisplay = ({ result }: ToolResultDisplayProps) => {
  const hasProducts = toolResultHasProducts(result);

  return (
    <div className="w-full space-y-2">
      <Drawer>
        <Drawer.Trigger asChild>
          <Button variant="secondary" size="small" className="flex items-center gap-2">
            <Code className="!bg-transparent !border-none">🛠️ {result.toolInvocation.toolName}</Code>
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              <Code>🛠️ {result.toolInvocation.toolName}</Code>
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-4 space-y-4">
            {result.toolInvocation.args && (
              <div>
                <CodeBlock
                  title="Arguments"
                  snippets={[
                    { code: JSON.stringify(result.toolInvocation.args, null, 2), language: 'json', label: 'Arguments' },
                  ]}
                >
                  <CodeBlock.Header />
                  <CodeBlock.Body />
                </CodeBlock>
              </div>
            )}
            {result.toolInvocation.state === 'result' && (
              <div>
                <CodeBlock
                  title="Results"
                  snippets={[
                    { code: JSON.stringify(result.toolInvocation.result, null, 2), language: 'json', label: 'Results' },
                  ]}
                >
                  <CodeBlock.Header />
                  <CodeBlock.Body />
                </CodeBlock>
              </div>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
      {hasProducts && result.toolInvocation.state === 'result' && (
        <div className="w-full py-4">
          <ProductList products={result.toolInvocation.result.products} count={result.toolInvocation.result.count} />
        </div>
      )}
    </div>
  );
};
