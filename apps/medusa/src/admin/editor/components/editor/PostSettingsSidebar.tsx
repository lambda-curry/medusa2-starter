import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/Sidebar';
import { useSettingsSidebar } from '../../../routes/content/editor/providers/SettingsSidebarContext';
import { usePost } from '../../hooks/use-post';
import { PostDetailsForm } from './PostDetailsForm';

export const PostSettingsSidebar = () => {
  const { post } = usePost();
  const { isOpen, open, close, toggle } = useSettingsSidebar();
  const navigate = useNavigate();

  if (!post) return null;

  const type = post?.type ? ((post.type?.charAt(0).toUpperCase() + post.type?.slice(1)) as string) : 'Post';

  const header = {
    title: `${type} Settings`,
    showCloseButton: true,
  };

  return (
    <Sidebar side="right" header={header} isOpen={isOpen} toggle={toggle} open={open} close={close}>
      <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 bg-white">
          <PostDetailsForm
            post={post}
            afterDelete={async () => {
              close();
              navigate('/content');
            }}
          />
        </div>
      </aside>
    </Sidebar>
  );
};
