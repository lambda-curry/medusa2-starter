import { StepResponse, createStep } from '@medusajs/workflows-sdk'

import type { CreatePostStepInput } from '../types'
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder'
import type PageBuilderService from '../../modules/page-builder/service'

export const createPostStepId = 'create-post-step'

export const createPostStep = createStep(
  createPostStepId,
  async (data: CreatePostStepInput, { container }) => {
    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    const createData: CreatePostStepInput = {
      ...data,
      status: data.status || 'draft',
      content_mode: data.content_mode || 'advanced',
    }

    const post = await pageBuilderService.createPosts(createData)

    return new StepResponse(post, {
      postId: post.id,
    })
  },
  async (data, { container }) => {
    if (!data) return

    const { postId } = data

    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    await pageBuilderService.deletePosts(postId)
  },
)
