const Stripe = require('stripe');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const { userId, email } = JSON.parse(event.body || '{}');

        if (!userId || !email) {
            return { statusCode: 400, body: JSON.stringify({ error: 'userId et email requis' }) };
        }

        const siteUrl = process.env.URL || 'http://localhost:8888';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email,
            client_reference_id: userId,
            line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
            success_url: `${siteUrl}/success.html`,
            cancel_url: `${siteUrl}/cancel.html`,
        });

        return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
