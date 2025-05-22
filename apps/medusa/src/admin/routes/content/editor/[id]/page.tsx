import { TooltipProvider } from '@medusajs/ui';
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom';
import { PostDetailsForm } from '../../../../components/organisms/editor/PostDetailsForm';
import { EditorModal } from '../../../../components/organisms/editor/editor-modal';
import { EditorTopbar } from '../../../../components/organisms/editor/editor-top-bar';
import { PostEditorLayout } from '../../../../components/organisms/editor/post-editor-layout';
import { useAdminFetchPost } from '../../../../hooks/posts-queries';
import { EditorSidebarProvider } from '../providers/editor-sidebar-provider';

export async function loader({ params }: LoaderFunctionArgs) {
  console.log('🚀 ~ loader ~ content/editor/:id ~ params:', params);

  return {
    post: {
      id: params.id,
      title: 'Test Page',
      description: 'Test Page Description',
      content: 'Test Page Content',
      type: 'page',
    },
  };
}

const PostDetailsPage = () => {
  const { id } = useParams();
  const { data: post } = useAdminFetchPost(id as string);
  const navigate = useNavigate();
  console.log('🚀 ~ PostDetailsPage ~ id:', id);

  const handleAfterSave = async () => {
    console.log('Post saved successfully');
    navigate(`/content/editor`);
  };

  const handleAfterDelete = async () => {
    navigate('/content/posts');
  };

  return (
    <TooltipProvider>
      <EditorSidebarProvider>
        <EditorModal open={true}>
          <EditorModal.Content>
            <EditorModal.Header>
              {/* EditorModal.Title is required by EditorModal.Content */}
              <EditorModal.Title hidden={true}>{post?.title}</EditorModal.Title>
              <EditorTopbar />
            </EditorModal.Header>
            <EditorModal.Body className="flex flex-col items-center">
              <PostEditorLayout post={post}></PostEditorLayout>
            </EditorModal.Body>
          </EditorModal.Content>
        </EditorModal>
      </EditorSidebarProvider>
    </TooltipProvider>
  );
};

export default PostDetailsPage;
