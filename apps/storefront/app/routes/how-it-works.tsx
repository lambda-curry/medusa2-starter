import { Container } from '@app/components/common/container/Container';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { getMergedPageMeta } from '@libs/util/page';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import clsx from 'clsx';
import type { FC } from 'react';

export const loader = async (args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: 'How It Works - Chef Luis Velez' },
    {
      name: 'description',
      content:
        'Book a private chef in Park City, Salt Lake City, and surrounding areas. Explore menus, request your event, and plan a personalized dining experience.',
    },
    { property: 'og:title', content: 'How It Works - Chef Luis Velez' },
    {
      property: 'og:description',
      content: 'Step-by-step guide to booking your personalized culinary experience with Chef Luis Velez.',
    },
    { property: 'og:type', content: 'website' },
    { name: 'keywords', content: 'how it works, booking process, private chef, culinary experience, chef services' },
  ];
};

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  timeline: string;
  icon: string;
}

const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: 'Browse & Request',
    description:
      'Explore our menu collections and choose your preferred experience type. Submit a request with your event details.',
    timeline: '5 minutes',
    icon: '🍽️',
  },
  {
    step: 2,
    title: 'Chef Review & Approval',
    description:
      "Chef Luis reviews your request and confirms availability. You'll receive a detailed proposal with menu customizations.",
    timeline: '24-48 hours',
    icon: '👨‍🍳',
  },
  {
    step: 3,
    title: 'Book & Purchase',
    description:
      'Once approved, your event becomes available for purchase. Buy tickets for your guests with secure payment processing.',
    timeline: 'Immediate',
    icon: '🎫',
  },
  {
    step: 4,
    title: 'Experience & Enjoy',
    description:
      'Chef Luis arrives at your location with all ingredients and equipment. Relax and enjoy your personalized culinary experience.',
    timeline: 'Event day',
    icon: '🎉',
  },
];

interface StepCardProps {
  step: ProcessStep;
  isLast?: boolean;
  className?: string;
}

const StepCard: FC<StepCardProps> = ({ step, isLast = false, className }) => {
  return (
    <div className={clsx('relative h-full', className)}>
      {/* Connection line to next step */}
      {!isLast && (
        <div className="hidden md:block absolute top-16 left-1/2 transform translate-x-8 w-full h-0.5 bg-gradient-to-r from-accent-500 to-gray-300 z-0" />
      )}

      <div className="relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 z-10 h-full flex flex-col">
        <div className="text-center space-y-6 flex-1 flex flex-col">
          {/* Step number and icon */}
          <div className="relative mx-auto">
            <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
              {step.step}
            </div>
            <div className="text-4xl mb-4">{step.icon}</div>
          </div>

          {/* Step title and timeline */}
          <div>
            <h3 className="text-2xl font-semibold text-primary-900 mb-2">{step.title}</h3>
            <div className="inline-block bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              {step.timeline}
            </div>
          </div>

          {/* Description */}
          <p className="text-primary-700 leading-relaxed">{step.description}</p>
        </div>
      </div>
    </div>
  );
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How far in advance should I book?',
    answer:
      "I typically recommend booking 1-2 weeks in advance, especially for weekend events. However, I'm flexible and can often accommodate shorter notice requests depending on my availability.",
  },
  {
    question: "What's included in the service?",
    answer:
      "I provide all fresh ingredients, preparation, service, and cleanup. Usually, events are at your home using your cooking utensils and equipment. However, I'm accommodating and can work with you to arrange what's needed for your specific event.",
  },
  {
    question: 'Can menus be customized?',
    answer:
      'Absolutely! I work closely with you to customize any menu based on dietary restrictions, preferences, and seasonal availability. Every event can be tailored to your vision.',
  },
  {
    question: 'What is your service area?',
    answer:
      "I serve Park City, Salt Lake City, and surrounding areas with private dinners, vacation-rental meals, cooking classes, and buffet-style events. Include your event location when you send a request.",
  },
  {
    question: 'Do you accommodate dietary restrictions?',
    answer:
      "Yes! I can accommodate most dietary restrictions including vegetarian, vegan, gluten-free, and specific allergies. Just let me know your needs when submitting your request, and I'll work with you to create the perfect menu.",
  },
  {
    question: 'What happens if I need to cancel?',
    answer:
      "Cancellation policies vary by event type and timing. Once your event is confirmed, you'll receive detailed terms and conditions. I understand things come up and I'm flexible when possible.",
  },
  {
    question: 'How does pricing work?',
    answer:
      "My pricing is transparent and per-person based: Buffet Style ($99.99), Cooking Class ($119.99), and Plated Dinner ($149.99). There is a service fee of $149.99 per event. I'm happy to discuss the details and work within your budget.",
  },
  {
    question: 'Can I add more guests after booking?',
    answer:
      "Additional guests can usually be accommodated depending on availability and venue capacity. Just contact me as soon as possible and I'll work with you to make it happen.",
  },
  {
    question: 'What equipment do you bring?',
    answer:
      "Typically, events are at your home using your existing kitchen equipment and cooking utensils. However, I'm flexible and happy to arrange what's needed based on your specific situation. Let's discuss what works best for your event.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Page Header */}
      <Container className="py-16 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-italiana text-primary-900 mb-6">How It Works</h1>
          <p className="text-xl text-primary-600 max-w-4xl mx-auto leading-relaxed">
            From browsing menus to enjoying your culinary experience, I've made the process simple and transparent.
            Here's how your culinary journey unfolds:
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {processSteps.map((step, index) => (
            <StepCard key={step.step} step={step} isLast={index === processSteps.length - 1} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-italiana text-primary-900 mb-4">Ready to Start Your Culinary Journey?</h2>
            <p className="text-primary-600 mb-6 text-lg">
              Begin by exploring my menu collections or jump straight to requesting your custom culinary experience. No
              commitments until I approve your event.
            </p>
            <ActionList
              actions={[
                {
                  label: 'Browse Menus',
                  url: '/menus',
                },
                {
                  label: 'Request Event Now',
                  url: '/request',
                },
              ]}
              className="flex-col gap-4 sm:flex-row sm:justify-center"
            />
          </div>
        </div>
      </Container>

      {/* FAQ Section */}
      <Container className="py-16 lg:py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-italiana text-primary-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-primary-600 max-w-3xl mx-auto">
            Find answers to common questions about my culinary experiences and booking process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqItems.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-primary-900 mb-3 text-lg">{faq.question}</h3>
              <p className="text-primary-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-xl p-8 max-w-xl mx-auto shadow-md">
            <h3 className="text-2xl font-italiana text-primary-900 mb-3">Still Have Questions?</h3>
            <p className="text-primary-600 mb-6">
              I'm here to help! Reach out to me directly for any specific questions about your event.
            </p>
            <ActionList
              actions={[
                {
                  label: 'Contact Me',
                  url: '/contact',
                },
                {
                  label: 'Request Consultation',
                  url: '/request',
                },
              ]}
              className="flex-col gap-3 sm:flex-row sm:justify-center"
            />
          </div>
        </div>
      </Container>
    </>
  );
}
