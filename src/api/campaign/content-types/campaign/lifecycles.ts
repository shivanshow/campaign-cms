export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Auto-set status to draft if not provided
    if (!data.status) {
      data.status = 'draft';
    }

    // Validate end_date is after start_date
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end   = new Date(data.end_date);
      if (end <= start) {
        throw new Error('end_date must be after start_date');
      }
    }

    // Auto-set spent_budget to 0 if not provided
    if (data.spent_budget === undefined || data.spent_budget === null) {
      data.spent_budget = 0;
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;

    // Validate dates if both are being updated
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end   = new Date(data.end_date);
      if (end <= start) {
        throw new Error('end_date must be after start_date');
      }
    }

    // Prevent spent_budget from exceeding budget
    if (data.spent_budget !== undefined && data.budget !== undefined) {
      if (data.spent_budget > data.budget) {
        throw new Error('spent_budget cannot exceed budget');
      }
    }
  },

    async afterUpdate(event) {
    const { result, params } = event;

    // Log status changes
    if (params.data?.status) {
      strapi.log.info(
        `[Campaign Audit] Campaign "${result.title}" (${result.documentId}) ` +
        `status changed to "${result.status}" at ${new Date().toISOString()}`
      );

      // Fire webhook on status change
      try {
        const webhookUrl = process.env.CAMPAIGN_WEBHOOK_URL;
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event:       'campaign.status.changed',
              campaign_id: result.documentId,
              title:       result.title,
              status:      result.status,
              timestamp:   new Date().toISOString(),
            }),
          });
          strapi.log.info(`[Webhook] Fired for campaign "${result.title}" → ${result.status}`);
        }
      } catch (webhookErr) {
        strapi.log.error('[Webhook] Failed to fire:', webhookErr);
      }
    }

    // Budget utilization warning
    if (params.data?.spent_budget !== undefined) {
      const utilization = ((result.spent_budget / result.budget) * 100).toFixed(1);
      strapi.log.info(
        `[Campaign Budget] "${result.title}" — ` +
        `Spent: ${result.spent_budget} / ${result.budget} (${utilization}% utilized)`
      );
      if (result.spent_budget / result.budget >= 0.9) {
        strapi.log.warn(
          `[Budget Alert] Campaign "${result.title}" has utilized ${utilization}% of its budget!`
        );
      }
    }
    }}
