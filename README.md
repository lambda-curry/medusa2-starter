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
- Yarn  4.5.0
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

5. Return to the root of the monorepo:
   ```
   cd ../..
   ```

6. Start the development servers:
   ```
   yarn dev
   ```

This will start both the Medusa backend and the Remix storefront in development mode.

## Useful Links

- [Medusa Documentation](https://docs.medusajs.com/)
- [Remix Documentation](https://remix.run/docs/en/main)
- [Turborepo Documentation](https://turbo.build/repo/docs)
