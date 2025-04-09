import fetch from 'node-fetch';

const MAX_RETRIES = 30; // 30 seconds max wait time
const RETRY_INTERVAL = 1000; // 1 second between retries

export default async function globalSetup() {
  let retries = 0;
  const url = 'http://localhost:9000/app';

  console.log('Waiting for Medusa server to be ready...');

  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✓ Medusa server is ready');
        return;
      }
    } catch (error) {
      // Server not ready yet, continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    retries++;

    if (retries % 5 === 0) {
      console.log(`Still waiting for server... (${retries}/${MAX_RETRIES})`);
    }
  }

  throw new Error(`Medusa server not ready after ${MAX_RETRIES} seconds`);
}
