import { type RichTextPostSection } from '@libs/util/medusa/types';
import { type PostSectionComponent } from './types';
import { RichTextContent } from '../rich-text-content/RichTextContent';
import { Container } from '@components/container/Container';
import { PostSectionBase } from './shared/PostSectionBase';

export const PostSectionRichText: PostSectionComponent<RichTextPostSection> = ({
  section,
}) => {
  const { text } = section.content;

  return (
    <PostSectionBase section={section}>
      <Container className="!max-w-4xl">
        {text && <RichTextContent content={text.value} />}
      </Container>
    </PostSectionBase>
  );
};

export default PostSectionRichText;
