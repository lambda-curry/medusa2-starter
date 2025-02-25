import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { useCart } from '@app/hooks/useCart';
import { useRegion } from '@app/hooks/useRegion';
import { ProductImageGallery } from '@app/components/product/ProductImageGallery';
import { ProductPrice } from '@app/components/product/ProductPrice';
import { ProductPriceRange } from '@app/components/product/ProductPriceRange';
import { Breadcrumb, Breadcrumbs } from '@app/components/common/breadcrumbs/Breadcrumbs';
import { Button } from '@app/components/common/buttons/Button';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { Container } from '@app/components/common/container/Container';
import { Form } from '@app/components/common/forms/Form';
import { FormError } from '@app/components/common/forms/FormError';
import { FieldGroup } from '@app/components/common/forms/fields/FieldGroup';
import { Grid } from '@app/components/common/grid/Grid';
import { GridColumn } from '@app/components/common/grid/GridColumn';
import { Share } from '@app/components/share';
import { Link, useFetcher } from '@remix-run/react';
import { withYup } from '@remix-validated-form/with-yup';
import truncate from 'lodash/truncate';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import * as Yup from 'yup';
import { ProductOptionSelectorSelect } from '@app/components/product/ProductOptionSelectorSelect';
import { LineItemActions } from '@app/routes/api.cart.line-items';
import {
  getFilteredOptionValues,
  getOptionValuesWithDiscountLabels,
  selectVariantFromMatrixBySelectedOptions,
  selectVariantMatrix,
} from '@libs/util/products';
import { useProductInventory } from '@app/hooks/useProductInventory';
import { FieldLabel } from '@app/components/common/forms/fields/FieldLabel';
import { ProductOptionSelectorRadio } from '@app/components/product/ProductOptionSelectorRadio';
import { QuantitySelector } from '@app/components/common/field-groups/QuantitySelector';
import { StoreProduct, StoreProductOptionValue, StoreProductVariant } from '@medusajs/types';
import { Validator } from 'remix-validated-form';
import { StoreProductReview, StoreProductReviewStats } from '@lambdacurry/medusa-plugins-sdk';
import { ProductReviewStars } from '@app/components/reviews/ProductReviewStars';

export interface AddToCartFormValues {
  productId: string;
  quantity?: number;
  options: {
    [key: string]: string;
  };
}

export const getAddToCartValidator = (product: StoreProduct): Validator<AddToCartFormValues> => {
  const optionsValidation = product.options!.reduce(
    (acc, option) => {
      if (!option.id) return acc;

      acc[option.id] = Yup.string().required(`${option.title} is required`);

      return acc;
    },
    {} as { [key: string]: Yup.Schema<string> },
  );

  const schemaShape: Record<keyof AddToCartFormValues, Yup.AnySchema> = {
    productId: Yup.string().required('Product ID is required'),
    quantity: Yup.number().optional(),
    options: Yup.object().shape(optionsValidation),
  };

  return withYup(Yup.object().shape(schemaShape)) as Validator<AddToCartFormValues>;
};

const getBreadcrumbs = (product: StoreProduct) => {
  const breadcrumbs: Breadcrumb[] = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: 'All Products',
      url: '/products',
    },
  ];

  if (product.collection) {
    breadcrumbs.push({
      label: product.collection.title,
      url: `/collections/${product.collection.handle}`,
    });
  }

  return breadcrumbs;
};

const ProductReviews = ({
  productReviews,
  productReviewStats,
}: { productReviews: StoreProductReview[]; productReviewStats: StoreProductReviewStats }) => {
  if (!productReviews?.length) return null;

  return (
    <div>
      {' '}
      {productReviewStats.average_rating} Stars ({productReviews.length} Reviews)
    </div>
  );
};

export interface ProductTemplateProps {
  product: StoreProduct;
  reviewsCount: number;
  reviewStats: StoreProductReviewStats;
}

const variantIsSoldOut: (variant: StoreProductVariant | undefined) => boolean = (variant) => {
  return !!(variant?.manage_inventory && variant?.inventory_quantity! < 1);
};

