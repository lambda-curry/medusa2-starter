import { authCookie } from './auth.server';
import { getCookie } from './cookies.server';

export const checkRequestAuthentication = async (request: Request) => {
  const authHeader = await getCookie(request.headers, authCookie);
  return !!authHeader;
};
