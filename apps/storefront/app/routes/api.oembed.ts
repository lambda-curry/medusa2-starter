import { LoaderFunctionArgs } from '@remix-run/node';

// This route is used to fetch information about oEmbed URLs, such as the
// thumbnail image and provider name.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const videoURL = url.searchParams.get('url');

  try {
    if (!videoURL) throw new Error('Must provide a video URL');

    const res = await fetch(`https://noembed.com/embed?url=${videoURL}`);

    const data = await res.json();

    if (!data.thumbnail_url) throw new Error('No thumbnail found');

    const thumbnail_url: string = data.thumbnail_url
      .replace('height=100', 'height=960')
      .replace('-d_295x166', '-d_1280');

    return { thumbnail_url, provider_name: data.provider_name };
  } catch (error: any) {
    return { image: null };
  }
};
