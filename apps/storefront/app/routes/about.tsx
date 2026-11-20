import { Container } from '@app/components/common/container';
import Hero from '@app/components/sections/Hero';
import { getCommonMeta, mergeMeta } from '@libs/util/meta';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = mergeMeta(getCommonMeta, () => [
  { title: 'About Chef Luis Velez | Park City & Salt Lake City Private Chef' },
  {
    name: 'description',
    content:
      'Meet Chef Luis Velez, offering private dinners, vacation-rental meals, cooking classes, and buffet-style events in Park City, Salt Lake City, and surrounding areas.',
  },
  { property: 'og:title', content: 'About Chef Luis Velez | Park City & Salt Lake City' },
  {
    property: 'og:description',
    content: 'Personalized private chef experiences in Park City, Salt Lake City, and surrounding areas.',
  },
]);

export default function AboutChefRoute() {
  return (
    <>
      <Container className="!px-0 py-0 sm:!p-16">
        <Hero
          className="min-h-[400px] !max-w-full bg-accent-50 sm:rounded-3xl p-6 sm:p-10 md:p-[88px] md:px-[88px]"
          content={
            <div className="text-center w-full space-y-9">
              <h4 className="text-lg md:text-2xl font-italiana tracking-wider">ABOUT THE CHEF</h4>
              <h1 className="text-4xl md:text-8xl font-italiana tracking-wider [text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)]">
                Chef Velez
              </h1>
              <p className="mx-auto text-md md:text-2xl !leading-normal">
                Chef Velez is a private chef specializing in premium at-home culinary experiences—cooking classes,
                plated dinners, and buffet-style events. Serving Park City, Salt Lake City, and surrounding areas, Chef
                Velez crafts unforgettable menus using fresh, seasonal ingredients and provides a seamless,
                restaurant-quality experience in your home or vacation rental.
              </p>
            </div>
          }
          actionsClassName="!flex-row w-full justify-center !font-base"
          actions={[
            { label: 'View Menus', url: '/menus' },
            { label: 'Request an Event', url: '/request' },
          ]}
        />
      </Container>

      <Container className="pt-8 flex flex-col gap-12 sm:!px-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4 text-lg text-gray-700">
            <h2 className="font-italiana text-3xl text-gray-900">Philosophy</h2>
            <p>
              Every event is a chance to create connection through food. From intimate dinners to interactive classes, I
              design experiences that are warm, professional, and tailored to your tastes throughout Park City, Salt
              Lake City, and surrounding areas.
            </p>
          </div>
          <div className="space-y-4 text-lg text-gray-700">
            <h2 className="font-italiana text-3xl text-gray-900">Experiences</h2>
            <p>
              Choose from cooking classes, plated dinners, or buffet-style events. All ingredients and equipment are
              provided—so you can relax and enjoy.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
