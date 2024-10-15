import { Container } from '@app/components/common/container';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { getMergedPageMeta } from '@libs/util/page';
import Hero from '@app/components/sections/Hero';
import { Image } from '@app/components/common/images/Image';
import { ListItems } from '@app/components/sections/ListItems';
import { SideBySide } from '@app/components/sections/SideBySide';
import { GridCTA } from '@app/components/sections/GridCTA';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import ProductList from '@app/components/sections/ProductList';

export const loader = async (args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = getMergedPageMeta;

export default function IndexRoute() {
  return (
    <>
      <Hero
        className="h-[800px] !max-w-full -mt-[calc(var(--mkt-header-height)+3rem)] md:-mt-[calc(var(--mkt-header-height-desktop)+2rem)] pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]"
        content={
          <div className="text-center w-full space-y-9">
            <h4 className="font-italiana text-2xl">COFFEE & COMMUNITY</h4>
            <h1 className="text-8xl font-aboreto">BARRIO</h1>
            <p className="max-w-prose mx-auto text-lg">
              Discover our artisan-roasted coffee, crafted with care and delivered to your door. At Barrio, we’re more
              than a coffee roastery—we’re&nbsp;a&nbsp;neighborhood.
            </p>
          </div>
        }
        actions={[
          {
            label: 'Discover Our Blends',
            url: '/products',
          },
        ]}
        image={{
          url: '/assets/images/barrio-banner.png',
          alt: 'Barrio background',
        }}
      />

      <Container className="p-14 pt-60 lg:pt-24 relative flex flex-col items-center lg:flex-row">
        <div className="absolute w-80 left-4 -top-[200px] md:-top-[240px] lg:left-20 lg:w-[420px]">
          <Image src="/assets/images/header-image-1.png" alt="Barrio background" height={520} width={420} />
        </div>

        <div className="lg:w-full flex flex-col justify-center max-lg:items-center">
          <div className="w-full flex text-center lg:text-left">
            <h2 className="mx-auto lg:mx-0 lg:ml-auto text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-ballet">
              Building Community
            </h2>
          </div>
          <p className="font-italiana text-6xl lg:text-7xl mt-6 sm:mt-10 lg:mt-24">one cup at a time</p>
        </div>
      </Container>

      <Container className="p-14 pt-0">
        <Hero
          className="h-[594px]"
          backgroundClassName="rounded-3xl"
          image={{
            url: '/assets/images/banner-coffee-shop.png',
            alt: 'Barrio background',
          }}
        />
      </Container>

      <ListItems
        itemsClassName="mb-2"
        title="About our products"
        items={[
          {
            title: 'Responsibly Sourced',
            description:
              'We believe good coffee happens when great people come together to build longterm relationships.',
            image: {
              src: '/assets/images/benefit-1.png',
              alt: 'Responsibly Sourced',
              width: 60,
              height: 60,
            },
          },
          {
            title: 'Meticulously Roasted',
            description:
              'Our custom roast profiles are designed to elevate the natural beauty of our coffees - from sparkling acidity to brown sugar sweetness.',
            image: {
              src: '/assets/images/benefit-2.png',
              alt: 'Meticulously Roasted',
              width: 60,
              height: 60,
            },
          },
          {
            title: 'Giving Back',
            description:
              'Every time you buy a bag of our coffee, we donate a portion of our proceeds to our non-profit partners.',
            image: {
              src: '/assets/images/benefit-3.png',
              alt: 'Giving Back',
              width: 60,
              height: 60,
            },
          },
        ]}
      />

      <ProductList
        className="!pb-[100px]"
        heading="Our Blends"
        actions={[
          {
            label: 'View all',
            url: '/products',
          },
        ]}
      />

      <Hero
        className="pb-10 min-h-[734px] !max-w-full"
        content={
          <div className="text-center w-full space-y-9 pt-9">
            <h4 className="font-italiana text-2xl">SUBSCRIBE & SAVE</h4>
            <h1 className="text-4xl lg:text-7xl font-italiana">
              Sit back, let us take care&nbsp;of&nbsp;your&nbsp;coffee
            </h1>

            <ListItems
              className="text-left w-full text-black justify-between p-0"
              itemsClassName="rounded-3xl bg-highlight-900 p-10 text-sm"
              useFillTitle
              items={[
                {
                  title: 'Choose your coffee',
                  description:
                    'From single origin to our house blend, or even surprise offerings for the more adventurous, we have the coffee tofit your taste.',
                },
                {
                  title: 'Choose a frequency',
                  description:
                    'Receive 12 oz of our whole bean coffee weekly, every 2 weeks, every 3 weeks, or monthly—whatever frequency meets your needs.',
                },
                {
                  title: 'enjoy :)',
                  description:
                    'You’ve chosen your coffee and how often you want it delivered—all that’s left to do is sit back and relax while we do all the work.',
                },
              ]}
            />
          </div>
        }
        actions={[
          {
            label: 'Get your coffee',
            url: '/products',
          },
        ]}
        image={{
          url: '/assets/images/barrio-banner.png',
          alt: 'Barrio background',
        }}
      />

      <Container className="flex flex-col-reverse gap-8 items-center lg:items-start lg:flex-row p-14 lg:pt-24 lg:px-24 relative lg:min-h-[354px]">
        <div className="flex justify-center md:justify-end md:absolute md:-top-[30%] w-60 md:w-80 md:right-0 lg:right-20 lg:w-[420px]">
          <Image src="/assets/images/header-image-2.png" alt="Barrio background" height={520} width={420} />
        </div>

        <div className="w-full flex justify-center md:justify-start text-center md:text-left">
          <h2 className="md:w-3/5 xl:w-4/5 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-italiana">
            The Art of Roasting
            <br />
            <span className="font-ballet text-[150%]">at Barrio</span>
            <br />
            Crafting with Care
          </h2>
        </div>
      </Container>

      <SideBySide
        className="p-14 md:pt-16 lg:pt-24 lg:px-24"
        left={
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="bg-cover bg-no-repeat bg-center w-full rounded-3xl h-[410px]"
              style={{
                backgroundImage: 'url(/assets/images/coffee-shop-2.png)',
              }}
            />
          </div>
        }
        right={
          <p className="text-sm h-full flex items-center justify-center">
            At Barrio, our roasting process is a carefully honed craft, combining traditional techniques with a modern,
            sustainable approach. Each batch of coffee is roasted in small quantities to ensure precise control over
            every stage of the process, allowing the unique characteristics of the beans to shine through.
            <br />
            <br />
            We start by selecting high-quality, ethically sourced beans from farmers who share our commitment to
            sustainability and community. The roasting process begins with a slow, even heat that coaxes out the natural
            flavors, developing rich aromas and deep, complex profiles. Every bean undergoes a transformation, revealing
            its distinct notes—whether it's the bright acidity of a light roast, the balanced sweetness of a medium
            roast, or the bold, rich depth of a dark roast.
            <br />
            <br />
            Our goal is to honor the origin of each coffee, preserving its natural flavors while adding our own touch of
            expertise. The result? A perfectly roasted coffee that reflects the heart of our community—vibrant, diverse,
            and full of life. At Barrio, every roast tells a story, and every cup connects you to the hands that
            nurtured it.
          </p>
        }
      />
      <GridCTA
        className="p-14 md:pt-28 lg:pt-24 lg:px-24"
        images={[
          {
            src: '/assets/images/grid-cta-1.png',
            alt: 'Barrio background',
          },
          {
            src: '/assets/images/grid-cta-2.png',
            alt: 'Barrio background',
          },
        ]}
        content={
          <div className="space-y-8 flex flex-col justify-center items-center">
            <h4 className="text-xl font-italiana">FIND YOUR COMMUNITY</h4>
            <h3 className="text-7xl  font-aboreto">BARRIO</h3>
            <p className="text-xl">Ship, Share & Connect Over Coffee</p>
            <ActionList
              actions={[
                {
                  label: 'Subscribe for Events',
                  url: '#',
                },
              ]}
            />
          </div>
        }
      />
    </>
  );
}
