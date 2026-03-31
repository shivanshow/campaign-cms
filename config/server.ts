export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  cron: {
    enabled: true,
    tasks: {
      // Runs every day at midnight
      '0 0 * * *': async ({ strapi }) => {
        strapi.log.info('[Cron] Running campaign auto-expiry check...');

        const today = new Date().toISOString().split('T')[0];

        const overdueCampaigns = await strapi.documents('api::campaign.campaign').findMany({
          filters: {
            status:   { $in: ['active', 'paused'] },
            end_date: { $lt: today },
          },
        });

        for (const campaign of overdueCampaigns) {
          await strapi.documents('api::campaign.campaign').update({
            documentId: campaign.documentId,
            data: { status: 'completed' },
          });
          strapi.log.info(
            `[Cron] Auto-expired campaign: "${campaign.title}" (${campaign.documentId})`
          );
        }

        strapi.log.info(
          `[Cron] Auto-expiry done. ${overdueCampaigns.length} campaigns marked as completed.`
        );
      },
    },
  },
});
