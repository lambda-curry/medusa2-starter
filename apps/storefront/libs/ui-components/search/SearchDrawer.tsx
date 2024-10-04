import { Dialog, Transition } from "@headlessui/react"
import ArrowUpIcon from "@heroicons/react/24/solid/ArrowUpIcon"
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon"
import { Await, Link, UIMatch, useMatches } from "@remix-run/react"
import { withYup } from "@remix-validated-form/with-yup"
import clsx from "clsx"
import {
  Fragment,
  Suspense,
  useRef,
  type FC,
  type PropsWithChildren,
} from "react"
import * as Yup from "yup"
import type { getRootLoader } from "@libs/util/server/root.server"
import { useKeyPress } from "../hooks/useKeypress"
import { useRegion } from "../hooks/useRegion"
import { useSearch } from "../hooks/useSearch"
import { ProductPriceRange } from "../product/ProductPriceRange"
import { IconButton } from "@ui-components/common/buttons/IconButton"
import { Container } from "@ui-components/common/container/Container"
import { Form } from "@ui-components/common/forms/Form"
import { FieldText } from "@ui-components/common/forms/fields/FieldText"
import { Image } from "@ui-components/common/images/Image"
import {
  PricedProduct,
  ProductCategory,
  ProductCollection,
  ProductTag,
} from "@libs/util/medusa/types"

export const searchFormValidator = withYup(
  Yup.object().shape({ search: Yup.string() }),
)

const SearchDrawerInternal: FC<
  PropsWithChildren<{
    initial?: {
      products?: PricedProduct[]
      collections?: ProductCollection[]
      categories?: ProductCategory[]
      tags?: ProductTag[]
    }
  }>
