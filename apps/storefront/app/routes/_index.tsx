// app/routes/_index.tsx
import * as React from 'react';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data } from 'react-router';
import { useLoaderData } from 'react-router';

import { Container } from '@app/components/common/container';
import { Image } from '@app/components/common/images/Image';
import { ChefHero } from '@app/components/chef/ChefHero';
import { FeaturedMenus } from '@app/components/chef/FeaturedMenus';
import { ExperienceTypes } from '@app/components/chef/ExperienceTypes';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { fetchMenus, type StoreMenuDTO } from '@libs/util/server/data/menus.server';
import { getMergedPageMeta } from '@libs/util/page';

export const loader = async (_args: LoaderFunctionArgs) => {
  let menus: any[] = [];

  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000));

    const menusPromise = fetchMenus({ limit: 3 });

    const menusData: any = await Promise.race([menusPromise, timeoutPromise]);

    // Trim to a safe, serializable snapshot to avoid circular/BigInt/etc.
    menus = (menusData?.menus ?? []).map((m: any) => {
      const menu = {
        id: String(m.id),
        name: String(m.name),
        thumbnail: m.thumbnail ?? null,
        created_at: m.created_at ? new Date(m.created_at).toISOString() : null,
        updated_at: m.updated_at ? new Date(m.updated_at).toISOString() : null,
        // Include courses with dishes for MenuListItem component
        courses: Array.isArray(m.courses)
          ? m.courses.slice(0, 2).map((c: any) => ({
              id: String(c.id),
              name: String(c.name),
              dishes: Array.isArray(c.dishes)
                ? c.dishes.slice(0, 3).map((d: any) => ({
                    id: String(d.id),
                    name: String(d.name),
                    description: d.description || '',
                  }))
                : [],
            }))
          : [],
        images: Array.isArray(m.images) ? m.images : [],
      };

      // Debug log for first menu to understand structure
      if (menus.length === 0) {
      }

      return menu;
    });

    // Lightweight server log (shows up in server console)
  } catch (error: any) {
    // Log full server-side error details but don't fail the page
    console.error('Index loader failed to fetch menus:', {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });

    // Provide sample menu data as fallback for deployment
    menus = [
      {
        id: 'sample-menu-1',
        name: 'Classic French Experience',
        thumbnail: '/assets/images/chef_beef_menu.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        courses: [
          {
            id: 'course-1',
            name: 'Appetizer',
            dishes: [
              { id: 'dish-1', name: 'French Onion Soup', description: 'Rich and savory' },
              { id: 'dish-2', name: 'Escargot', description: 'Traditional preparation' },
            ],
          },
          {
            id: 'course-2',
            name: 'Main Course',
            dishes: [
              { id: 'dish-3', name: 'Coq au Vin', description: 'Classic French dish' },
              { id: 'dish-4', name: 'Beef Bourguignon', description: 'Slow-cooked perfection' },
            ],
          },
        ],
        images: [],
      },
    ];
  }

  return data(
    { menus },
    {
      headers: {
        // cheap way to confirm what the route delivered (visible in browser devtools)
        'X-Index-Debug': `menus=${menus.length}`,
      },
    },
  );
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: 'Chef Luis Velez - Private Chef in Park City and Salt Lake City' },
    {
      name: 'description',
      content:
        "Transform your special occasions with Chef Luis's premium private chef experiences in Park City, Salt Lake City, and surrounding areas.",
    },
    { property: 'og:title', content: 'Chef Luis Velez - Private Chef in Park City and Salt Lake City' },
    {
      property: 'og:description',
      content:
        'Professional chef services for cooking classes, plated dinners, and buffet-style events across Park City, Salt Lake City, and surrounding areas.',
    },
    { property: 'og:type', content: 'website' },
    {
      name: 'keywords',
      content:
        'private chef Park City, private chef Salt Lake City, cooking classes, plated dinner, culinary experiences, chef services, private dining',
    },
  ];
};

function FeaturedMenusSection({ menus }: { menus: StoreMenuDTO[] }) {
  return <FeaturedMenus menus={menus} maxDisplay={3} />;
}

