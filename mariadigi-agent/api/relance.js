const { listCustomers, listOrders } = require('../lib/chariow');
const { sendEmail } = require('../lib/resend');

const PAID_STATUSES = ['paid', 'completed', 'success', 'succeeded'];

const RELANCE_STAGES = [
  {
    days: 7,
    subject: 'Toujours intéressé(e) ? 👋',
    html: (name, produit) => `
      <p>Bonjour ${name || ''},</p>
      <p>Petit rappel : ${produit ? `<strong>${produit}</strong>` : 'le produit qui vous intéressait'} est toujours disponible sur MariaDigi Store.</p>
      <p>Dites-moi si vous avez des questions, je reste disponible.</p>
      <p>— Maria, MariaDigi Store</p>
    `,
  },
  {
    days: 15,
    subject: 'On a peut-être une meilleure option pour vous 🎁',
    html: (name, produit) => `
      <p>Bonjour ${name || ''},</p>
      <p>Je voulais savoir où vous en étiez pour ${produit ? `<strong>${produit}</strong>` : 'votre achat'}.</p>
      <p>Si le budget est encore juste, on a aussi des packs plus légers qui pourraient vous convenir en attendant.</p>
      <p>— Maria, MariaDigi Store</p>
    `,
  },
  {
    days: 30,
    subject: 'Dernier petit mot de ma part 🙏',
    html: (name, produit) => `
      <p>Bonjour ${name || ''},</p>
      <p>${produit ? `<strong>${produit}</strong>` : 'Le produit'} reste disponible si jamais vous êtes prêt(e).</p>
      <p>Je suis toujours là si besoin. Bonne continuation !</p>
      <p>— Maria, MariaDigi Store</p>
    `,
  },
];

function daysSince(dateString) {
  if (!dateString) return null;
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

module.exports = async (req, res) => {
  // Vercel envoie automatiquement "Authorization: Bearer <CRON_SECRET>"
  // quand cette fonction est appelée par un Cron Job, si la variable
  // d'environnement CRON_SECRET est définie sur le projet.
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && req.headers.authorization !== `Bearer ${expectedSecret}`) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  try {
    const [customers, orders] = await Promise.all([listCustomers(), listOrders()]);

    const paidCustomerKeys = new Set(
      orders
        .filter(o => PAID_STATUSES.includes((o.status || '').toLowerCase()))
        .map(o => o.customer_email || o.customer_id)
        .filter(Boolean)
    );

    const results = [];

    for (const customer of customers) {
      const email = customer.email;
      const key = email || customer.id;
      if (!email || paidCustomerKeys.has(key)) continue;

      const age = daysSince(customer.created_at);
      if (age === null) continue;

      const stage = RELANCE_STAGES.find(s => s.days === age);
      if (!stage) continue;

      const name = customer.first_name || customer.name || '';
      const produit = customer.last_viewed_product || customer.interested_product || '';

      await sendEmail({
        to: email,
        subject: stage.subject,
        html: stage.html(name, produit),
      });

      results.push({ email, stage: stage.days });
    }

    res.status(200).json({ ok: true, relances_envoyees: results.length, details: results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
