export default {
  tag: 'Products',
  operations: {
    POST: {
      operationId: 'postCustomProductsId',
      summary: 'Custom product update',
      responses: { 200: { description: 'OK' } },
    },
  },
};
