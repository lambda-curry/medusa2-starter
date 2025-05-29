import { PropsWithChildren } from 'react';
import { PostSectionsSidebar } from './PostSectionsSidebar';
import { MainContent } from './MainContent';
import { PostSettingsSidebar } from './PostSettingsSidebar';

type PostEditorLayoutProps = PropsWithChildren;

export const PostEditorLayout = ({ children }: PostEditorLayoutProps) => {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <PostSectionsSidebar />
      <MainContent>{children}</MainContent>
      <PostSettingsSidebar />
    </div>
  );
};
