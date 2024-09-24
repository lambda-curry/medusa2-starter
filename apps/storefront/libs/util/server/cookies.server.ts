import { Cookie } from '@remix-run/node';

export async function setCookie(headers: Headers, cookie: Cookie | string, value: string) {
  return headers.append(
    'set-cookie',
    typeof cookie === 'string'
      ? `${cookie}=${value}; Max-Age=604800; path=/;`
      : await cookie.serialize(value, { maxAge: 604_800, path: '/' })
  );
}

export async function destroyCookie(headers: Headers, cookie: Cookie | string) {
  return headers.append(
    'set-cookie',
    typeof cookie === 'string' ? `${cookie}=; Max-Age=0; path=/;` : await cookie.serialize('', { maxAge: 0, path: '/' })
  );
}

export async function getCookie(headers: Headers, cookie: Cookie | string) {
  return typeof cookie === 'string'
    ? parseCookie(headers.get('Cookie'))[cookie]
    : await cookie.parse(headers.get('Cookie'));
}

export function parseCookie(str: string | null) {
  if (!str) return {};
  return (str || '')
    .split(';')
    .map(v => v.split('='))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {} as Record<string, string>
    );
}
