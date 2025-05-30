import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';

import type { UpdatePostSectionWorkflowInput } from './types';
import { pageBuilderModuleEvents } from '../modules/page-builder';
import { updatePostSectionStep } from './steps/update-post-section';

export const updatePostSectionWorkflow = createWorkflow(
  'update-post-section-workflow',
  (input: UpdatePostSectionWorkflowInput) => {
    const section = updatePostSectionStep(input.section);

    const emitData = transform({ section }, ({ section }) => {
      return {
        eventName: pageBuilderModuleEvents.SECTION_UPDATED,
        data: { id: section.id },
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(section);
  },
);
