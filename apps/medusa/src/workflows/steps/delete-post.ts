import { StepResponse, createStep } from '@medusajs/workflows-sdk'

import type { CreatePostStepInput, DeletePostStepInput } from '../types'
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder'
import type PageBuilderService from '../../modules/page-builder/service'

export const deletePostStepId = 'delete-post-step'

export const deletePostStep = createStep(
  deletePostStepId,
  async (data: DeletePostStepInput, { container }) => {
    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Get the existing post before deleting for rollback
    const existingPost = await pageBuilderService.retrievePost(data.id, {
      relations: ['root', 'featured_image', 'authors', 'sections', 'tags'],
    })

    await pageBuilderService.deletePosts(data.id)

    return new StepResponse({ id: data.id }, existingPost)
  },
  async (existingPost, { container }) => {
    if (!existingPost) return

    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Restore the deleted post
    const createPostInput: {
      id: string
      sections?: string[]
    } & CreatePostStepInput = {
      ...existingPost,

      // relations
      root_id: existingPost.root?.root?.id ?? undefined,
      featured_image_id: existingPost.featured_image?.id,
      authors: existingPost.authors?.map((author) => author.id),
      sections: existingPost.sections?.map((section) => section.id),
      tags: existingPost.tags?.map((tag) => tag.id),
    }

    const restoredPost = await pageBuilderService.createPosts(createPostInput)

    return restoredPost
  },
)
