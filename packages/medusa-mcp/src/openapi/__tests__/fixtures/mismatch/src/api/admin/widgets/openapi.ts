export default {
  tag: 'Widgets',
  operations: {
    GET: { operationId: 'listAdminWidgets', summary: 'List', responses: { 200: { description: 'OK' } } },
    DELETE: { operationId: 'deleteAdminWidgets', summary: 'Delete', responses: { 200: { description: 'OK' } } },
  },
};
