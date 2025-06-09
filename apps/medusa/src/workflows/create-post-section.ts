import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';

import type { CreatePostSectionWorkflowInput } from './types';
import { pageBuilderModuleEvents } from '../modules/page-builder';
import { createPostSectionStep } from './steps/create-post-section';

export const createPostSectionWorkflow = createWorkflow(
  'create-post-section-workflow',
  (input: CreatePostSectionWorkflowInput) => {
    const section = createPostSectionStep(input.section);

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
