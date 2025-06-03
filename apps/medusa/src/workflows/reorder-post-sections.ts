import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';

import type { ReorderPostSectionsWorkflowInput } from './types';
import { pageBuilderModuleEvents } from '../modules/page-builder';
import { reorderPostSectionsStep } from './steps/reorder-post-sections';

export const reorderPostSectionsWorkflow = createWorkflow(
  'reorder-post-sections-workflow',
  (input: ReorderPostSectionsWorkflowInput) => {
    const post = reorderPostSectionsStep(input);

    const emitData = transform({ post }, ({ post }) => {
      return {
        eventName: pageBuilderModuleEvents.POST_UPDATED,
        data: { id: post.id },
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(post);
  },
);
