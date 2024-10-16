import { Cookie } from '@remix-run/node';
import { authCookie } from './auth.server';

export async function setCookie(headers: Headers, cookie: Cookie | string, value: string) {
  return headers.append(
    'set-cookie',
    typeof cookie === 'string'
      ? `${cookie}=${value}; Max-Age=604800; path=/;`
      : await cookie.serialize(value, { maxAge: 604_800, path: '/' }),
  );
}

export async function destroyCookie(headers: Headers, cookie: Cookie | string) {
  return headers.append(
    'set-cookie',
    typeof cookie === 'string'
      ? `${cookie}=; Max-Age=0; path=/;`
      : await cookie.serialize('', { maxAge: 0, path: '/' }),
  );
}

export async function getCookie(headers: Headers, cookie: Cookie | string) {
  return typeof cookie === 'string'
    ? (parseCookie(headers.get('Cookie'))[cookie] as string)
    : ((await cookie.parse(headers.get('Cookie'))) as string);
}

export function parseCookie(str: string | null) {
  if (!str) return {};
  return (str || '')
    .split(';')
    .map((v) => v.split('='))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {} as Record<string, string>,
    );
}

// Medusa cookie helpers

export const setAuthToken = async (headers: Headers, token: string) => {
  setCookie(headers, authCookie, token);
};

export const removeAuthToken = (headers: Headers) => {
  destroyCookie(headers, authCookie);
};

export const getCartId = (headers: Headers) => {
  return getCookie(headers, '_medusa_cart_id');
};

export const getSelectedRegionId = (headers: Headers) => {
  return getCookie(headers, '_medusa_region_id');
};

export const setSelectedRegionId = async (headers: Headers, regionId: string) => {
  await setCookie(headers, '_medusa_region_id', regionId);
};

export const setCartId = async (headers: Headers, cartId: string) => {
  await setCookie(headers, '_medusa_cart_id', cartId);
};

export const removeCartId = async (headers: Headers) => {
  await destroyCookie(headers, '_medusa_cart_id');
};
