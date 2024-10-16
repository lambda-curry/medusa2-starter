import { buildObjectFromSearchParams } from '@libs/util/buildObjectFromSearchParams';
import { getProductListData } from '@libs/util/server/page.server';
import { LoaderFunctionArgs, data as remixData } from '@remix-run/node';

const productList = async ({ request }: Pick<LoaderFunctionArgs, 'request'>) => {
  const result = await getProductListData(request);
  return remixData(result, {});
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

  if (!_loader) throw new Error(`Action handler not found for "${subloader}" loader.`);

  const parsedData = JSON.parse(data);

  return await _loader({ request });
};
