import { type FC, Fragment } from 'react';
import clsx from 'clsx';
import { Dialog, Transition } from '@headlessui/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useSiteDetails } from '@app/hooks/useSiteDetails';
import { IconButton } from '@app/components/common/buttons';
import { URLAwareNavLink } from '@app/components/common/link';

export interface HeaderSideNavProps {
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  activeSection?: string | null;
}

export const HeaderSideNav: FC<HeaderSideNavProps> = ({ open, setOpen, activeSection }) => {
  const { headerNavigationItems } = useSiteDetails();

  return (
    <Transition.Root show={!!open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-300 bg-opacity-50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-bold text-gray-900">Navigation</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <IconButton
                            icon={XMarkIcon}
                            onClick={() => setOpen(false)}
                            className="-m-2"
                            aria-label="Close panel"
                          />
                        </div>
                      </div>

                      {!!headerNavigationItems?.length && (
                        <div className="flex flex-grow flex-col overflow-y-auto pb-4">
                          <div className="mt-5 flex flex-grow flex-col">
                            <nav className="flex-1 space-y-1" aria-label="Sidebar">
                              {headerNavigationItems.map(({ id, new_tab, ...navItemProps }) => (
                                <URLAwareNavLink
                                  key={id}
                                  {...navItemProps}
                                  newTab={new_tab}
                                  onClick={() => setOpen(false)}
                                  className={({ isActive }) =>
                                    clsx(
                                      'group flex items-center rounded-md px-4 py-3 text-sm font-normal',
                                      isActive &&
                                        (!navItemProps.url.includes('#') ||
                                          activeSection === navItemProps.url.split('#')[1].split('?')[0])
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    )
                                  }
                                  prefetch="intent"
                                >
                                  <span className="flex-1">{navItemProps.label}</span>
                                </URLAwareNavLink>
                              ))}
                            </nav>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
