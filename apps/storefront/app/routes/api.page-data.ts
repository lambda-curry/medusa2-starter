import { buildObjectFromSearchParams } from '@libs/util/buildObjectFromSearchParams';
import { BasePageSection } from '@libs/util/medusa/types';
import { getProductListData } from '@libs/util/server/page.server';
import { LoaderFunctionArgs, unstable_data as data } from '@remix-run/node';

export enum SectionDataAction {
  productList = 'productList',
}

export type PostData = Record<BasePageSection['id'], any>;

const productList = async ({
  request,
}: Pick<LoaderFunctionArgs, 'request'>) => {
  const result = await getProductListData(request);
  return data(result, {});
};

const loaders = {
  productList,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const { subloader, data } = buildObjectFromSearchParams<{
    subloader: keyof typeof loaders;
    data: string;
  }>(url.searchParams);

  const _loader = loaders[subloader];

  if (!_loader)
    throw new Error(`Action handler not found for "${subloader}" loader.`);

  const parsedData = JSON.parse(data);

  return await _loader({ request });
};
