import { StepResponse, createStep } from '@medusajs/workflows-sdk';

import type { UpdatePostSectionStepInput } from '../types';
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder';
import type PageBuilderService from '../../modules/page-builder/service';

export const updatePostSectionStepId = 'update-post-section-step';

export const updatePostSectionStep = createStep(
  updatePostSectionStepId,
  async (data: UpdatePostSectionStepInput, { container }) => {
    const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

    const section = await pageBuilderService.updatePostSections(data);

    return new StepResponse(section, {
      sectionId: section.id,
    });
  },
);
