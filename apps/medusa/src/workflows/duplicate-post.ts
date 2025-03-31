import { transform } from '@medusajs/framework/workflows-sdk'
import { emitEventStep } from '@medusajs/medusa/core-flows'
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk'

import type { DuplicatePostWorkflowInput } from './types'
import { pageBuilderModuleEvents } from '../modules/page-builder'
import { duplicatePostStep } from './steps/duplicate-post'
import { duplicatePostRelationsStep } from './steps/duplicate-post-relations'

// Duplicate post workflow
export const duplicatePostWorkflow = createWorkflow(
  'duplicate-post-workflow',
  (input: DuplicatePostWorkflowInput) => {
    const newPost = duplicatePostStep({ id: input.id })

    const postWithRelations = duplicatePostRelationsStep({
      originalId: input.id,
      newId: newPost.id,
    })

    const emitData = transform({ post: newPost }, ({ post }) => {
      return {
        eventName: pageBuilderModuleEvents.POST_CREATED,
        data: { id: post.id },
      }
    })

    emitEventStep(emitData)

    return new WorkflowResponse(postWithRelations)
  },
)
