import { medusaIntegrationTestRunner } from '@medusajs/test-utils';
jest.setTimeout(60 * 1000);

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    describe('Ping', () => {
      it('ping the server health endpoint', async () => {
        console.log('Run test code here.');
      });
    });
  },
});
