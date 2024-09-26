import { CodeContentBlock } from '@libs/util/medusa/types';
import { ContentBlockComponentProps } from './types';

export const ContentBlockCode: ContentBlockComponentProps<CodeContentBlock> = ({ block }) => (
  <pre className="rounded-md bg-gray-100 p-4 text-sm">
    <code className="text-sm text-black">{block.data.code}</code>
  </pre>
);
