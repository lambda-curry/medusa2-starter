import { type RawHTMLPostSection } from '@marketplace/util/medusa/types';
import { InnerHtml } from '../../../../app/components/html/InnerHTML';
import { type PostSectionComponent } from './types';
import { PostSectionBase } from './shared/PostSectionBase';

export const PostSectionRawHTML: PostSectionComponent<RawHTMLPostSection> = ({ section, isPreview }) => {
  const { html } = section.content;

  return (
    <PostSectionBase section={section}>
      <InnerHtml className="raw" html={html?.value} permitRerenders={isPreview} />
    </PostSectionBase>
  );
};

export default PostSectionRawHTML;
