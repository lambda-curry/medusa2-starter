export default {
  tag: 'Widgets',
  operations: {
    GET: { operationId: 'getAdminWidget', summary: 'Get a widget', responses: { 200: { description: 'Widget' } } },
    DELETE: {
      operationId: 'deleteAdminWidget',
      summary: 'Delete a widget',
      responses: { 200: { description: 'Deleted' } },
    },
  },
};
