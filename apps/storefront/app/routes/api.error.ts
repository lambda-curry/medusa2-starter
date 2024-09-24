import { ActionFunction } from '@remix-run/node';

export default function Index() {
  throw new Error('Sentry Error');
}

export const action: ActionFunction = async ({ request }) => {
  throw new Error('Sentry Error');
};
