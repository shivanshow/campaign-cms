export default () => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    // Only log /api routes, skip admin
    if (ctx.url.startsWith('/api')) {
      const logLine =
        `[Request] ${ctx.method} ${ctx.url} — ` +
        `Status: ${ctx.status} — ` +
        `Time: ${ms}ms — ` +
        `IP: ${ctx.ip}`;

      if (ctx.status >= 400) {
        strapi.log.warn(logLine);
      } else {
        strapi.log.info(logLine);
      }
    }
  };
};
