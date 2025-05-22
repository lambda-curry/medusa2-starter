import { Post } from '@lambdacurry/page-builder-types';
import { PostDetailsForm } from './PostDetailsForm';
import { SidebarContainer } from './sidebar-container';
import { useEditorSidebar } from '../../../hooks/editor/use-editor-sidebar';

export const PostSettingsSidebar = ({ post, close }: { post: Post; close: () => Promise<void> }) => {
  const { toggleRight } = useEditorSidebar();

  if (!post) return null;

  const type = post?.type ? ((post.type?.charAt(0).toUpperCase() + post.type?.slice(1)) as string) : 'Post';

  return (
    <SidebarContainer.Drawer side="right" title={`${type} Settings`}>
      <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
        <PostDetailsForm
          post={post}
          afterSave={async () => toggleRight('drawer')}
          afterDelete={async () => toggleRight('drawer')}
        />
      </aside>
    </SidebarContainer.Drawer>
  );
};
