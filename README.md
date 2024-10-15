# Medusa Starter with Remix Storefront

This is a starter project for an e-commerce application using Medusa as the backend and Remix as the storefront, all set up in a Turborepo monorepo structure.

## Project Overview

This monorepo includes:

- `medusa`: A Medusa backend application
- `storefront`: A Remix-based storefront application
- Shared packages and configurations

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20+
- Yarn 4.5.0
- Remix
- Docker and Docker Compose

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   yarn
   ```
3. Test the setup:
   ```
   yarn build
   ```

## Local Development Setup

1. Navigate to the `apps/medusa` folder:

   ```
   cd apps/medusa
   ```

2. Start the Docker containers:

   ```
   docker compose up -d
   ```

3. Create a `.env` file:

   - Copy the `.env.template` file to `.env`
   - Replace the `DATABASE_URL` and `POSTGRES_URL` environment variables in the `.env` file

4. Set up Medusa:

   ```
   yarn run medusa:setup
   ```

   > This will set up the database and seed it with some initial data, including a user with the email `admin@medusa-test.com` and password `supersecret`.

5. Return to the root of the monorepo:

   ```
   cd ../..
   ```

6. Start the development servers:
   ```
   yarn dev
   ```

This will start both the Medusa backend and the Remix storefront in development mode.

7. Create a Publishable API Key for your storefront:

   - Log in to the Medusa admin:

     `http://localhost:9000/app/login`

   - Log in with the email `admin@medusa-test.com` and password `supersecret`
   - Navigate to _Settings_ `>` _Publishable API Keys_:

     `http://localhost:9000/app/settings/publishable-api-keys`

   - Create a new API key and add, at least, a Sales Channel, it can be the _Default Sales Channel_.

8. Set the Publishable API Key in `apps/storefront/.env` file:

   - Replace the `MEDUSA_PUBLISHABLE_KEY` environment variable in the `.env` file with the API key created in the previous step.

9. Set the Stripe API Key values in `apps/storefront/.env` file:

   - Replace the `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY` environment variable in the `.env` file with your Stripe public and private key values.

10. Restart the Remix server:

- From the root of the monorepo:

  ```
  yarn dev
  ```


## Resetting the Database
1. Navigate to the `apps/medusa` folder:

   ```
   cd apps/medusa
   ```
2. Run the following command to reset the database:

   ```
   yarn medusa:reset
   ```

   > This will reset the database and seed it the initial data`


3. Follow the steps from 7 to 10 in the Local Development Setup section.

## Useful Links

- [Medusa Documentation](https://docs.medusajs.com/)
- [Remix Documentation](https://remix.run/docs/en/main)
- [Turborepo Documentation](https://turbo.build/repo/docs)
