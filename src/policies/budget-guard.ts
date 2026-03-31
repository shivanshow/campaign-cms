export default async (policyContext, config, { strapi }) => {
  const { id, documentId } = policyContext.params;
  const body = policyContext.request.body as any;
  const data = body?.data;

  // Only run on PUT/PATCH with spent_budget field
  if (!data || data.spent_budget === undefined) {
    return true;
  }

  const campaignId = documentId || id;
  if (!campaignId) return true;

  try {
    const campaign = await strapi.documents('api::campaign.campaign').findOne({
      documentId: campaignId,
    });

    if (!campaign) return true;

    const budget      = (campaign as any).budget || 0;
    const spentBudget = parseFloat(data.spent_budget);

    if (spentBudget > budget) {
      policyContext.badRequest(
        `spent_budget (${spentBudget}) cannot exceed total budget (${budget})`
      );
      return false;
    }

    return true;
  } catch (err) {
    strapi.log.error('[BudgetGuard] Error checking budget:', err);
    return true;
  }
};