> = ({ initial }) => {
  const {
    search,
    searchFetcher,
    toggleSearchDrawer,
    handleSearchChange,
    clearSearch,
    searchTerm,
  } = useSearch()

  const { region } = useRegion()

  const searchInputRef = useRef<HTMLInputElement>(null)

  useKeyPress(["/", "?"], () => toggleSearchDrawer(true))

  const getSearchTerm = () => {
    if (typeof window !== "undefined") {
      const searchTerm = new URLSearchParams(window.location.search).get("term")
      return searchTerm || undefined
    }
    return ""
  }

  const handleClearSearch = () => {
    if (searchInputRef?.current?.value) {
      searchInputRef.current.value = ""
      searchInputRef.current.focus()
    }
    clearSearch()
  }

  const handleSearchDrawerClose = () => {
    toggleSearchDrawer(false)
    setTimeout(() => {
      clearSearch()
    }, 200)
  }

  const products = searchFetcher.data?.products || initial?.products || []
  const collections =
    searchFetcher.data?.collections || initial?.collections || []
  // const categories = searchFetcher.data?.categories || initial?.categories || [];
  // const tags = searchFetcher.data?.tags || initial?.tags || [];
  const searchTermWithResults =
    !!searchTerm &&
    searchTerm.length > 1 &&
    searchFetcher.data?.products &&
    searchFetcher.data?.products.length > 0
  const searchTermWithNoResults =
    !!searchTerm &&
    searchTerm.length > 1 &&
    searchFetcher.data?.products &&
    searchFetcher.data?.products.length === 0

  const primaryProductResults = products?.slice(0, 3)
  const secondaryProductResults = products?.slice(3, 6)

  return (
    <Transition.Root show={!!search.open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={handleSearchDrawerClose}
      >
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
            <div className="pointer-events-none fixed inset-y-0 left-0 top-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200"
                enterFrom="translate-y-[-2rem] opacity-0"
                enterTo="translate-y-0 opacity-100"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-y-0 opacity-100"
                leaveTo="translate-y-[-2rem] opacity-0"
              >
                <Dialog.Panel className="pointer-events-auto max-h-0 w-screen">
                  <div className="flex max-h-screen w-screen flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
                      <Container className="flex h-16 items-center px-4 pr-4">
                        <Form<{ search: string | undefined }>
                          className="flex w-full"
                          id="search"
                          name="search"
                          onSubmit={(data, event) => {
                            event.preventDefault()
                          }}
                          defaultValues={{ search: getSearchTerm() }}
                          autoComplete="off"
                          validator={searchFormValidator}
                        >
                          <FieldText
                            inputProps={{ ref: searchInputRef }}
                            onChange={handleSearchChange}
                            className="flex-1 pr-8 pt-1 [&_.field\_\_input]:!border-none [&_.field\_\_input]:!shadow-none [&_.field\_\_input]:!ring-0 [&_input]:!p-0 [&_input]:!text-lg"
                            name="search"
                            placeholder="Search..."
                          />
                        </Form>

                        {searchTerm && searchTerm.length > 0 && (
                          <IconButton
                            icon={XMarkIcon}
                            type="reset"
                            onClick={handleClearSearch}
                          />
                        )}

                        <IconButton
                          icon={ArrowUpIcon}
                          onClick={handleSearchDrawerClose}
                        />
                      </Container>
                    </div>
                    <Container className="relative px-4 pb-8 pt-6">
                      <div className="grid gap-x-8 gap-y-10 text-sm md:grid-cols-6">
                        <div className="md:col-span-3 xl:col-span-2">
                          <p className="relative -top-2 text-ellipsis whitespace-nowrap text-xs text-gray-400">
                            {(!searchTerm || searchTerm.length <= 1) &&
                              "Popular items"}
                            {searchTermWithResults &&
                              `Results for "${searchTerm}"`}
                            {searchTermWithNoResults &&
                              `No results for "${searchTerm}"`}
                          </p>
                          <div className="grid grid-cols-2 grid-rows-1 gap-8 text-sm">
                            {primaryProductResults &&
                              primaryProductResults.map(
                                (product, productIndex) => (
                                  <div
                                    key={product.id}
                                    className={clsx(
                                      productIndex === 0
                                        ? "aspect-w-2 col-span-2"
                                        : "",
                                      "aspect-w-1 aspect-h-1 group relative overflow-hidden rounded-md bg-gray-100",
                                    )}
                                  >
                                    <Image
                                      loading="lazy"
                                      src={product.thumbnail || ""}
                                      alt={""}
                                      className="object-cover object-center group-hover:opacity-75"
                                    />
                                    <div className="flex flex-col justify-end">
                                      <div className="bg-white bg-opacity-60 p-4 text-sm">
                                        <Link
                                          onClick={handleSearchDrawerClose}
                                          prefetch="intent"
                                          to={`/products/${product.handle}`}
                                          className="font-bold text-gray-900"
                                        >
                                          <span
                                            className="absolute inset-0"
                                            aria-hidden="true"
                                          />
                                          {product.title}
                                        </Link>
                                        <p
                                          aria-hidden="true"
                                          className="mt-0.5 text-gray-700 sm:mt-1"
                                        >
                                          <ProductPriceRange
                                            product={product as PricedProduct}
                                            currencyCode={region.currency_code}
                                          />
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                          </div>
                        </div>

                        <div className="grid gap-x-8 gap-y-10 text-sm text-gray-500 md:col-span-3 lg:grid-cols-2 xl:col-span-4">
                          {secondaryProductResults &&
                            secondaryProductResults.length > 0 && (
                              <div className="hidden py-4 lg:block">
                                {secondaryProductResults.map((product) => (
                                  <div
                                    key={product.id}
                                    className={clsx(
                                      "aspect-w-3 aspect-h-2 group relative mb-6 overflow-hidden rounded-md bg-gray-100 last:mb-0",
                                    )}
                                  >
                                    <Image
                                      loading="lazy"
                                      src={product.thumbnail || ""}
                                      alt={""}
                                      className="object-cover object-center group-hover:opacity-75"
                                    />
                                    <div className="flex flex-col justify-end">
                                      <div className="bg-white bg-opacity-60 p-4 text-sm">
                                        <Link
                                          onClick={handleSearchDrawerClose}
                                          prefetch="intent"
                                          to={`/products/${product.handle}`}
                                          className="font-bold text-gray-900"
                                        >
                                          <span
                                            className="absolute inset-0"
                                            aria-hidden="true"
                                          />
                                          {product.title}
                                        </Link>
                                        <p
                                          aria-hidden="true"
                                          className="mt-0.5 text-gray-700 sm:mt-1"
                                        >
                                          <ProductPriceRange
                                            product={product as PricedProduct}
                                            currencyCode={region.currency_code}
                                          />
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          <div className="pt-3.5">
                            <div className="col-span-3 space-y-4">
                              {collections && collections.length > 0 && (
                                <div>
                                  <p className="font-bold">Collections</p>
                                  {collections.map((collection) => (
                                    <ul key={collection.id}>
                                      <li className="mt-2 text-lg">
                                        <Link
                                          onClick={handleSearchDrawerClose}
                                          prefetch="intent"
                                          to={`/collections/${collection.handle}`}
                                          className="hover:underline"
                                        >
                                          {collection.title}
                                        </Link>
                                      </li>
                                    </ul>
                                  ))}
                                </div>
                              )}
                              {/* {categories && categories.length > 0 && (
                                <div>
                                  <p className="font-bold">Categories</p>
                                  {categories.map(category => (
                                    <ul key={category.id}>
                                      <li className="mt-2 text-lg">
                                        <Link
                                          onClick={handleSearchDrawerClose}
                                          prefetch="intent"
                                          to={`/categories/${category.handle}`}
                                          className="hover:underline"
                                        >
                                          {category.name}
                                        </Link>
                                      </li>
                                    </ul>
                                  ))}
                                </div>
                              )} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Container>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export const SearchDrawer = () => {
  const matches = useMatches()
  const rootMatch = matches[0] as UIMatch<typeof getRootLoader>

  return (
    <Suspense>
      <Await resolve={rootMatch.data.searchPromise}>
        {(search) => <SearchDrawerInternal initial={search as any} />}
      </Await>
    </Suspense>
  )
}
