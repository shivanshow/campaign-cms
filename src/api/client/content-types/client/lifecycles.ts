export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Normalize email to lowercase
    if (data.contact_email) {
      data.contact_email = data.contact_email.toLowerCase().trim();
    }

    // Default is_active to true
    if (data.is_active === undefined) {
      data.is_active = true;
    }
  },

  async afterCreate(event) {
    const { result } = event;
    strapi.log.info(
      `[Client] New client created: "${result.name}" (${result.contact_email})`
    );
  },
};
