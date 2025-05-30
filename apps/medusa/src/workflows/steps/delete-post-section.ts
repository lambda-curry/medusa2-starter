import { StepResponse, createStep } from '@medusajs/workflows-sdk';

import { PAGE_BUILDER_MODULE } from '../../modules/page-builder';
import type PageBuilderService from '../../modules/page-builder/service';

export const deletePostSectionStepId = 'delete-post-section-step';

export const deletePostSectionStep = createStep(deletePostSectionStepId, async (id: string, { container }) => {
  const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

  await pageBuilderService.deletePostSections(id);

  return new StepResponse({ id });
});
