export function validateEnv() {
  const required = ['JWT_SECRET', 'FRONTEND_URL'];
  const oauthVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Optional but recommended
  const missingOauth = oauthVars.filter((k) => !process.env[k]);
  if (missingOauth.length) {
    console.warn(`Warning: OAuth variables not set: ${missingOauth.join(', ')}`);
  }
}

