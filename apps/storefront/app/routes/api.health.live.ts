import { json, LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ status: "It's alive!!!" });
};
