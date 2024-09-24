import { isBrowser } from '@utils/browser';
import { isWithinIframe } from '@marketplace/util/iframe/isWithinIframe';
import { useMessage } from '@marketplace/util/iframe/useMessage';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import type {
  Post,
  PostSection,
  PostTemplate,
} from '@marketplace/util/medusa/types';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import mergeWith from 'lodash/mergeWith';
import omit from 'lodash/omit';
import { useEffect, useRef, useState } from 'react';
import { scrollToElement } from '@utils/scroll-to-element';

const usePost = (initialPost: Post | PostTemplate) => {
  const [post, setPost] = useState<Post | PostTemplate>(initialPost);

  useMessage('UpdatePostSection', (_, payload) => {
    const {
      post: updatedPost,
      sections: updatedSections,
      sectionIndex: updatedSectionIndex,
      replace: replaceSections,
    } = payload as {
      post: Post;
      sections?: PostSection[];
      sectionIndex?: number;
      replace: boolean;
    };

    if (replaceSections) post.sections = updatedSections || [];

    if (!replaceSections)
      updatedSections?.forEach((updatedSection: PostSection, index) => {
        if (!post.sections) post.sections = [];
        // Add the section if it doesn't exist. Insert it at the index if we have one, otherwise at the end.
        if (
          updatedSection &&
          !post.sections.find(section => section.id === updatedSection.id)
        ) {
          post.sections.splice(
            typeof updatedSectionIndex !== 'undefined'
              ? updatedSectionIndex + index
              : post.sections.length,
            0,
            updatedSection
          );
        }
      });

    // If we get a section index, but no section, it means we should remove the section.
    if (updatedSectionIndex && !updatedSections) {
      post.sections.splice(updatedSectionIndex, 1);
    }

    // Merge the updated post and section data with the existing data.
    const newPost = mergeWith(
      {},
      // Omit sections here, because we want to fully override the sections array with the updated sections.
      omit(post, 'sections'),
      {
        ...updatedPost,
        sections: post.sections.map(section => {
          const updatedSection = updatedSections?.find(
            s => section.id === s.id
          ) as PostSection;

          // If have an updated section and it matches the section, return the updated section.
          return updatedSection ? updatedSection : section;
        }),
      },
      (a, b) => (b === null ? a : undefined)
    );

    if (Array.isArray(updatedPost.section_ids)) {
      // Sort the post sections by section_ids. To maintain the correct order of the sections,
      // we need to map the section ids to the actual sections.
      newPost.sections = updatedPost.section_ids.map(sectionId =>
        post.sections.find(section => section.id === sectionId)
      ) as PostSection[];
    }

    setPost(newPost);
  });

  return [post, setPost] as const;
};

const usePostSectionClick = () => {
  if (!isBrowser() || !isWithinIframe()) return;

  const handlePostPreviewSectionClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const postSectionPreview = (event.target as HTMLElement).closest(
      '[data-post-section-preview-id]'
    );

    if (!postSectionPreview) return;

    const postSectionId = postSectionPreview.getAttribute(
      'data-post-section-preview-id'
    );

    parent.postMessage(
      { type: 'PostSectionClick', payload: { postSectionId } },
      '*'
    );
  };

  const eventListenerRef = useRef<((event: MouseEvent) => void) | null>(null);

  useEffect(() => {
    if (!eventListenerRef.current) {
      eventListenerRef.current = handlePostPreviewSectionClick;
      window.addEventListener('click', handlePostPreviewSectionClick, true);
    }

    return () => {
      if (eventListenerRef.current) {
        window.removeEventListener('click', eventListenerRef.current);
        eventListenerRef.current = null;
      }
    };
  }, []);

  return null;
};

const useActivePostSectionChange = () => {
  if (!isBrowser() || !isWithinIframe()) return;

  useMessage('SetActivePostSection', (send, payload) => {
    const { postSectionId } = payload as { postSectionId: string };
    const postSectionPreviewElementId = postSectionId
      ? `#${postSectionId}__preview`
      : '#';

    // IMPORTANT: Setting the `window.location.hash` directly is the only way to properly apply the `:target` selector
    // to the section element. (We can't use React Router's `navigate` or `history.pushState`/`history.replaceState`.)
    // However, this does not trigger scroll event, so we need to manually scroll to the section element.
    window.location.hash = postSectionPreviewElementId;
  });

  useEffect(() => {
    // NOTE: We need to place this within a `setTimeout` to ensure that scrolling animation works properly
    // when manually setting the `window.location.hash`.
    setTimeout(() => scrollToElement(location.hash));
  }, [location.hash]);
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  if (!params.postId) throw redirect('/');
  let post;
  if (params.template === 'template') {
    const { post_template } = await client.postTemplates.retrieve(
      params.postId
    );
    post = post_template;
  } else {
    const { post: retrievedPost } = await client.posts.retrieve(params.postId);
    post = retrievedPost;
  }

  if (!post) throw redirect('/');

  return { post };
};

export default function PreviewRoute() {
  const { post: loadedPost } = useLoaderData<typeof loader>();
  const [post, _] = usePost(loadedPost); // This line is needed for realtime updates from the admin.

  usePostSectionClick();
  useActivePostSectionChange();

  return <Outlet context={{ post }} />;
}
