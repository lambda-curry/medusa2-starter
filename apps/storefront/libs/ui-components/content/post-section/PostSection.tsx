import { PostSection, PostSectionStatus, PostSectionType } from '@libs/util/medusa/types';
import { type PostSectionComponent } from './types';
import PostSectionPreviewWrapper from './shared/PostSectionPreviewWrapper';
import PostSectionButtonList from './PostSectionButtonList';
import PostSectionCTA from './PostSectionCTA';
import PostSectionHeader from './PostSectionHeader';
import PostSectionHero from './PostSectionHero';
import PostSectionRawHTML from './PostSectionRawHTML';
import PostSectionRichText from './PostSectionRichText';
import PostSectionProductListCarousel from './PostSectionProductListCarousel';
import PostSectionProductListGrid from './PostSectionProductListGrid';
import { PostSectionImageGallery } from './PostSectionImageGallery';
import PostSectionBlogList from './PostSectionBlogList';

const COMPONENT_MAP = {
  [PostSectionType.BUTTON_LIST]: PostSectionButtonList,
  [PostSectionType.CTA]: PostSectionCTA,
  [PostSectionType.HEADER]: PostSectionHeader,
  [PostSectionType.HERO]: PostSectionHero,
  [PostSectionType.RAW_HTML]: PostSectionRawHTML,
  [PostSectionType.RICH_TEXT]: PostSectionRichText,
  [PostSectionType.PRODUCT_CAROUSEL]: PostSectionProductListCarousel,
  [PostSectionType.PRODUCT_GRID]: PostSectionProductListGrid,
  [PostSectionType.IMAGE_GALLERY]: PostSectionImageGallery,
  [PostSectionType.BLOG_LIST]: PostSectionBlogList
};

// Add types to the props
interface PostSectionSelectorProps {
  section: PostSection;
  isPreview?: boolean;
  data?: any;
}

const PostSectionSelector: React.FC<PostSectionSelectorProps> = props => {
  const Component = COMPONENT_MAP[props.section.type] as PostSectionComponent<PostSection>;
  if (!Component) return null;
  return <Component {...props} />;
};

export const RenderPostSection: PostSectionComponent<PostSection> = ({ section, isPreview, data }) => {
  if (section.status !== PostSectionStatus.PUBLISHED && !isPreview) return null;

  if (isPreview)
    return (
      <PostSectionPreviewWrapper section={section}>
        <PostSectionSelector section={section} isPreview={isPreview} data={data} />
      </PostSectionPreviewWrapper>
    );

  if (!section) return null;

  return <PostSectionSelector section={section} isPreview={isPreview} data={data} />;
};
