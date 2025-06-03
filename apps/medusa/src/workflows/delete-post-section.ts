import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';

import type { DeletePostSectionWorkflowInput } from './types';
import { pageBuilderModuleEvents } from '../modules/page-builder';
import { deletePostSectionStep } from './steps/delete-post-section';

export const deletePostSectionWorkflow = createWorkflow(
  'delete-post-section-workflow',
  (input: DeletePostSectionWorkflowInput) => {
    const result = deletePostSectionStep(input.id);

    const emitData = transform({ result }, ({ result }) => {
      return {
        eventName: pageBuilderModuleEvents.SECTION_DELETED,
        data: { id: result.id },
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(result);
  },
);
