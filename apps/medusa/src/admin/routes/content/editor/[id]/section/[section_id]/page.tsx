import { TooltipProvider } from '@medusajs/ui';
import { useParams } from 'react-router-dom';
import { EditorModal } from '../../../../../../editor/components/editor/EditorModal';
import { EditorTopbar } from '../../../../../../editor/components/editor/EditorTopBar';
import { PostContextProvider } from '../../../../../../editor/components/editor/PostContextProvider';
import { PostEditorLayout } from '../../../../../../editor/components/editor/PostEditorLayout';
import { PostSectionContextProvider } from '../../../../../../editor/components/editor/PostSectionContextProvider';
import { useAdminFetchPostSection } from '../../../../../../hooks/post-sections-queries';
import { useAdminFetchPost } from '../../../../../../hooks/posts-queries';
import { PostSectionsSidebarProvider } from '../../../providers/PostSectionsSidebarContext';
import { PostSettingsSidebarProvider } from '../../../providers/PostSettingsSidebarContext';

const PostDetailsPage = () => {
  const { id, section_id } = useParams();
  const { data: post } = useAdminFetchPost(id as string);
  const { data: section } = useAdminFetchPostSection(section_id as string);

  return (
    <PostContextProvider post={post}>
      <PostSectionContextProvider section={section}>
        <TooltipProvider>
          <PostSettingsSidebarProvider>
            <PostSectionsSidebarProvider>
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
            </PostSectionsSidebarProvider>
          </PostSettingsSidebarProvider>
        </TooltipProvider>
      </PostSectionContextProvider>
    </PostContextProvider>
  );
};

export default PostDetailsPage;
