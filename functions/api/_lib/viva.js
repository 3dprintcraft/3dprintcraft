/* ================================================================
   Viva Smart Checkout API — ΟΛΑ τα Viva URLs ζουν μόνο εδώ.
   VIVA_ENV: "demo" (default) ή "production"
   ================================================================ */

export function vivaUrls(env) {
  const prod = env.VIVA_ENV === 'production';
  return {
    accounts: prod ? 'https://accounts.vivapayments.com' : 'https://demo-accounts.vivapayments.com',
    api: prod ? 'https://api.vivapayments.com' : 'https://demo-api.vivapayments.com',
    web: prod ? 'https://www.vivapayments.com' : 'https://demo.vivapayments.com'
  };
}

/* OAuth2 client_credentials → access token για το Smart Checkout API */
export async function getAccessToken(env) {
  const { accounts } = vivaUrls(env);
  const basic = btoa(`${env.VIVA_CLIENT_ID}:${env.VIVA_CLIENT_SECRET}`);
  const res = await fetch(`${accounts}/connect/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) throw new Error(`viva token request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/* Δημιουργία payment order → orderCode */
export async function createPaymentOrder(env, { amountCents, customer, description }) {
  const { api } = vivaUrls(env);
  const token = await getAccessToken(env);
  const res = await fetch(`${api}/checkout/v2/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amountCents,                      /* integer, σε λεπτά */
      customerTrns: description,
      customer: {
        email: customer.email,
        fullName: customer.fullName,
        phone: customer.phone,
        countryCode: 'GR',
        requestLang: 'el-GR'
      },
      sourceCode: env.VIVA_SOURCE_CODE,
      merchantTrns: description,
      paymentTimeout: 1800
    })
  });
  if (!res.ok) throw new Error(`viva order failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.orderCode;
}

export function checkoutRedirectUrl(env, orderCode) {
  const { web } = vivaUrls(env);
  return `${web}/web/checkout?ref=${orderCode}`;
}

/* Επαλήθευση συναλλαγής — τα webhooks δεν είναι signed, οπότε πριν
   στείλουμε emails ρωτάμε τη Viva αν η συναλλαγή είναι όντως πληρωμένη. */
export async function getTransaction(env, transactionId) {
  const { api } = vivaUrls(env);
  const token = await getAccessToken(env);
  const res = await fetch(`${api}/checkout/v2/transactions/${transactionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`viva transaction fetch failed: ${res.status}`);
  return res.json();
}

/* Κλειδί επαλήθευσης webhook (η Viva κάνει GET κατά τη δημιουργία του) */
export async function getWebhookVerificationKey(env) {
  if (env.VIVA_WEBHOOK_KEY) return env.VIVA_WEBHOOK_KEY;
  const { web } = vivaUrls(env);
  const basic = btoa(`${env.VIVA_MERCHANT_ID}:${env.VIVA_API_KEY}`);
  const res = await fetch(`${web}/api/messages/config/token`, {
    headers: { 'Authorization': `Basic ${basic}` }
  });
  if (!res.ok) throw new Error(`viva webhook key fetch failed: ${res.status}`);
  const data = await res.json();
  return data.Key;
}
