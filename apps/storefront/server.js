// Production server. Mirrors `react-router-serve`, but trusts the hosting proxy's
// X-Forwarded-* headers. Railway terminates TLS and forwards plain HTTP, so without
// `trust proxy` React Router sees an http:// request URL, the https:// Origin header
// doesn't match, and its CSRF check rejects every action (add to cart, region, etc.).
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

// Like react-router-serve, default to production. This has to happen before React loads,
// so the request handler and the build are imported dynamically below.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

const { createRequestHandler } = await import('@react-router/express');

const BUILD_PATH = './build/server/index.js';
const port = Number.parseInt(process.env.PORT || '3000', 10);

const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(compression());

app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));
app.use(express.static('build/client'));
app.use(express.static('public', { maxAge: '1h' }));

app.use(morgan('tiny'));

app.all(
  '/{*splat}',
  createRequestHandler({
    build: await import(BUILD_PATH),
    mode: process.env.NODE_ENV,
  }),
);

const onListen = () => console.log(`[storefront] http://localhost:${port}`);

const server = process.env.HOST ? app.listen(port, process.env.HOST, onListen) : app.listen(port, onListen);

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => server.close(console.error));
}
