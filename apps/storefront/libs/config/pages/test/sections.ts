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

export const testSections = createSections([
  {
    type: PageSectionType.HEADER,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Explore a selection of amazing items for everyone.",
          type: ContentBlockTypes.header,
        }),
      ]),
      actions: [],
      heading: { value: "Uncover Incredible Products!!!" },
    },
  },
  {
    type: PageSectionType.IMAGE_GALLERY,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Find unique treasures that make life easier and more enjoyable.",
          type: ContentBlockTypes.paragraph,
          alignment: "left",
        }),
      ]),
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
      heading: { value: "AJ's Store Awaits You! (Image Gallery)" },
      spacing: 9,
    },
  },
  {
    type: PageSectionType.RICH_TEXT,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "At AJ's Store, we are dedicated to bringing you amazing products that enhance your life and home.",
        }),
        createTextBlock({
          text: "Whether you're looking for unique gifts or everyday essentials, we've got you covered.",
        }),
        createTextBlock({
          text: "Our mission is to provide high-quality items that you will love and treasure for years to come.",
        }),
      ]),
      actions: [],
      heading: { value: "" },
    } as RichTextContent,
  },
  {
    type: PageSectionType.HEADER,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Explore Our Unique Product Range Today!!",
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
          text: "Introducing the Bottomless Coffee Mug, designed for true coffee lovers who need their fix throughout the day! Forget refills, just enjoy uninterrupted enjoyment of your favorite brew. Perfect for busy schedules and cozy moments alike!",
        }),
        createTextBlock({
          text: "No need to worry about running low during your marathon workdays or relaxed weekends. This mug ensures you'll always have a warm cup by your side, ready to energize you!",
        }),
      ]),
      actions: [],
      heading: { value: "Endless Sips Await!!" },
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
    type: PageSectionType.HERO,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "The Endless Ice Cream Cone offers an infinite treat that's perfect for ice cream lovers. Enjoy your favorite flavors without ever running out!",
          alignment: "left",
        }),
        createTextBlock({
          text: "This imaginative creation satisfies cravings, providing joy and delight with each scoop as you indulge endlessly. It's a dessert like no other!",
          alignment: "left",
        }),
        createListBlock({
          items: [
            "Ideal for birthday parties, picnics, or any sweet tooth occasion",
            "A fun and quirky gift for ice cream enthusiasts of all ages",
            "Made with high-quality materials, ensuring a delightful experience every time.",
          ],
          style: "unordered",
        }),
      ]),
      image: {
        alt: { value: "" },
        url: "https://img.cdn.market.haus/insecure/resizing_type:fit/width:1440/height:0/aHR0cHM6Ly9pbWFnZXMudW5zcGxhc2guY29tL3Bob3RvLTE2NTU3MjcwMTAwMTQtYzJkMDVkZThhY2VhP2Nyb3A9ZW50cm9weSZjcz1zcmdiJmZtPWpwZyZpeGlkPU0zdzJNell5TWpkOE1Id3hmSE5sWVhKamFId3lmSHhCYldGNmFXNW5KVEl3Y0hKdlpIVmpkSE44Wlc1OE1IeDhmSHd4TnpJMk9EVXpNVEV4ZkRBJml4bGliPXJiLTQuMC4zJnE9ODU.webp",
        width: 800,
        height: 800,
      } as ImageField,
      backgroundType: BackgroundType.IMAGE,
      actions: [],
      heading: { value: "Endless Ice Cream Cone" },
    },
  },
  {
    type: PageSectionType.HEADER,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Looking for Something Specific? Browse Our Collection Now!!",
          type: ContentBlockTypes.header,
        }),
      ]),
      actions: [],
      heading: { value: "" },
    } as BasePageSectionContent,
  },
  {
    type: PageSectionType.PRODUCT_GRID,
    content: {
      text: undefined,
      actions: [],
      heading: { value: "Test Page - Product Grid" },
      filters: {
        category_id: [],
        collection_id: [],
      } as ProductListFilter,
    } as ProductListContent,
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
      heading: { value: "Test Page - Featured Products (Carousel)" },
      filters: {
        category_id: [],
        collection_id: [],
      } as ProductListFilter,
    } as ProductListContent,
  },
  {
    type: PageSectionType.CTA,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: 'Use code "FIRST20" for 20% off your first purchase',
        }),
      ]),
      actions: [
        {
          url: { value: "/products" },
          label: { value: "Shop Now →" },
          new_tab: false,
        },
      ],
      heading: { value: "Limited Time Offer!" },
    },
  },
  {
    type: PageSectionType.BUTTON_LIST,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Test description",
        }),
      ]),
      actions: [
        {
          url: { value: "" },
          label: { value: "1st BTN" },
          new_tab: false,
          style_variant: ButtonStyleVariant.DEFAULT,
        },
        {
          url: { value: "" },
          label: { value: "2nd BTN" },
          new_tab: false,
          style_variant: ButtonStyleVariant.DEFAULT,
        },
        {
          url: { value: "" },
          label: { value: "3rd BTN" },
          new_tab: false,
          style_variant: ButtonStyleVariant.DEFAULT,
        },
      ],
      heading: { value: "My Button List" },
    },
  },
  {
    type: PageSectionType.RAW_HTML,
    content: { html: { value: "<p>This is a RAW HTML paragraph!</p>" } },
  },
  {
    type: PageSectionType.PRODUCT_CAROUSEL,
    content: {
      text: undefined,
      actions: [{ url: { value: "" }, label: { value: "" }, new_tab: false }],
      heading: { value: "Product Carousel - Config " },
      filters: {
        category_id: [],
        collection_id: [],
      } as ProductListFilter,
    } as ProductListContent,
  },
])