export const ProductTemplate = ({ product, reviewsCount, reviewStats }: ProductTemplateProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const addToCartFetcher = useFetcher<any>();
  const { toggleCartDrawer } = useCart();
  const { region } = useRegion();
  const hasErrors = Object.keys(addToCartFetcher.data?.fieldErrors || {}).length > 0;
  const isSubmitting = ['submitting', 'loading'].includes(addToCartFetcher.state);
  const validator = getAddToCartValidator(product);

  const defaultValues: AddToCartFormValues = {
    productId: product.id!,
    quantity: 1,
    options:
      product.options?.reduce(
        (acc, option) => {
          if (!option.id || !option.values?.length) return acc;
          acc[option.id] = option.values[0].value;
          return acc;
        },
        {} as Record<string, string>,
      ) || {},
  };

  const breadcrumbs = getBreadcrumbs(product);
  const currencyCode = region.currency_code;
  const [controlledOptions, setControlledOptions] = useState<Record<string, string>>(defaultValues.options);
  const selectedOptions = useMemo(
    () => product.options?.map(({ id }) => controlledOptions[id]),
    [product, controlledOptions],
  );

  const variantMatrix = useMemo(() => selectVariantMatrix(product), [product]);
  const selectedVariant = useMemo(
    () => selectVariantFromMatrixBySelectedOptions(variantMatrix, selectedOptions),
    [variantMatrix, selectedOptions],
  );

  const productSelectOptions = useMemo(
    () =>
      product.options?.map((option, index) => {
        const filteredOptionValues = getFilteredOptionValues(product, controlledOptions, option.id);
        const optionValues = option.values as unknown as (StoreProductOptionValue & {
          disabled?: boolean;
        })[];

        optionValues.forEach((optionValue) => {
          if (!filteredOptionValues.find((filteredOptionValue) => optionValue.value === filteredOptionValue.value)) {
            (optionValue as any).disabled = true;
          } else {
            (optionValue as any).disabled = false;
          }
        });

        const optionValuesWithLabels = getOptionValuesWithDiscountLabels(
          index,
          currencyCode,
          optionValues,
          variantMatrix,
          selectedOptions,
        );
        return {
          title: option.title,
          product_id: option.product_id as string,
          id: option.id,
          values: optionValuesWithLabels.map(({ value, label }) => ({
            value,
            label,
          })),
        };
      }),
    [product, controlledOptions],
  );

  const productSoldOut = useProductInventory(product).averageInventory === 0;

  const handleOptionChangeBySelect = (e: ChangeEvent<HTMLInputElement>) => {
    setControlledOptions({
      ...controlledOptions,
      [e.target.name.replace('options.', '')]: e.target.value,
    });
  };

  const handleOptionChangeByRadio = (name: string, value: string) => {
    setControlledOptions({
      ...controlledOptions,
      [name]: value,
    });
  };

  useEffect(() => {
    if (!isSubmitting && !hasErrors) {
      formRef.current?.reset();
    }
  }, [isSubmitting, hasErrors]);

  const soldOut = variantIsSoldOut(selectedVariant) || productSoldOut;

  return (
    <>
      <section className="pb-12 pt-12 xl:pt-24 min-h-screen">
        <Form<AddToCartFormValues, LineItemActions.CREATE>
          id="addToCartForm"
          formRef={formRef}
          fetcher={addToCartFetcher}
          encType="multipart/form-data"
          method="post"
          action={`/api/cart/line-items`}
          subaction={LineItemActions.CREATE}
          defaultValues={defaultValues}
          validator={validator}
          onSubmit={() => {
            toggleCartDrawer(true);
          }}
        >
          <input type="hidden" name="productId" value={product.id} />

          <Container className="px-0 sm:px-6 md:px-8">
            <Grid>
              <GridColumn>
                <div className="md:py-6">
                  <Grid className="!gap-0">
                    <GridColumn className="mb-8 md:col-span-6 lg:col-span-7 xl:pr-16 xl:pl-9">
                      <ProductImageGallery product={product} />
                    </GridColumn>

                    <GridColumn className="flex flex-col md:col-span-6 lg:col-span-5">
                      <div className="px-0 sm:px-6 md:p-10 md:pt-0">
                        <div>
                          <Breadcrumbs className="mb-6 text-primary" breadcrumbs={breadcrumbs} />

                          <header className="flex gap-4">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:tracking-tight">
                              {product.title}
                            </h1>
                            <div className="flex-1" />
                            <Share
                              itemType="product"
                              shareData={{
                                title: product.title,
                                text: truncate(product.description || 'Check out this product', {
                                  length: 200,
                                  separator: ' ',
                                }),
                              }}
                            />
                          </header>
                        </div>

                        <ProductReviewStars reviewsCount={reviewsCount} reviewStats={reviewStats} />

                        <section aria-labelledby="product-information" className="mt-4">
                          <h2 id="product-information" className="sr-only">
                            Product information
                          </h2>

                          <p className="text-lg text-gray-900 sm:text-xl flex gap-3">
                            {selectedVariant ? (
                              <ProductPrice product={product} variant={selectedVariant} currencyCode={currencyCode} />
                            ) : (
                              <ProductPriceRange product={product} currencyCode={currencyCode} />
                            )}
                          </p>
                        </section>

                        {productSelectOptions && productSelectOptions.length > 5 && (
                          <section aria-labelledby="product-options" className="product-options">
                            <h2 id="product-options" className="sr-only">
                              Product options
                            </h2>

                            <FieldGroup>
                              {productSelectOptions.map((option, optionIndex) => (
                                <ProductOptionSelectorSelect
                                  key={optionIndex}
                                  option={option}
                                  value={controlledOptions[option.id]}
                                  onChange={handleOptionChangeBySelect}
                                />
                              ))}
                            </FieldGroup>
                          </section>
                        )}

                        {productSelectOptions && productSelectOptions.length <= 5 && (
                          <section aria-labelledby="product-options" className="product-options my-6 grid gap-4">
                            <h2 id="product-options" className="sr-only">
                              Product options
                            </h2>
                            {productSelectOptions.map((option, optionIndex) => (
                              <div key={optionIndex}>
                                <FieldLabel className="mb-2">{option.title}</FieldLabel>
                                <ProductOptionSelectorRadio
                                  option={option}
                                  value={controlledOptions[option.id]}
                                  onChange={handleOptionChangeByRadio}
                                />
                              </div>
                            ))}
                          </section>
                        )}

                        <FormError />

                        <div className="my-2 flex flex-col gap-2">
                          <div className="flex items-center gap-4 py-2">
                            {!soldOut && <QuantitySelector variant={selectedVariant} />}
                            <div className="flex-1">
                              {!soldOut ? (
                                <SubmitButton className="!h-12 w-full whitespace-nowrap !text-base !font-bold">
                                  {isSubmitting ? 'Adding...' : 'Add to cart'}
                                </SubmitButton>
                              ) : (
                                <SubmitButton
                                  disabled
                                  className="pointer-events-none !h-12 w-full !text-base !font-bold opacity-50"
                                >
                                  Sold out
                                </SubmitButton>
                              )}
                            </div>
                          </div>

                          {!!product.description && (
                            <div className="mt-4">
                              <h3 className="mb-2">Description</h3>
                              <div className="whitespace-pre-wrap text-base text-primary-800">
                                {product.description}
                              </div>
                            </div>
                          )}

                          {product.categories && product.categories.length > 0 && (
                            <nav aria-label="Categories" className="mt-4">
                              <h3 className="mb-2">Categories</h3>

                              <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {product.categories.map((category, categoryIndex) => (
                                  <li key={categoryIndex}>
                                    <Button
                                      as={(buttonProps) => (
                                        <Link to={`/categories/${category.handle}`} {...buttonProps} />
                                      )}
                                      className="!h-auto whitespace-nowrap !rounded !px-2 !py-1 !text-xs !font-bold"
                                    >
                                      {category.name}
                                    </Button>
                                  </li>
                                ))}
                              </ol>
                            </nav>
                          )}

                          {product.tags && product.tags.length > 0 && (
                            <nav aria-label="Tags" className="mt-4">
                              <h3 className="mb-2">Tags</h3>

                              <ol className="flex flex-wrap items-center gap-2 text-xs text-primary">
                                {product.tags.map((tag, tagIndex) => (
                                  <li key={tagIndex}>
                                    <Button className="!h-auto whitespace-nowrap !rounded !px-2 !py-1 !text-xs !font-bold bg-accent-900 cursor-default">
                                      {tag.value}
                                    </Button>
                                  </li>
                                ))}
                              </ol>
                            </nav>
                          )}
                        </div>
                      </div>
                    </GridColumn>
                  </Grid>
                </div>
              </GridColumn>
            </Grid>
          </Container>
        </Form>{' '}
      </section>
    </>
  );
};
