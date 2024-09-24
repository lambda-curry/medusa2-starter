import clsx from 'clsx';
import { HeroPostSection } from '@marketplace/util/medusa/types';
import { PostSectionBase } from './shared/PostSectionBase';
import { type PostSectionComponent } from './types';
import { ActionList } from '../ActionList';
import { PageHeading } from '../PageHeading';
import { SectionText } from '../SectionText';
import { Container } from '@components/container/Container';
import { PostSectionImage } from './shared/PostSectionImage';

export const PostSectionHero: PostSectionComponent<HeroPostSection> = ({
  section,
}) => {
  const { heading, text, image, actions, layout } = section.content;

  const inverse = layout?.includes('inverse');
  const contained = layout?.includes('contained');

  return (
    <PostSectionBase section={section}>
      <Container>
        <div
          className={clsx('flex', {
            'flex-col-reverse lg:flex-row': !inverse,
            'flex-col-reverse lg:flex-row-reverse': inverse,
          })}
        >
          <div
            className={clsx(
              'h-auto flex-1 overflow-hidden py-4 lg:max-w-[50%] lg:py-24',
              {
                'lg:pr-8': !inverse,
                'lg:pl-8': inverse,
              }
            )}
          >
            <div className="mr-8 inline-grid max-w-prose gap-6">
              {heading && (
                <PageHeading
                  className="break-words"
                  style={{
                    wordBreak: 'break-word',
                  }}
                >
                  {heading.value}
                </PageHeading>
              )}
              <SectionText className="break-words" content={text?.value} />
            </div>

            {!!actions?.length && (
              <ActionList actions={actions} className="mt-8 lg:mt-10" />
            )}
          </div>

          <div className="-mx-4 w-screen flex-1 sm:-mx-6 md:-mx-8 lg:mx-0">
            {image && (
              <PostSectionImage
                image={image}
                className={clsx(
                  { 'object-cover lg:absolute lg:w-1/2 ': !contained },
                  'aspect-[3/2] w-full bg-gray-50 object-contain lg:aspect-auto lg:h-full',
                  {
                    'right-0': !inverse,
                    'left-0': inverse,
                  }
                )}
              />
            )}
          </div>
        </div>
      </Container>
    </PostSectionBase>
  );
};

export default PostSectionHero;
