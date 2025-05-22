import { PropsWithChildren } from 'react';
import { TooltipProvider } from '@medusajs/ui';

import { MainContent } from './main-content';
import { EditorSidebar } from './editor-sidebar';
import { PostSettingsSidebar } from './post-settings-sidebar';
import { Post } from '@lambdacurry/page-builder-types';

type PostEditorLayoutProps = PropsWithChildren<{
  post: Post | undefined;
}>;

export const PostEditorLayout = ({ children, post }: PostEditorLayoutProps) => {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <EditorSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </TooltipProvider>
  );
};
