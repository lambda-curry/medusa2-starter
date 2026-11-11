export default {
  tag: 'Widgets',
  operations: {
    GET: { operationId: 'listStoreWidgets', summary: 'List widgets', responses: { 200: { description: 'Widgets' } } },
  },
};
