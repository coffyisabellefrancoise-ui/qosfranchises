const BASE_URL = 'https://api.chariow.com/v1';

async function chariowRequest(path, options = {}) {
  const apiKey = process.env.CHARIOW_API_KEY;
  if (!apiKey) {
    throw new Error('CHARIOW_API_KEY manquante dans les variables d’environnement.');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`Chariow API ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

// NOTE: les chemins exacts (/customers, /orders) sont basés sur la documentation
// publique de Chariow (chariow.dev). Si votre compte utilise une autre forme
// (ex: /clients, /commandes), ajustez ici — le reste du script ne change pas.
async function listCustomers() {
  const data = await chariowRequest('/customers');
  return data?.data ?? data ?? [];
}

async function listOrders() {
  const data = await chariowRequest('/orders');
  return data?.data ?? data ?? [];
}

module.exports = { chariowRequest, listCustomers, listOrders };
