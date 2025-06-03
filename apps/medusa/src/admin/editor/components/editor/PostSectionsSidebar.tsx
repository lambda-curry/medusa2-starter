import { useParams } from 'react-router-dom';
import { Sidebar } from '../../../components/Sidebar';
import { usePostSectionsSidebar } from '../../../routes/content/editor/providers/PostSectionsSidebarContext';
import { usePostSection } from '../../hooks/use-post-section';
import { PostSectionsSidebarContent } from './PostSectionsSidebarContent';
import { PostSectionEditorSidebarContent } from './post-section/PostSectionEditorSidebarContent';

export const PostSectionsSidebar = () => {
  const { section } = usePostSection();
  const { isOpen, open, close, toggle } = usePostSectionsSidebar();

  return (
    <>
      <Sidebar side="left" isOpen={isOpen} toggle={toggle} open={open} close={close} className="min-w-[375px]">
        <aside className="flex flex-1 flex-col overflow-y-auto px-4">
          {!section && <PostSectionsSidebarContent className="py-4" />}
          {section && <PostSectionEditorContent className="pt-2 pb-4" />}
        </aside>
      </Sidebar>
    </>
  );
};

const PostSectionEditorContent = ({ className }: { className?: string }) => {
  return <PostSectionEditorSidebarContent className={className} />;
};
