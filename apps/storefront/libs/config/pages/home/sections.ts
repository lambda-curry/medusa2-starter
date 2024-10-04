import {
  createListBlock,
  createRichTextField,
  createSections,
  createTextBlock,
} from "@libs/util/content"
import {
  ContentBlockTypes,
  PageSectionType,
  ProductListContent,
  ProductListFilter,
  PageSection,
  HeroContent,
  BackgroundType,
  ImageField,
  BasePageSectionContent,
  ButtonStyleVariant,
  RichTextContent,
} from "@libs/util/medusa/types"

export const homeSections = createSections([
  {
    type: PageSectionType.HEADER,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "COFFEE & COMMUNITY",
          type: ContentBlockTypes.header,
          headerLevel: 6,
          alignment: "center",
        }),
        createTextBlock({
          text: "Discover our artisan-roasted coffee, crafted with care and delivered to your door. At Barrio, we’re more than a coffee roastery—we’re a neighborhood.",
          type: ContentBlockTypes.paragraph,
          alignment: "center",
        }),
      ]),
      actions: [
        {
          url: { value: "/products" },
          label: { value: "Discover Our Blends" },
          new_tab: false,
        },
      ],
      heading: { value: "BARRIO" },
    },
  },
  {
    type: PageSectionType.HEADER,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Building Community",
          type: ContentBlockTypes.header,
          headerLevel: 2,
          alignment: "right",
        }),
        createTextBlock({
          text: "one cup at a time",
          type: ContentBlockTypes.paragraph,
          alignment: "left",
        }),
      ]),
      actions: [],
      heading: { value: "" },
    },
  },
  {
    type: PageSectionType.HERO,
    content: {
      text: undefined,
      actions: [],
      heading: { value: "HERO COMPONENT (REMOVE)" },
      backgroundType: BackgroundType.IMAGE,
      image: {
        alt: { value: "" },
        url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:1080/height:1080/aHR0cHM6Ly9tYXJrZXRoYXVzLnMzLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3NlZWQtcHJvZHVjdHMvY29mZmVlLnBuZw.webp",
        width: 800,
        height: 800,
      } as ImageField,
    } as HeroContent,
  },
  {
    type: PageSectionType.RICH_TEXT,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "At Barrio, we believe a coffee roastery should be more than just a place to buy exceptional beans—it should be a gathering place, a community. In many cultures, the word “barrio” represents a neighborhood filled with connection, culture, and shared experiences. That’s the spirit we bring to every cup we roast.",
        }),
      ]),
      actions: [],
      heading: { value: "" },
    } as RichTextContent,
  },
  {
    type: PageSectionType.RICH_TEXT,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "About our products",
          type: ContentBlockTypes.header,
          headerLevel: 3,
        }),
        createListBlock({
          items: ["Responsibly Sourced", "Meticulously Roasted", "Giving Back"],
          style: "unordered",
        }),
      ]),
      actions: [],
      heading: { value: "" },
    } as RichTextContent,
  },
  {
    type: PageSectionType.PRODUCT_CAROUSEL,
    content: {
      text: undefined,
      actions: [
        {
          url: { value: "/products" },
          label: { value: "Shop Now " },
          new_tab: false,
        },
      ],
      heading: { value: "Our Blends (Carousel)" },
      filters: {
        category_id: [],
        collection_id: [],
      } as ProductListFilter,
    } as ProductListContent,
  },
  {
    type: PageSectionType.IMAGE_GALLERY,
    content: {
      heading: { value: "Our Blends (Gallery)" },
      spacing: 9,
      text: undefined,
      layout: "columns",
      actions: [],
      columns: 4,
      gallery: [
        {
          alt: { value: "" },
          url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:720/height:720/aHR0cHM6Ly9tZWR1c2EtcHVibGljLWltYWdlcy5zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS90ZWUtYmxhY2stZnJvbnQucG5n.webp",
          width: 800,
          height: 800,
        },
        {
          alt: { value: "" },
          url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:720/height:720/aHR0cHM6Ly9tZWR1c2EtcHVibGljLWltYWdlcy5zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9zd2VhdHNoaXJ0LXZpbnRhZ2UtZnJvbnQucG5n.webp",
          width: 800,
          height: 800,
        },
        {
          alt: { value: "" },
          url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:720/height:720/aHR0cHM6Ly9tZWR1c2EtcHVibGljLWltYWdlcy5zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9zd2VhdHBhbnRzLWdyYXktZnJvbnQucG5n.webp",
          width: 800,
          height: 800,
        },
        {
          alt: { value: "" },
          url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:720/height:720/aHR0cHM6Ly9tZWR1c2EtcHVibGljLWltYWdlcy5zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9zaG9ydHMtdmludGFnZS1mcm9udC5wbmc.webp",
          width: 800,
          height: 800,
        },
      ],
    },
  },
  {
    type: PageSectionType.HERO,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "SUBSCRIBE & SAVE",
          type: ContentBlockTypes.header,
          headerLevel: 6,
          alignment: "center",
        }),
        createTextBlock({
          text: "Sit back, let us take care of your coffee",
          alignment: "center",
          type: ContentBlockTypes.header,
          headerLevel: 3,
        }),
        createListBlock({
          items: ["Choose your coffee", "Choose a frequency", "enjoy :)"],
          style: "unordered",
          alignment: "center",
        }),
      ]),
      image: {
        alt: { value: "" },
        url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:1440/height:0/aHR0cHM6Ly9pbWFnZXMudW5zcGxhc2guY29tL3Bob3RvLTE2NTU3MjcwMTAwMTQtYzJkMDVkZThhY2VhP2Nyb3A9ZW50cm9weSZjcz1zcmdiJmZtPWpwZyZpeGlkPU0zdzJNell5TWpkOE1Id3hmSE5sWVhKamFId3lmSHhCYldGNmFXNW5KVEl3Y0hKdlpIVmpkSE44Wlc1OE1IeDhmSHd4TnpJMk9EVXpNVEV4ZkRBJml4bGliPXJiLTQuMC4zJnE9ODU.webp",
        width: 800,
        height: 800,
      } as ImageField,
      backgroundType: BackgroundType.IMAGE,
      actions: [
        {
          url: { value: "/products" },
          label: { value: "Get your coffee" },
          style_variant: ButtonStyleVariant.PRIMARY,
          new_tab: false,
        },
      ],
      heading: { value: "" },
    },
  },
  {
    type: PageSectionType.HEADER,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "The Art of Roasting",
          type: ContentBlockTypes.header,
          headerLevel: 3,
        }),
        createTextBlock({
          text: "at Barrio",
          type: ContentBlockTypes.header,
          headerLevel: 3,
        }),
        createTextBlock({
          text: "at Crafting with Care",
          type: ContentBlockTypes.header,
          headerLevel: 3,
        }),
      ]),
      actions: [],
      heading: { value: "" },
    },
  },
  {
    type: PageSectionType.HERO,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: `At Barrio, our roasting process is a carefully honed craft, combining traditional techniques with a modern, sustainable approach. Each batch of coffee is roasted in small quantities to ensure precise control over every stage of the process, allowing the unique characteristics of the beans to shine through.`,
        }),
        createTextBlock({
          text: `We start by selecting high-quality, ethically sourced beans from farmers who share our commitment to sustainability and community. The roasting process begins with a slow, even heat that coaxes out the natural flavors, developing rich aromas and deep, complex profiles. Every bean undergoes a transformation, revealing its distinct notes—whether it's the bright acidity of a light roast, the balanced sweetness of a medium roast, or the bold, rich depth of a dark roast.`,
        }),
        createTextBlock({
          text: `Our goal is to honor the origin of each coffee, preserving its natural flavors while adding our own touch of expertise. The result? A perfectly roasted coffee that reflects the heart of our community—vibrant, diverse, and full of life. At Barrio, every roast tells a story, and every cup connects you to the hands that nurtured it.`,
        }),
      ]),
      backgroundType: BackgroundType.IMAGE,
      image: {
        alt: { value: "" },
        url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:1080/height:1080/aHR0cHM6Ly9tYXJrZXRoYXVzLnMzLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3NlZWQtcHJvZHVjdHMvY29mZmVlLnBuZw.webp",
        width: 800,
        height: 800,
      } as ImageField,
      actions: [],
      heading: { value: "" },
    },
  },
  {
    type: PageSectionType.PRODUCT_GRID,
    content: {
      heading: { value: "Ship, Share, & Connect Cover Coffee" },
      filters: {},
    },
  },
])
