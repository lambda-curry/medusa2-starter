import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder';
import type PageBuilderService from '../../modules/page-builder/service';

export const duplicatePostSectionStepId = 'duplicate-post-section-step';

export const duplicatePostSectionStep = createStep(
  duplicatePostSectionStepId,
  async (id: string, { container }) => {
    const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

    // Get the original section
    const originalSection = await pageBuilderService.retrievePostSection(id, {
      relations: ['post'],
    });

    // Get the last section's sort order to place the new one at the end
    const sections = await pageBuilderService.listPostSections({
      post_id: originalSection.post?.id,
    });

    const lastSortOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sort_order || 0)) + 1 : 0;

    // Create a new section with the same data, but always as draft
    const newSection = await pageBuilderService.createPostSections({
      name: `${originalSection.name} (copy)`,
      status: 'draft',
      layout: originalSection.layout,
      blocks: originalSection.blocks,
      post_id: originalSection.post?.id,
      post_template_id: originalSection.post_template_id,
      sort_order: lastSortOrder,
    });

    return new StepResponse(newSection, {
      sectionId: newSection.id,
    });
  },
  async (data, { container }) => {
    if (!data) return;

    const { sectionId } = data;
    const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

    // Delete the created section if workflow fails
    await pageBuilderService.deletePostSections(sectionId);
  },
);
