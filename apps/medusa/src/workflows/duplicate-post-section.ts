import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';

import type { DuplicatePostSectionWorkflowInput } from './types';
import { pageBuilderModuleEvents } from '../modules/page-builder';
import { duplicatePostSectionStep } from './steps/duplicate-post-section';

export const duplicatePostSectionWorkflow = createWorkflow(
  'duplicate-post-section-workflow',
  (input: DuplicatePostSectionWorkflowInput) => {
    const section = duplicatePostSectionStep(input.id);

    const emitData = transform({ section }, ({ section }) => {
      return {
        eventName: pageBuilderModuleEvents.SECTION_CREATED,
        data: { id: section.id },
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(section);
  },
);
