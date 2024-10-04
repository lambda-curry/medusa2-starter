import {
  createListBlock,
  createRichTextField,
  createSections,
  createTextBlock,
} from "@libs/util/content"
import { ContentBlockTypes, PageSectionType } from "@libs/util/medusa/types"

export const termsAndConditionsSections = createSections([
  {
    type: PageSectionType.RICH_TEXT,
    content: {
      text: createRichTextField([
        createTextBlock({
          text: "Terms and Conditions",
          type: ContentBlockTypes.header,
        }),
        createTextBlock({
          text: "Last updated: [Date]",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "Welcome to Barrio! By accessing or using our website and services, you agree to be bound by the following terms and conditions.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "1. General",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "These Terms and Conditions govern your use of our website and the purchase of goods from [Store Name]. By accessing the site or purchasing from us, you agree to be bound by these Terms.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "2. Products and Pricing",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "All prices are listed in [Currency] and are subject to change without notice. We reserve the right to modify or discontinue products at any time without prior notice.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "3. Payment",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "We accept the following payment methods:",
          type: ContentBlockTypes.paragraph,
        }),
        createListBlock({
          items: ["Credit/Debit Cards", "Stripe", "PayPal"],
        }),
        createTextBlock({
          text: "All payments must be made in full at the time of purchase.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "4. Shipping and Delivery",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "We ship to [Countries]. Shipping costs and estimated delivery times will be provided at checkout. [Store Name] is not responsible for delays caused by shipping carriers.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "5. Returns and Refunds",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "We accept returns within [X] days of purchase. Items must be in their original condition and packaging. To initiate a return, please contact us at [Email Address]. Refunds will be processed within [X] business days upon receiving the returned item.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "6. Limitation of Liability",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "[Store Name] is not liable for any damages resulting from the use or inability to use our website or products. We are not responsible for any indirect, incidental, or consequential damages.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "7. Privacy Policy",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "Your privacy is important to us. Please review our [Privacy Policy] to understand how we collect, use, and protect your personal information.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "8. Changes to Terms",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "We reserve the right to update these Terms and Conditions at any time. Any changes will be posted on this page with the updated date.",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "9. Governing Law",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "These Terms and Conditions are governed by the laws of [Your Country/State].",
          type: ContentBlockTypes.paragraph,
        }),
        createTextBlock({
          text: "10. Contact Us",
          type: ContentBlockTypes.header,
          headerLevel: 2,
        }),
        createTextBlock({
          text: "For questions regarding these Terms, please contact us at:",
          type: ContentBlockTypes.paragraph,
        }),
        createListBlock({
          items: ["Email: [Your Email]", "Address: [Your Business Address]"],
        }),
      ]),
    },
  },
])
