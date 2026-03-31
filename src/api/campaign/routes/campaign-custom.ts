export default {
  routes: [
    {
      method: 'GET',
      path: '/campaigns/active',
      handler: 'campaign.getActive',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/campaigns/:id/analytics-summary',
      handler: 'campaign.getAnalyticsSummary',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/campaigns/:id/duplicate',
      handler: 'campaign.duplicate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PATCH',
      path: '/campaigns/:id/status',
      handler: 'campaign.updateStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
  method: 'PUT',
  path: '/campaigns/:documentId',
  handler: 'campaign.update',
  config: {
    policies: ['global::budget-guard'],
    middlewares: [],
  },
},
  ],
};
