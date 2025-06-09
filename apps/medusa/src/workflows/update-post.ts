import { transform } from '@medusajs/framework/workflows-sdk'
import { emitEventStep } from '@medusajs/medusa/core-flows'
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk'

import type { UpdatePostWorkflowInput } from './types'
import { pageBuilderModuleEvents } from '../modules/page-builder'
import { updatePostStep } from './steps/update-post'

export const updatePostWorkflow = createWorkflow(
  'update-post-workflow',
  (input: UpdatePostWorkflowInput) => {
    const post = updatePostStep(input.post)

    const emitData = transform({ post }, ({ post }) => {
      return {
        eventName: pageBuilderModuleEvents.POST_UPDATED,
        data: { id: post.id },
      }
    })

    emitEventStep(emitData)

    return new WorkflowResponse(post)
  },
)
