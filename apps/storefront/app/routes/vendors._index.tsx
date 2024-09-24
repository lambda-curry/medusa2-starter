import { PageHeading } from '@ui-components/content/PageHeading';
import { CardGrid } from '@components/card';
import { Container } from '@components/container';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { withPaginationParams } from '@marketplace/util/remix/withPaginationParams';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { VendorCard } from '../components/cards/VendorCard';
import { PaginationWithContext } from '@components/src/Pagination/pagination-with-context';
import { Vendor } from '@marketplace/util/medusa';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { limit, offset } = withPaginationParams({ request });

  const { vendors, count } = await client.vendors.list({ limit, offset });

  return { vendors, count, limit, offset };
};

export default function VendorDetailRoute() {
  const { vendors, count, limit, offset } = useLoaderData<typeof loader>();

  return (
    <Container className="py-12">
      <PageHeading className="text-center">Vendors</PageHeading>

      <CardGrid className="items-stretch">
        {vendors.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor as Vendor} />
        ))}
      </CardGrid>

      <PaginationWithContext
        context="vendors"
        paginationConfig={{
          count,
          limit,
          offset,
        }}
      />
    </Container>
  );
}