export default function IndexRoute() {
  const { menus } = useLoaderData<typeof loader>();

  return (
    <>
      <link
        rel="preload"
        href="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        as="image"
      />

      <ChefHero
        heading="Private Chef in Park City & Salt Lake City"
        tagline="CHEF LUIS VELEZ"
        className="h-[800px] !max-w-full -mt-[calc(var(--mkt-header-height)+3rem)] md:-mt-[calc(var(--mkt-header-height-desktop)+2rem)] pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]"
        description="Serving Park City, Salt Lake City, and surrounding areas, I craft private dinners, cooking classes, and special event menus that will wow your guests."
      />

      <Container className="py-8 text-center">
        <p className="text-lg text-primary-700">
          Personalized private dinners, vacation-rental meals, cooking classes, and buffet-style events for
          ski vacations, retreats, celebrations, and gatherings at home.
        </p>
        <a href="/service-areas" className="inline-block mt-4 underline text-primary-900">
          Explore our Park City and Salt Lake City service areas
        </a>
      </Container>

      <FeaturedMenusSection menus={menus} />

      <ExperienceTypes />

      <Container className="py-12 lg:py-24">
        {/* Mobile: show section title above the image with subtle underline */}
        <div className="lg:hidden text-center mb-6 pt-4">
          <h2 className="text-5xl font-italiana text-primary-900">Meet Chef Luis</h2>
          <div className="w-16 mx-auto mt-3 border-t-2 border-blue-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-1 lg:order-1">
            <Image
              src="/assets/images/chef_experience.jpg"
              loading="lazy"
              alt="Chef Luis Velez in his kitchen"
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
              height={500}
              width={600}
            />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-500 rounded-full opacity-20"></div>
          </div>

          <div className="order-2 lg:order-2 text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h2 className="hidden lg:block text-5xl md:text-6xl lg:text-7xl font-italiana text-primary-900">
                Meet Chef Luis
              </h2>
              <p className="text-2xl md:text-3xl lg:text-4xl font-italiana text-accent-600">Culinary Artistry</p>
            </div>

            {/* Unified first-person copy across breakpoints */}
            <div className="space-y-4 text-primary-700">
              <p className="text-lg leading-relaxed">
                With over 20 years of culinary experience, I’ve honed my craft under Michelin‑starred chefs. For the
                past decade, I’ve excelled as a private chef, creating exquisite dining experiences for some of the most
                renowned and respected figures in the industry.
              </p>
              <p className="text-base leading-relaxed">
                My dedication to the culinary arts is evident in my mastery of various cooking techniques and my deep
                understanding of culinary concepts, including food microbiology. I bring a passion for food that
                transcends the ordinary, always seeking to educate and inspire those around me.
              </p>
              <p className="text-base leading-relaxed">
                I’m ready to showcase my culinary expertise—not just a chef, but a leader in the kitchen, eager to share
                my love and knowledge of all things food. Plan your next culinary experience with me and indulge in a
                journey of flavors across Park City, Salt Lake City, and surrounding areas.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="bg-accent-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-accent-700">20+ Years Experience</span>
              </div>
              <div className="bg-accent-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-accent-700">Michelin Trained</span>
              </div>
              <div className="bg-accent-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-accent-700">Local Sourcing</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="p-6 pt-0 sm:p-10">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-italiana text-gray-900 mb-4">What Our Guests Say</h3>
          <div className="w-20 mx-auto border-t-2 border-blue-500"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "Chef Luis created the most incredible anniversary dinner for us. Every course was a masterpiece, and the
              cooking class was so much fun!"
            </p>
            <div className="font-semibold text-gray-900">— Sarah &amp; Michael K.</div>
            <div className="text-sm text-gray-600">Plated Dinner Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "The cooking class was amazing! Chef Velez taught us so much and we had a blast. Can't wait to book
              another experience."
            </p>
            <div className="font-semibold text-gray-900">— Jennifer L.</div>
            <div className="text-sm text-gray-600">Cooking Class Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "Perfect for our family gathering! The buffet style worked perfectly for our group and everything was
              absolutely delicious."
            </p>
            <div className="font-semibold text-gray-900">— The Rodriguez Family</div>
            <div className="text-sm text-gray-600">Buffet Style Experience</div>
          </div>
        </div>
      </Container>

      <Container className="p-6 md:pt-28 lg:pt-24 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative order-1 lg:order-1">
            <Image
              src="/assets/images/chef_book_experience.jpg"
              alt="Guests enjoying a Chef Velez experience"
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover lg:rounded-3xl lg:w-auto lg:h-auto"
              width={600}
              height={400}
            />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-500 rounded-full opacity-20 lg:hidden"></div>
          </div>

          <div className="order-2 lg:order-2 space-y-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <h4 className="text-xl font-italiana tracking-wider">READY TO CREATE MEMORIES?</h4>
            <h3 className="text-6xl lg:text-7xl font-aboreto">Book Your Experience</h3>
            <p className="text-xl leading-relaxed">
              Transform your next special occasion into an unforgettable culinary journey. From intimate dinners to
              group celebrations, every experience is crafted with care.
            </p>
            <ActionList
              actions={[
                { label: 'Browse Our Menus', url: '/menus' },
                { label: 'Request Your Event', url: '/request' },
              ]}
              className="flex-col gap-4 lg:flex-row"
            />
          </div>
        </div>
      </Container>
    </>
  );
}

// Route-scoped ErrorBoundary so the real stack hits your server logs.
export function ErrorBoundary({ error }: { error: unknown }) {
  const e = error as any;
  console.error('IndexRoute ErrorBoundary:', {
    name: e?.name,
    message: e?.message,
    stack: e?.stack,
    cause: e?.cause,
  });

  return (
    <Container className="py-16">
      <div className="rounded-xl border p-6 bg-red-50">
        <h2 className="text-xl font-semibold mb-2">Something went wrong.</h2>
        <p className="text-sm text-red-700">
          {process.env.NODE_ENV === 'development' ? (e?.message ?? 'Unknown error') : 'Please try again in a bit.'}
        </p>
      </div>
    </Container>
  );
}
