import { authenticate, defineMiddlewares } from '@medusajs/framework/http';

export default defineMiddlewares({
  routes: [
    {
      // Lets an admin already signed in to the Medusa admin skip the login form.
      matcher: '/oauth/authorize',
      method: ['GET'],
      middlewares: [authenticate('user', ['session'], { allowUnauthenticated: true })],
    },
  ],
});
