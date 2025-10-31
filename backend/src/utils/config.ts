export const getEnv = (key: string, required = true, fallback?: string): string => {
  const val = process.env[key] ?? fallback;
  if (required && (!val || String(val).trim() === '')) {
    throw new Error(`Missing required env: ${key}`);
  }
  return String(val);
};

export const mpesaConfig = () => ({
  baseUrl: getEnv('MPESA_BASE_URL', false, 'https://sandbox.safaricom.co.ke'),
  consumerKey: getEnv('MPESA_CONSUMER_KEY'),
  consumerSecret: getEnv('MPESA_CONSUMER_SECRET'),
  shortcode: getEnv('MPESA_SHORTCODE'),
  passkey: getEnv('MPESA_PASSKEY'),
  callbackUrl: getEnv('MPESA_CALLBACK_URL'),
  // B2B
  initiatorName: getEnv('MPESA_INITIATOR_NAME', false, ''),
  securityCredential: getEnv('MPESA_SECURITY_CREDENTIAL', false, ''),
  b2bCommandId: getEnv('MPESA_B2B_COMMAND_ID', false, 'BusinessPayBill'),
  b2bResultUrl: getEnv('MPESA_B2B_RESULT_URL', false, ''),
  b2bTimeoutUrl: getEnv('MPESA_B2B_TIMEOUT_URL', false, ''),
  b2bReceiverShortcode: getEnv('MPESA_B2B_RECEIVER_SHORTCODE', false, '247247'),
  b2bAccountReference: getEnv('MPESA_B2B_ACCOUNT_REFERENCE', false, '925759')
});


