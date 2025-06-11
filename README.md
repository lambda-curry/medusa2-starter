<h1 align="center">
  <a href="https://barrio.lambdacurry.dev"><img src="https://barrio.lambdacurry.dev/favicon.svg" alt="Medusa 2 Starter with React Router 7 Storefront" width="80" height="80"></a>
  <br>
  <br>
  Medusa 2 Starter with React Router 7 Storefront
  <br>
</h1>


This is an official Turborepo monorepo integrating a Medusa2 backend with a React Router 7 frontend. Showcasing a Coffee Roast themed dynamic storefront, it features Stripe payment integration, scalability with unlimited products and categories, and a developer-friendly setup using TypeScript and Biome. Ideal for rapidly building dynamic, scalable e-commerce stores.

https://github.com/user-attachments/assets/3c10d2f5-91b8-405c-a47c-c8ae8a4be575

## Table

- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
  - [Key Features](#key-features)
  - [Demo](#demo)
- [Getting Started](#getting-started)
- [Local Development Setup](#local-development-setup)
- [Resetting the Database](#resetting-the-database)
- [Enabling Express Checkout](#enabling-express-checkout)
- [Useful Links](#useful-links)
- [Contributors](#contributors)

## Prerequisites

Before you begin, ensure you have the following installed:

- ✅ Node.js 20+
- ✅ Yarn 4.5.0
- ✅ React Router 7
- ✅ Docker and Docker Compose


## Project Overview

### Key Features

- **Dynamic Storefront**: Leverages Medusa2's robust headless commerce capabilities and React Router 7's fast, data-driven UI for modern e-commerce experiences.
- **Advanced Payment Integration**: Out-of-the-box support for Stripe enables secure and reliable transaction processing.
- **Scalability**: Supports unlimited products, collections, categories, and tags, accommodating businesses as they expand their inventory.
- **Developer Experience**: Built with TypeScript and Biome, enhancing code quality, consistency, and maintainability.

## Demo

You can view a live demo of the project [here](https://barrio.lambdacurry.dev/).


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
1. Generate `.env` files for both the Medusa backend and the React Router 7 storefront.
   ```
   yarn run generate-env
   ```
   > This will generate the `apps/medusa/.env` and `apps/storefront/.env` files.

2. Replace the following environment variables in your `apps/medusa/.env` file:
   - `STRIPE_API_KEY` # Your Stripe secret key. Required to checkout.

3. Run the following command to initialize the Medusa database:

   ```
   yarn run medusa:init
   ```

   > This will set up the database and seed it with some initial data, including a user with the email `admin@medusa-test.com` and password `supersecret`.

4. Start the development servers:
   ```
   yarn dev
   ```

   > This will start both the Medusa backend and the React Router 7 storefront in development mode.

5. Create a Publishable API Key for your storefront:

   - Log in to the [Medusa admin](http://localhost:9000/app/login) using the credentials `admin@medusa-test.com` / `supersecret`

   - Navigate to the [_Publishable API Keys_ settings](http://localhost:9000/app/settings/publishable-api-keys) and **copy** an exisiting API Key or create a new one with at least one Sales Channel.

6. Replace the environment variables in the `apps/storefront/.env` file:

   - `MEDUSA_PUBLISHABLE_KEY` # API key from previous step
   - `STRIPE_PUBLIC_KEY` # starts with `pk_`
   - `STRIPE_SECRET_KEY` # starts with `sk_`

7. Restart your storefront and medusa backend:
      ```
      yarn dev
      ```


## Resetting the Database
In order to reset the database, follow the steps from 3 to 7 in the Local Development Setup section.

## Enabling Express Checkout

> For a more complete guide on how to enable Express Checkout, see the Stripe [documentation](https://docs.stripe.com/elements/express-checkout-element).

To enable Express Checkout in the Medusa Storefront, follow these steps:

1. Enable the payment methods you want to use to during Express Checkout in the Stripe [payment methods settings](https://dashboard.stripe.com/settings/payment_methods).
   - Learn more about Apple Pay integration [here](https://docs.stripe.com/apple-pay) 
   - Learn more about Google Pay integration [here](https://docs.stripe.com/google-pay).

2. Create your own [domain association file](https://docs.stripe.com/apple-pay?platform=web#verify-domain) to verify your domain, and replace the content in the `apps/storefront/app/routes/[.well-known].apple-developer-merchantid-domain-association.tsx` file with your own domain association file content.

3. Register your domain for payment methods - see [this stripe guide](https://docs.stripe.com/payments/payment-methods/pmd-registration) for more information.
   -  for development, you may want to use a service like [ngrok](https://ngrok.com).
   -  for production, a domain with `https` is required.






## Useful Links

- [Medusa Documentation](https://docs.medusajs.com/)
- [React Router 7 Documentation](https://reactrouter.com/en/main)
- [Turborepo Documentation](https://turbo.build/repo/docs)
 - [Stripe Express Checkout](https://docs.stripe.com/elements/express-checkout-element)


## Contributors
Made with ❤️ by the Lambda Curry team.


<a href = "https://github.com/lambda-curry/medusa2-starter/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=lambda-curry/medusa2-starter"/>
</a>
