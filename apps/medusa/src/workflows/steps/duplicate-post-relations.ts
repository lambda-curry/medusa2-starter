import { StepResponse, createStep } from '@medusajs/workflows-sdk'
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder'
import type PageBuilderService from '../../modules/page-builder/service'

export const duplicatePostRelationsStepId = 'duplicate-post-relations-step'

type DuplicatePostRelationsStepInput = {
  originalId: string
  newId: string
}

export const duplicatePostRelationsStep = createStep(
  duplicatePostRelationsStepId,
  async (data: DuplicatePostRelationsStepInput, { container }) => {
    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Get the original post with all its relations
    const originalPost = await pageBuilderService.retrievePost(
      data.originalId,
      {
        relations: ['sections', 'featured_image', 'authors', 'tags'],
      },
    )

    const newPost = await pageBuilderService.retrievePost(data.newId)
    const newPostSectionsIds: string[] = []

    // Duplicate the sections since these should be unique to the post
    if (originalPost.sections?.length > 0) {
      type SectionInput = Parameters<
        typeof pageBuilderService.createPostSections
      >['0'][number]

      const sectionsToCreate: SectionInput[] = originalPost.sections.map(
        (section) => ({
          ...section,
          id: undefined,
          post_template: undefined,
          post_template_id: undefined,

          // Set the new post relation
          post: newPost.id,
          post_id: newPost.id,
        }),
      )

      const newPostSections =
        await pageBuilderService.createPostSections(sectionsToCreate)

      newPostSectionsIds.push(...newPostSections.map(({ id }) => id))
    }

    const relationsToUpdate = {
      sections: newPostSectionsIds,
      featured_image: originalPost.featured_image?.id,
      authors: originalPost.authors?.map((author) => author.id) ?? [],
      tags: originalPost.tags?.map((tag) => tag.id) ?? [],
    }

    const updatedPost = await pageBuilderService.updatePosts({
      id: newPost.id,
      ...relationsToUpdate,
    })

    return new StepResponse(updatedPost, {
      relationsUpdated: relationsToUpdate,
    })
  },
  async (data, { container }) => {
    if (!data?.relationsUpdated) return

    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    const { sections, featured_image, authors, tags } = data.relationsUpdated

    if (sections?.length) {
      await pageBuilderService.deletePostSections(sections)
    }
  },
)
