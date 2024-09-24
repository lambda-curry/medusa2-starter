import type { MetaFunction } from '@remix-run/node';
import type { Post } from '@marketplace/util/medusa/types';
import { getCommonMeta, getParentMeta, mergeMeta } from './meta';
import { getProxySrc } from '../../../markethaus/utils/img-proxy';

export const getPostMeta: MetaFunction = ({ data }: { data: unknown }) => {
  const post = (data as any).post as Post;

  if (!post) return [];

  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const image = getProxySrc(post.seo?.image?.url || post.featured_image?.url);
  const imageAlt = post.seo?.image?.alt?.value;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:image:alt', content: imageAlt }
  ];
};

export const getMergedPostMeta = mergeMeta(getParentMeta, getCommonMeta, getPostMeta);
