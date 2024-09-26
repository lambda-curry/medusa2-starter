import { TableContentBlock } from '@libs/util/medusa/types';
import { ContentBlockComponentProps } from './types';

export const ContentBlockTable: ContentBlockComponentProps<TableContentBlock> = ({ block }) => (
  <table className="w-full table-auto">
    {block.data.withHeadings && (
      <thead>
        <tr>
          {block.data.content[0].map((heading: string, index: number) => (
            <th key={index} className="bg-gray-200 px-4 py-2">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
    )}
    <tbody>
      {block.data.content.map((row: string[], index: number) => {
        if (block.data.withHeadings && index === 0) return null;
        return (
          <tr key={index}>
            {row.map((item: string, index: number) => (
              <td key={index} className="border px-4 py-2">
                {item}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);
