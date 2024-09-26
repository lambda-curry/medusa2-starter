import { HeadersFunction, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { createMedusaClient } from "@libs/util/server/client.server"
import { imageProxyURL } from "@utils/img-proxy"
import { defaultHeaders } from "@utils/defaultHeaders"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // const client = await createMedusaClient({ request });
  // const { site_settings } = await client.siteSettings.retrieve();

  // return redirect(
  //     ? imageProxyURL(site_settings.favicon?.url, { context: 'tiny_square' })
  //     : '/assets/markethaus.png',
  //   { status: 302 }
  // );
  return redirect("/assets/markethaus.png", { status: 302 })
}
