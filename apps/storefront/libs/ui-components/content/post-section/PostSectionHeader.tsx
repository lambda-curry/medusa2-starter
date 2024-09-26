import clsx from 'clsx';
import { type HeaderPostSection } from '@libs/util/medusa/types';
import { PostSectionBase } from './shared/PostSectionBase';
import { type PostSectionComponent } from './types';
import { PageHeading } from '../PageHeading';
import { SectionText } from '../SectionText';
import { ActionList } from '../ActionList';
import { Container } from '@components/container/Container';

export const PostSectionHeader: PostSectionComponent<HeaderPostSection> = ({
  section,
}) => {
  const { heading, text, actions } = section.content;

  return (
    <PostSectionBase
      section={section}
      className={clsx(
        `[--default-background-color:white] [--default-text-align:center]`,
        `border-b-gray-200 first:border-b group-first:border-b`
      )}
    >
      <Container className="!max-w-6xl">
        <div className="inline-grid max-w-prose gap-6">
          {heading && <PageHeading>{heading.value}</PageHeading>}
          <SectionText content={text?.value} />
        </div>

        {actions && actions.length > 0 && (
          <div className="mt-8">
            <ActionList actions={actions} className="inline-flex" />
          </div>
        )}
      </Container>
    </PostSectionBase>
  );
};

export default PostSectionHeader;
