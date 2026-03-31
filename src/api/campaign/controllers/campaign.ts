import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::campaign.campaign', ({ strapi }) => ({

  // ── GET /api/campaigns/active ──────────────────────────────────────────
  async getActive(ctx) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const campaigns = await strapi.documents('api::campaign.campaign').findMany({
        filters: {
          status: { $eq: 'active' },
          start_date: { $lte: today },
          end_date: { $gte: today },
        },
        populate: ['client', 'tags'],
      });

      ctx.body = {
        data: campaigns,
        meta: { total: campaigns.length },
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // ── GET /api/campaigns/:id/analytics-summary ───────────────────────────
  async getAnalyticsSummary(ctx) {
    try {
      const { id } = ctx.params;

      const campaign = await strapi.documents('api::campaign.campaign').findOne({
        documentId: id,
        populate: ['analytics_events'],
      });

      if (!campaign) {
        return ctx.notFound('Campaign not found');
      }

      const events = (campaign as any).analytics_events || [];

      if (events.length === 0) {
        return ctx.body = {
          data: {
            campaign_id: id,
            campaign_title: (campaign as any).title,
            total_impressions: 0,
            total_clicks: 0,
            total_conversions: 0,
            total_spend: 0,
            avg_ctr: 0,
            avg_conversion_rate: 0,
            budget_utilization: 0,
            days_tracked: 0,
          },
        };
      }

      const totalImpressions = events.reduce((sum, e) => sum + (e.impressions || 0), 0);
      const totalClicks      = events.reduce((sum, e) => sum + (e.clicks || 0), 0);
      const totalConversions = events.reduce((sum, e) => sum + (e.conversions || 0), 0);
      const totalSpend       = events.reduce((sum, e) => sum + (e.spend || 0), 0);

      const avgCtr            = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const budgetUtilization = (campaign as any).budget > 0
        ? ((campaign as any).spent_budget / (campaign as any).budget) * 100
        : 0;

      ctx.body = {
        data: {
          campaign_id: id,
          campaign_title: (campaign as any).title,
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          total_conversions: totalConversions,
          total_spend: parseFloat(totalSpend.toFixed(2)),
          avg_ctr: parseFloat(avgCtr.toFixed(2)),
          avg_conversion_rate: parseFloat(avgConversionRate.toFixed(2)),
          budget_utilization: parseFloat(budgetUtilization.toFixed(2)),
          days_tracked: events.length,
        },
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // ── POST /api/campaigns/:id/duplicate ─────────────────────────────────
  async duplicate(ctx) {
    try {
      const { id } = ctx.params;

      const original = await strapi.documents('api::campaign.campaign').findOne({
        documentId: id,
        populate: ['client', 'tags', 'ad_creatives'],
      });

      if (!original) {
        return ctx.notFound('Campaign not found');
      }

      const o = original as any;

      // Create the duplicated campaign
      const duplicated = await strapi.documents('api::campaign.campaign').create({
        data: {
          title:           `${o.title} (Copy)`,
          description:     o.description,
          status:          'draft',
          channel:         o.channel,
          start_date:      o.start_date,
          end_date:        o.end_date,
          budget:          o.budget,
          spent_budget:    0,
          goals:           o.goals,
          target_audience: o.target_audience,
          client:          o.client?.documentId,
          tags:            o.tags?.map((t: any) => t.documentId),
        },
      });

      // Duplicate each ad creative and link to new campaign
      const createdCreatives: any[] = [];
      if (o.ad_creatives && o.ad_creatives.length > 0) {
        for (const creative of o.ad_creatives) {
          const newCreative = await strapi.documents('api::ad-creative.ad-creative').create({
            data: {
              name:      `${creative.name} (Copy)`,
              type:      creative.type,
              headline:  creative.headline,
              body_copy: creative.body_copy,
              cta_text:  creative.cta_text,
              cta_url:   creative.cta_url,
              status:    'draft',
              campaign:  (duplicated as any).documentId,
            },
          });
          createdCreatives.push(newCreative);
        }
      }

      ctx.body = {
        data: {
          original_id:        id,
          duplicated_campaign: duplicated,
          creatives_copied:   createdCreatives.length,
        },
        message: 'Campaign duplicated successfully',
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // ── PATCH /api/campaigns/:id/status ───────────────────────────────────
  async updateStatus(ctx) {
    try {
      const { id }     = ctx.params;
      const { status } = ctx.request.body as any;

      const validStatuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ctx.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const campaign = await strapi.documents('api::campaign.campaign').findOne({
        documentId: id,
      });

      if (!campaign) {
        return ctx.notFound('Campaign not found');
      }

      // Status transition rules
      const currentStatus = (campaign as any).status;
      const allowedTransitions: Record<string, string[]> = {
        draft:     ['active', 'cancelled'],
        active:    ['paused', 'completed', 'cancelled'],
        paused:    ['active', 'cancelled'],
        completed: [],
        cancelled: [],
      };

      if (!allowedTransitions[currentStatus].includes(status)) {
        return ctx.badRequest(
          `Cannot transition from "${currentStatus}" to "${status}". ` +
          `Allowed: ${allowedTransitions[currentStatus].join(', ') || 'none'}`
        );
      }

      const updated = await strapi.documents('api::campaign.campaign').update({
        documentId: id,
        data: { status },
      });

      ctx.body = {
        data: updated,
        message: `Campaign status updated from "${currentStatus}" to "${status}"`,
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

}));
