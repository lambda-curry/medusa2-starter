import { StepResponse, createStep } from '@medusajs/workflows-sdk';

import type { CreatePostSectionStepInput } from '../types';
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder';
import type PageBuilderService from '../../modules/page-builder/service';

export const createPostSectionStepId = 'create-post-section-step';

export const createPostSectionStep = createStep(
  createPostSectionStepId,
  async (data: CreatePostSectionStepInput, { container }) => {
    const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

    const createData: CreatePostSectionStepInput = {
      ...data,
      status: data.status || 'draft',
      layout: data.layout || 'full_width',
    };

    const section = await pageBuilderService.createPostSections(createData);

    return new StepResponse(section, {
      sectionId: section.id,
    });
  },
  async (data, { container }) => {
    if (!data) return;

    const { sectionId } = data;

    const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

    await pageBuilderService.deletePostSections(sectionId);
  },
);
