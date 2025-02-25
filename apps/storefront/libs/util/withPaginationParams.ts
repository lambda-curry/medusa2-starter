export const withPaginationParams = ({
  request,
  defaultPageSize = 10,
  prefix = '',
}: {
  request: Request;
  defaultPageSize?: number;
  prefix?: string;
}) => {
  const url = new URL(request.url);
  const searchTermKey = `${prefix}term`;
  const pageSizeKey = `${prefix}pageSize`;
  const pageKey = `${prefix}page`;
  const searchTerm = url.searchParams.get(searchTermKey);
  const pageSize = url.searchParams.get(pageSizeKey);
  const page = url.searchParams.get(pageKey);
  const limit = pageSize ? parseInt(pageSize) : defaultPageSize;
  const offset = page ? (parseInt(page) - 1) * limit : 0;

  return { url, searchTerm, pageSize, page, limit, offset, searchParams: url.searchParams };
};
