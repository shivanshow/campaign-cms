export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Auto-calculate CTR (clicks / impressions * 100)
    if (data.impressions && data.clicks !== undefined) {
      data.ctr = data.impressions > 0
        ? parseFloat(((data.clicks / data.impressions) * 100).toFixed(2))
        : 0;
    }

    // Auto-calculate conversion rate (conversions / clicks * 100)
    if (data.clicks && data.conversions !== undefined) {
      data.conversion_rate = data.clicks > 0
        ? parseFloat(((data.conversions / data.clicks) * 100).toFixed(2))
        : 0;
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;

    // Recalculate CTR on update
    if (data.impressions !== undefined || data.clicks !== undefined) {
      const impressions = data.impressions ?? 0;
      const clicks      = data.clicks ?? 0;
      data.ctr = impressions > 0
        ? parseFloat(((clicks / impressions) * 100).toFixed(2))
        : 0;
    }

    // Recalculate conversion rate on update
    if (data.clicks !== undefined || data.conversions !== undefined) {
      const clicks      = data.clicks ?? 0;
      const conversions = data.conversions ?? 0;
      data.conversion_rate = clicks > 0
        ? parseFloat(((conversions / clicks) * 100).toFixed(2))
        : 0;
    }
  },

  async afterCreate(event) {
    const { result } = event;
    strapi.log.info(
      `[Analytics] New event logged for campaign ${result.documentId} — ` +
      `Impressions: ${result.impressions}, Clicks: ${result.clicks}, ` +
      `CTR: ${result.ctr}%, Conversions: ${result.conversions}`
    );
  },
};
