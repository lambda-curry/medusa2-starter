import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder';
import type PageBuilderService from '../../modules/page-builder/service';

export const reorderPostSectionsStepId = 'reorder-post-sections-step';

export type ReorderPostSectionsStepInput = {
  post_id: string;
  section_ids: string[];
};

export const reorderPostSectionsStep = createStep(
  reorderPostSectionsStepId,
  async (data: ReorderPostSectionsStepInput, { container }) => {
    const pageBuilderService = container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE);

    // Update sort_order for each section
    await Promise.all(
      data.section_ids.map((sectionId: string, index: number) =>
        pageBuilderService.updatePostSections({
          id: sectionId,
          sort_order: index,
        }),
      ),
    );

    // Fetch the updated post with sections
    const post = await pageBuilderService.retrievePost(data.post_id, {
      relations: ['sections'],
    });

    return new StepResponse(post, {
      postId: post.id,
    });
  },
);
