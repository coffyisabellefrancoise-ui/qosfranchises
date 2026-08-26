async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'MariaDigi Store <onboarding@resend.dev>';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY manquante dans les variables d’environnement.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`Resend API -> ${res.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

module.exports = { sendEmail };
