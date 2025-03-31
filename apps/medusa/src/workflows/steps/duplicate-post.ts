import { StepResponse, createStep } from '@medusajs/workflows-sdk'

import type { DuplicatePostStepInput } from '../types'
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder'
import type PageBuilderService from '../../modules/page-builder/service'

export const duplicatePostStepId = 'duplicate-post-step'

export const duplicatePostStep = createStep(
  duplicatePostStepId,
  async (data: DuplicatePostStepInput, { container }) => {
    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Get the existing post to duplicate
    const existingPost = await pageBuilderService.retrievePost(data.id)

    // Create a new title with "(copy)" suffix
    const newTitle = `${existingPost.title || 'Untitled'} (copy)`

    // Create a new handle or make it null to generate a new one
    const handle = existingPost.handle ? `${existingPost.handle}-copy` : null

    // Create a new post with the copied data
    const newPost = await pageBuilderService.createPosts({
      title: newTitle,
      handle,
      excerpt: existingPost.excerpt,
      content: existingPost.content,
      status: 'draft', // Always start as draft
      type: existingPost.type,
      content_mode: existingPost.content_mode,
      seo: existingPost.seo ? { ...existingPost.seo } : undefined,
      is_home_page: false, // Never copy home page status
    })

    return new StepResponse(newPost, {
      originalId: existingPost.id,
      newId: newPost.id,
    })
  },
  async (data, { container }) => {
    if (!data) return

    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Delete the created post if workflow fails
    await pageBuilderService.deletePosts(data.newId)
  },
)
