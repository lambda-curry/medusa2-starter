import { TooltipProvider } from '@medusajs/ui';
import { PropsWithChildren } from 'react';
import { SectionsSidebar } from './SectionsSidebar';
import { MainContent } from './MainContent';
import { PostSettingsSidebar } from './PostSettingsSidebar';

type PostEditorLayoutProps = PropsWithChildren;

export const PostEditorLayout = ({ children }: PostEditorLayoutProps) => {
  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden">
        <SectionsSidebar />
        <MainContent>{children}</MainContent>
        <PostSettingsSidebar />
      </div>
    </TooltipProvider>
  );
};
