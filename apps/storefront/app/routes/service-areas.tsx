import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Container } from '@app/components/common/container';
import Hero from '@app/components/sections/Hero';
import { ButtonStyleVariant } from '@libs/types';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = () => [
  { title: 'Private Chef Service Areas: Park City & Salt Lake City | Chef Luis Velez' },
  {
    name: 'description',
    content:
      'Chef Luis Velez serves Park City, Salt Lake City, and surrounding areas with private dinners, vacation-rental meals, cooking classes, and buffet-style events.',
  },
  { property: 'og:title', content: 'Park City & Salt Lake City Private Chef | Chef Luis Velez' },
  {
    property: 'og:description',
    content:
      'Personalized private dining for homes, vacation rentals, retreats, and celebrations in Park City, Salt Lake City, and surrounding areas.',
  },
  { property: 'og:type', content: 'website' },
];

const serviceAreaSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Chef Luis Velez',
  url: 'https://chefvelez.com/service-areas',
  description: 'Private chef serving Park City, Salt Lake City, and surrounding areas in Utah.',
  areaServed: [
    { '@type': 'City', name: 'Park City', containedInPlace: { '@type': 'State', name: 'Utah' } },
    { '@type': 'City', name: 'Salt Lake City', containedInPlace: { '@type': 'State', name: 'Utah' } },
  ],
  makesOffer: [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private plated dinners' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cooking classes' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Buffet-style events' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Vacation-rental meals' } },
  ],
};

const primaryAreas = [
  {
    id: 'park-city',
    eyebrow: 'Park City',
    title: 'Private Chef for Park City Homes and Vacation Rentals',
    description:
      'Enjoy a personalized dinner at your vacation home after a day on the slopes, gather friends for a birthday, or share a chef-prepared meal during a retreat. Chef Luis brings private dining to your Park City gathering.',
    details: [
      'Vacation-rental meals',
      'Ski vacation dinners',
      'Retreat and celebration menus',
      'Hands-on cooking classes',
    ],
  },
  {
    id: 'salt-lake-city',
    eyebrow: 'Salt Lake City',
    title: 'Private Chef in Salt Lake City',
    description:
      'Bring your guests together over a custom menu at home. Chef Luis serves Salt Lake City with private plated dinners, interactive cooking classes, and buffet-style events for celebrations and group gatherings.',
    details: ['In-home plated dinners', 'Cooking classes', 'Buffet-style gatherings', 'Personalized celebration menus'],
  },
];

const nearbyAreas = [
  {
    name: 'Around Park City',
    description:
      'Private chef experiences for homes, vacation rentals, and gatherings in Park City and surrounding areas.',
  },
  {
    name: 'Around Salt Lake City',
    description: 'Private dinners, cooking classes, and buffet-style events in Salt Lake City and surrounding areas.',
  },
];

const faqItems = [
  {
    question: 'What areas does Chef Luis Velez serve?',
    answer:
      'Chef Luis serves Park City, Salt Lake City, and surrounding areas in Utah. Include your event location in your request so he can help plan the experience.',
  },
  {
    question: 'Can I book a private chef for a Park City vacation rental?',
    answer:
      'Yes. Chef Luis offers vacation-rental meals for ski vacations, retreats, birthdays, anniversaries, and group gatherings in Park City and surrounding areas.',
  },
  {
    question: 'What private chef services are available in Salt Lake City?',
    answer:
      'Private plated dinners, vacation-rental meals, cooking classes, and buffet-style events are available in Salt Lake City and surrounding areas.',
  },
  {
    question: 'How do I request a private chef experience?',
    answer:
      'Browse the menus and send an event request with your date, location, guest count, and preferred experience. Chef Luis will follow up to discuss your menu and event details.',
  },
];

export default function ServiceAreasRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaSchema) }} />

      <Container className="!px-0 py-0 sm:!p-16">
        <Hero
          className="min-h-[360px] sm:min-h-[390px] lg:min-h-[420px] !max-w-full bg-accent-50 sm:rounded-3xl px-6 py-10 sm:p-10 md:p-16 lg:p-20"
          content={
            <div className="text-center w-full space-y-6 md:space-y-8">
              <p className="text-base md:text-2xl font-italiana tracking-wider">SERVICE AREAS</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-italiana tracking-wider [text-shadow:_1px_1px_2px_rgb(0_0_0_/_30%)]">
                Private Chef in Park City and Salt Lake City
              </h1>
              <p className="mx-auto text-base md:text-xl lg:text-2xl !leading-normal max-w-4xl">
                Chef Luis Velez serves private dinners, vacation-rental meals, cooking classes, and buffet-style events
                throughout Park City, Salt Lake City, and surrounding areas.
              </p>
            </div>
          }
          actionsClassName="!flex-row w-full justify-center !font-base"
          actions={[
            { label: 'Request an Event', url: '/request' },
            { label: 'View Menus', url: '/menus' },
          ]}
        />
      </Container>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {primaryAreas.map((area) => (
            <section key={area.id} id={area.id} className="space-y-6 scroll-mt-28">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-widest text-accent-700 font-semibold">{area.eyebrow}</p>
                <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">{area.title}</h2>
                <p className="text-lg leading-relaxed text-primary-700">{area.description}</p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-primary-700">
                {area.details.map((detail) => (
                  <li key={detail} className="border border-accent-100 bg-white px-4 py-3 rounded-lg">
                    {detail}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>

      <Container className="py-12 lg:py-20 bg-gray-50 sm:!px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-accent-700 font-semibold">Nearby Areas</p>
            <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">Serving Surrounding Areas</h2>
            <p className="text-lg leading-relaxed text-primary-700">
              Planning an event near Park City or Salt Lake City? Share the location and your preferred experience when
              requesting a date so Chef Luis can help plan your gathering.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nearbyAreas.map((area) => (
              <div key={area.name} className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-xl font-semibold text-primary-900">{area.name}</h3>
                <p className="mt-2 text-primary-700">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <div className="text-center mb-10">
          <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">Service Area Questions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((faq) => (
            <section key={faq.question} className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-primary-900 mb-3 text-lg">{faq.question}</h3>
              <p className="text-primary-700 leading-relaxed">{faq.answer}</p>
            </section>
          ))}
        </div>
      </Container>

      <Container className="pb-20 sm:!px-16">
        <div className="text-center bg-accent-50 rounded-2xl p-8 md:p-12">
          <h2 className="font-italiana text-4xl md:text-5xl text-white mb-4">Planning a Private Dinner?</h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
            Send the event date, location, guest count, and style of experience. Chef Luis will review availability and
            help shape the right menu for the occasion.
          </p>
          <ActionList
            actions={[
              { label: 'Request Your Event', url: '/request', style_variant: ButtonStyleVariant.PRIMARY },
              { label: 'Browse Menus', url: '/menus' },
            ]}
            className="flex-col gap-4 sm:flex-row sm:justify-center"
          />
        </div>
      </Container>
    </>
  );
}
