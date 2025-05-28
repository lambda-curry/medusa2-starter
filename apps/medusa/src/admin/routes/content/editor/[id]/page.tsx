import { TooltipProvider } from '@medusajs/ui';
import { useParams } from 'react-router-dom';
import { EditorModal } from '../../../../editor/components/editor/EditorModal';
import { EditorTopbar } from '../../../../editor/components/editor/EditorTopBar';
import { PostEditorLayout } from '../../../../editor/components/editor/PostEditorLayout';
import { PostContextProvider } from '../../../../editor/components/editor/PostContextProvider';
import { useAdminFetchPost } from '../../../../hooks/posts-queries';
import { SectionsSidebarProvider } from '../providers/SectionsSidebarContext';
import { SettingsSidebarProvider } from '../providers/SettingsSidebarContext';
import { EditorSidebarProvider } from '../providers/editor-sidebar-provider';

const PostDetailsPage = () => {
  const { id } = useParams();
  const { data: post } = useAdminFetchPost(id as string);
  console.log('🚀 ~ PostDetailsPage ~ id:', id);

  return (
    <PostContextProvider post={post}>
      <TooltipProvider>
        <SettingsSidebarProvider>
          <SectionsSidebarProvider>
            <EditorSidebarProvider>
              <EditorModal open={true}>
                <EditorModal.Content>
                  <EditorModal.Header>
                    <EditorModal.Title hidden={true}>{post?.title}</EditorModal.Title>
                    <EditorTopbar />
                  </EditorModal.Header>
                  <EditorModal.Body className="flex flex-col items-center">
                    <PostEditorLayout />
                  </EditorModal.Body>
                </EditorModal.Content>
              </EditorModal>
            </EditorSidebarProvider>
          </SectionsSidebarProvider>
        </SettingsSidebarProvider>
      </TooltipProvider>
    </PostContextProvider>
  );
};

export default PostDetailsPage;
