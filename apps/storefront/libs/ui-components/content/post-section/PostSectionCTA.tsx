import clsx from 'clsx';
import { type CTAPostSection } from '@marketplace/util/medusa/types';
import { PostSectionBase } from './shared/PostSectionBase';
import { type PostSectionComponent } from './types';
import { ActionList } from '../ActionList';
import { SectionHeading } from '../SectionHeading';
import { SectionText } from '../SectionText';
import { Container } from '@components/container/Container';
import { Grid } from '@components/grid/Grid';
import { GridColumn } from '@components/grid/GridColumn';

export const PostSectionCTA: PostSectionComponent<CTAPostSection> = ({
  section,
}) => {
  const { heading, text, actions } = section.content;

  return (
    <PostSectionBase
      section={section}
      className={clsx(
        `[--default-background-color:var(--color-primary-900)] [--default-color:var(--color-primary-100)]`,
        `[--default-text-align:left] [--mobile-text-align:center]`
      )}
    >
      <Container className="!max-w-6xl">
        <Grid className="items-center">
          <GridColumn className="md:col-span-7">
            {heading && <SectionHeading>{heading.value}</SectionHeading>}
            {text && <SectionText content={text.value} />}
          </GridColumn>
          <GridColumn className="md:col-span-5">
            {!!actions?.length && (
              <ActionList
                actions={actions}
                className="mt-4 justify-center md:col-span-4 md:mt-0 md:justify-end"
              />
            )}
          </GridColumn>
        </Grid>
      </Container>
    </PostSectionBase>
  );
};

export default PostSectionCTA;
