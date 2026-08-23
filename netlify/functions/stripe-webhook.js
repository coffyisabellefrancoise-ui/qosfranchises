const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = event.headers['stripe-signature'];
    const payload = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Signature webhook invalide :', err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        if (stripeEvent.type === 'checkout.session.completed') {
            const session = stripeEvent.data.object;
            const userId = session.client_reference_id;
            if (userId) {
                await supabase
                    .from('profiles')
                    .update({ subscribed: true, stripe_customer_id: session.customer })
                    .eq('id', userId);
            }
        }

        if (stripeEvent.type === 'customer.subscription.deleted') {
            const subscription = stripeEvent.data.object;
            await supabase
                .from('profiles')
                .update({ subscribed: false })
                .eq('stripe_customer_id', subscription.customer);
        }

        return { statusCode: 200, body: JSON.stringify({ received: true }) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
