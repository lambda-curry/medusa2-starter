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
        overlayOpacity="0.85"
        overlayColor="rgba(3, 105, 161, 0.7)"
        content={
          <div className="text-center w-full space-y-9">
            <h4 className="font-montserrat text-2xl">PROFESSIONAL DEVELOPMENT</h4>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-inter font-bold">360 TRAINING</h1>
            <p className="max-w-prose mx-auto text-lg font-montserrat">
              Discover our expertly designed training courses, crafted by industry professionals and delivered with
              flexibility. At 360 Training, we're more than a learning platform—we're your partner in professional
              growth.
            </p>
          </div>
        }
        actions={[
          {
            label: 'Explore Our Courses',
            url: '/categories/courses',
          },
        ]}
        image={{
          url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
          alt: '360 Training background',
        }}
      />

      <Container className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="w-full max-w-md mx-auto md:max-w-none">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60"
                loading="lazy"
                alt="Student learning"
                height={520}
                width={520}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-montserrat">Building Careers</h2>
            <p className="font-inter text-2xl sm:text-3xl lg:text-4xl mt-2 text-primary-500 font-medium">
              one skill at a time
            </p>
            <p className="mt-6 text-lg text-gray-600 font-montserrat">
              Our professional development programs are designed to help you acquire the skills you need to advance your
              career. With expert-led courses and flexible learning options, we make it easy to grow professionally at
              your own pace.
            </p>
          </div>
        </div>
      </Container>

      <Container className="p-14 pt-0">
        <Hero
          className="h-[594px]"
          backgroundClassName="rounded-3xl"
          overlayOpacity="0.8"
          overlayColor="rgba(15, 118, 110, 0.6)"
          image={{
            url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60',
            alt: 'Training classroom',
          }}
        />
      </Container>

      <Container className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center relative">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-inter font-bold flex flex-wrap justify-center md:justify-start items-baseline gap-x-3 gap-y-2 z-10 relative">
              <span className="whitespace-normal md:whitespace-nowrap">The Art of Learning</span>
              <span className="font-montserrat text-primary-500 font-medium text-[0.7em] inline-block">
                at 360 Training
              </span>
              <span className="whitespace-normal md:whitespace-nowrap">Skills for Success</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 font-montserrat">
              Our approach to learning combines proven methodologies with innovative techniques, creating an environment
              where skills development becomes second nature.
            </p>
          </div>

          <div className="order-1 md:order-2 w-full max-w-md mx-auto md:max-w-none mb-8 md:mb-0">
            <div className="rounded-lg overflow-hidden shadow-xl z-0">
              <Image
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop&q=60"
                alt="Professional development"
                height={520}
                width={520}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </Container>

      <ListItems
        itemsClassName="mb-2"
        title="About our courses"
        items={[
          {
            title: 'Expert Instructors',
            description:
              'We believe great learning happens when expert instructors share their knowledge through engaging, practical lessons.',
            image: {
              src: '/assets/images/benefit-1.png',
              alt: 'Expert Instructors',
              width: 60,
              height: 60,
            },
          },
          {
            title: 'Industry-Relevant Content',
            description:
              'Our courses are designed to address real-world challenges with current best practices and techniques that you can apply immediately in your workplace.',
            image: {
              src: '/assets/images/benefit-2.png',
              alt: 'Industry-Relevant Content',
              width: 60,
              height: 60,
            },
          },
          {
            title: 'Flexible Learning',
            description:
              'Learn at your own pace with our flexible course formats, designed to fit into your busy schedule and meet your specific learning needs.',
            image: {
              src: '/assets/images/benefit-3.png',
              alt: 'Flexible Learning',
              width: 60,
              height: 60,
            },
          },
        ]}
      />

      <ProductList
        className="!pb-[100px]"
        heading="Featured Courses"
        actions={[
          {
            label: 'View all',
            url: '/products',
          },
        ]}
      />

      <Hero
        className="pb-10 min-h-[734px] !max-w-full"
        overlayOpacity="0.85"
        overlayColor="rgba(3, 105, 161, 0.7)"
        content={
          <div className="text-center w-full space-y-9 pt-9">
            <h4 className="font-montserrat text-2xl">LEARN & GROW</h4>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-inter font-bold">
              Continuous learning for&nbsp;your&nbsp;career&nbsp;growth
            </h1>

            <ListItems
              className="text-left w-full text-black justify-between p-0"
              itemsClassName="rounded-3xl bg-highlight-900 p-10 text-sm text-white"
              useFillTitle
              items={[
                {
                  title: 'Choose your learning path',
                  description:
                    'From specialized technical skills to leadership development, or even custom learning paths for your specific career goals, we have the courses to fit your needs.',
                },
                {
                  title: 'Set your learning schedule',
                  description:
                    'Access new courses monthly, quarterly, or at whatever frequency meets your professional development timeline and learning capacity.',
                },
                {
                  title: 'Grow your career',
                  description:
                    "You've chosen your path and how often you want to learn—all that's left is to apply your new skills and watch your career opportunities expand.",
                },
              ]}
            />
          </div>
        }
        actions={[
          {
            label: 'Start learning today',
            url: '/products',
          },
        ]}
        image={{
          url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
          alt: '360 Training background',
        }}
      />

      <SideBySide
        className="p-14 md:pt-12 lg:px-24"
        left={
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="bg-cover bg-no-repeat bg-center w-full rounded-3xl h-[410px]"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60)',
              }}
            />
          </div>
        }
        right={
          <p className="text-sm h-full flex items-center justify-center">
            At 360 Training, our educational approach is a carefully crafted process, combining proven teaching
            methodologies with innovative learning technologies. Each course is developed with meticulous attention to
            detail, ensuring that learners gain practical, applicable skills they can use immediately.
            <br />
            <br />
            We start by identifying the most in-demand skills and knowledge areas across industries. Our curriculum
            development begins with input from industry experts who understand the real-world challenges professionals
            face. The learning experience is designed to be engaging and effective, developing both theoretical
            understanding and practical application.
            <br />
            <br />
            Our goal is to honor the unique learning style of each student, preserving the integrity of the material
            while making it accessible and relevant. The result? A perfectly balanced educational experience that
            reflects our commitment to excellence—comprehensive, practical, and transformative. At 360 Training, every
            course tells a story of professional growth, and every certification connects you to new career
            opportunities.
          </p>
        }
      />
      <GridCTA
        className="p-14 md:pt-28 lg:pt-24 lg:px-24"
        images={[
          {
            src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=60',
            alt: 'Professional networking',
          },
          {
            src: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&auto=format&fit=crop&q=60',
            alt: 'Career development',
          },
        ]}
        content={
          <div className="space-y-8 flex flex-col justify-center items-center bg-primary-700 bg-opacity-90 p-8 rounded-lg">
            <h4 className="text-xl font-montserrat text-white">ADVANCE YOUR CAREER</h4>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-inter font-bold text-white">
              360 TRAINING
            </h3>
            <p className="text-xl text-white">Learn, Apply & Grow Professionally</p>
            <ActionList
              actions={[
                {
                  label: 'Join Our Community',
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
