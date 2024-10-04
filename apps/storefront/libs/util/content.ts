import {
  ContentBlock,
  ContentBlockTypes,
  PageSection,
  TranslatableRichTextField,
} from "./medusa/types"

export const createTextBlock = ({
  text,
  type = ContentBlockTypes.paragraph,
  alignment = "left",
  headerLevel = 1,
}: {
  text: string
  type?: ContentBlockTypes.paragraph | ContentBlockTypes.header
  headerLevel?: 1 | 2 | 3 | 4 | 5 | 6
  alignment?: "left" | "center" | "right"
}): Omit<ContentBlock, "id"> => ({
  data: {
    text,
    ...(type === ContentBlockTypes.header ? { level: headerLevel } : {}),
  },
  type,
  tunes: { textAlign: { alignment } },
})

export const createListBlock = ({
  items,
  style = "unordered",
  alignment = "left",
}: {
  items: string[]
  style?: "unordered" | "ordered"
  alignment?: "left" | "center" | "right"
}): Omit<ContentBlock, "id"> => ({
  data: {
    items: items.map((content) => ({ content, items: [] })),
    style,
  },
  type: ContentBlockTypes.nestedList,
  tunes: { textAlign: { alignment } },
})

type AlowedContentBlocks =
  | ReturnType<typeof createTextBlock>
  | ReturnType<typeof createListBlock>

export const createRichTextField = (
  blocks: AlowedContentBlocks[],
): TranslatableRichTextField => ({
  value: {
    time: Date.now(),
    blocks: blocks.map((block, index) => ({
      ...block,
      id: `block_${index}`,
    })) as ContentBlock[],
    version: "1.0.0", // fixed version number
  },
})

export const createSections = (sections: Omit<PageSection, "id">[]) => {
  return sections.map((section, index) => ({
    ...section,
    id: `section_${index}`,
  })) as PageSection[]
}
