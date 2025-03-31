import { StepResponse, createStep } from '@medusajs/workflows-sdk'

import type { UpdatePostStepInput } from '../types'
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder'
import type PageBuilderService from '../../modules/page-builder/service'

export const updatePostStepId = 'update-post-step'

export const updatePostStep = createStep(
  updatePostStepId,
  async (data: UpdatePostStepInput, { container }) => {
    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Get the existing post before updating for rollback
    const existingPost = await pageBuilderService.retrievePost(data.id, {
      relations: ['root', 'featured_image', 'authors', 'sections', 'tags'],
    })

    const post = await pageBuilderService.updatePosts(data)

    return new StepResponse(post, {
      ...existingPost,

      // relations
      root_id: existingPost.root?.root?.id ?? undefined,
      featured_image_id: existingPost.featured_image?.id,
      authors: existingPost.authors?.map((author) => author.id),
      sections: existingPost.sections?.map((section) => section.id),
      tags: existingPost.tags?.map((tag) => tag.id),
    } as UpdatePostStepInput)
  },
  async (existingData, { container }) => {
    if (!existingData) return

    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Rollback to the previous state with only the updatable fields
    await pageBuilderService.updatePosts(existingData)
  },
)
