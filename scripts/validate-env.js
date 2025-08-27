/* Simple ENV validator for huntaze-api */
const requiredCommon = [
  'JWT_SECRET',
  'FRONTEND_URL',
];

const requiredProd = [
  'DATABASE_URL',
  // Stripe is optional until payments enabled, enforce in prod
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const warnIfMissing = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

function main() {
  const mode = process.env.NODE_ENV || 'development';
  const required = [...requiredCommon, ...(mode === 'production' ? requiredProd : [])];
  const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');

  if (missing.length) {
    console.error(`Missing required environment variables (${mode}): ${missing.join(', ')}`);
    process.exit(1);
  }

  const softMissing = warnIfMissing.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (softMissing.length) {
    console.warn(`Warning: optional env vars not set: ${softMissing.join(', ')}`);
  }
}

main();

