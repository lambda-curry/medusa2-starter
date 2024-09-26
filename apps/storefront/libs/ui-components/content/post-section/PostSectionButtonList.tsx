import { FC } from 'react';
import { type ButtonListPostSection } from '@libs/util/medusa/types';
import { PostSectionBase } from './shared/PostSectionBase';
import { ActionList } from '../ActionList';
import { SectionHeading } from '../SectionHeading';
import { SectionText } from '../SectionText';
import { Container } from '@components/container/Container';
import { PostSectionComponent } from './types';

export const PostSectionButtonList: PostSectionComponent<
  ButtonListPostSection
> = ({ section }) => {
  const { heading, text, actions } = section.content;

  return (
    <PostSectionBase
      className="[--default-text-align:center]"
      section={section}
    >
      <Container>
        {(heading || text) && (
          <header className="mb-4 md:mb-6 lg:mb-8">
            <div className="inline-block max-w-prose">
              {heading && <SectionHeading>{heading.value}</SectionHeading>}
              {text && <SectionText content={text.value} />}
            </div>
          </header>
        )}

        {!!actions?.length && (
          <div className="mt-8">
            <ActionList actions={actions} className="inline-flex" />
          </div>
        )}
      </Container>
    </PostSectionBase>
  );
};

export default PostSectionButtonList;
