import { transform } from '@medusajs/framework/workflows-sdk'
import { emitEventStep } from '@medusajs/medusa/core-flows'
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk'

import type { CreatePostWorkflowInput } from './types'
import { pageBuilderModuleEvents } from '../modules/page-builder'
import { createPostStep } from './steps/create-post'

export const createPostWorkflow = createWorkflow(
  'create-post-workflow',
  (input: CreatePostWorkflowInput) => {
    const post = createPostStep(input.post)

    const emitData = transform({ post }, ({ post }) => {
      return {
        eventName: pageBuilderModuleEvents.POST_CREATED,
        data: { id: post.id },
      }
    })

    emitEventStep(emitData)

    return new WorkflowResponse(post)
  },
)
