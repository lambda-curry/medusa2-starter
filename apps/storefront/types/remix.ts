import { LoaderFunction } from '@remix-run/node';

export type RemixLoaderResponse<TLoader extends LoaderFunction> = Awaited<ReturnType<TLoader>>;
