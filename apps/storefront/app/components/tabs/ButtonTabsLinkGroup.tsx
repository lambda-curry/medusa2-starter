import { Tab } from '@headlessui/react';
import { URLAwareNavLink } from '@components/link';
import { TabButton } from './TabButton';
import { TabList } from './TabList';

export interface ButtonTabsLinkGroupProps {
  tabs: { id: string; title: string; href: string }[];
  selectedTabIndex: number;
  defaultHref?: string;
}

export const ButtonTabsLinkGroup = ({
  tabs,
  selectedTabIndex,
  defaultHref = '/',
}: ButtonTabsLinkGroupProps) => (
  <TabList>
    <Tab
      key="all"
      as={() => (
        <TabButton
          selected={selectedTabIndex < 0}
          as={buttonProps => (
            <URLAwareNavLink
              url={defaultHref}
              preventScrollReset={true}
              {...buttonProps}
            />
          )}
        >
          All
        </TabButton>
      )}
    />

    {tabs.map((tab, tabIndex) => (
      <Tab key={tab.id}>
        {() => (
          <TabButton
            selected={selectedTabIndex === tabIndex}
            as={buttonProps => (
              <URLAwareNavLink
                url={selectedTabIndex === tabIndex ? defaultHref : tab.href}
                preventScrollReset={true}
                {...buttonProps}
              />
            )}
          >
            {tab.title}
          </TabButton>
        )}
      </Tab>
    ))}
  </TabList>
);
