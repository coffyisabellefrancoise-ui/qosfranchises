# Mise en place du SaaS — Traducteur Audio/Vidéo EN → FR

Par défaut, `traduction-audio.html` tourne en **mode libre, sans compte** — utile
pour tester l'outil tout de suite. Le compte + abonnement payant ne s'active
QUE lorsque vous renseignez de vraies valeurs Supabase (voir ci-dessous) :
tant que `SUPABASE_URL` contient encore `YOUR-PROJECT`, la vérification est
automatiquement désactivée.

⚠️ Important : `traduction-audio.html` contient sa propre configuration Supabase
**en dur, directement dans le fichier** (pas d'import de `supabase-config.js`) —
un fichier ouvert en double-clic (`file://`) ne peut pas charger un module local
séparé, ce qui faisait planter toute la page auparavant. Éditez donc les
constantes `SUPABASE_URL` / `SUPABASE_ANON_KEY` en haut du `<script type="module">`
de `traduction-audio.html` lui-même pour activer la protection. `login.html` et
`pricing.html`, eux, continuent d'utiliser `supabase-config.js` (ils sont conçus
pour être servis par un vrai serveur/hébergeur comme Netlify, pas ouverts en local).

## Ce qu'il vous reste à faire (comptes gratuits à créer)

### 1. Supabase (comptes utilisateurs + base de données) — gratuit pour démarrer
1. Créez un compte sur supabase.com et un nouveau projet.
2. Allez dans **SQL Editor** et exécutez le contenu de `supabase-schema.sql`
   (crée la table `profiles` qui stocke qui est abonné).
3. Allez dans **Project Settings > API** et copiez :
   - `Project URL` → collez-le dans `supabase-config.js` **et** dans les constantes
     en haut du script de `traduction-audio.html` (`SUPABASE_URL`)
   - `anon public key` → idem (`SUPABASE_ANON_KEY`)
   - `service_role key` → à garder secret, à mettre dans les variables d'environnement Netlify (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. Stripe (paiement) — gratuit, commission uniquement sur les ventes
1. Créez un compte sur stripe.com.
2. Créez un **Produit** (ex: "Abonnement Traducteur IA") avec un **Prix récurrent mensuel**.
   Copiez l'ID du prix (`price_...`).
3. Dans **Developers > API keys**, copiez la clé secrète (`sk_...`).
4. Dans **Developers > Webhooks**, ajoutez un endpoint :
   `https://VOTRE-SITE.netlify.app/api/stripe-webhook`
   avec l'événement `checkout.session.completed` et `customer.subscription.deleted`.
   Copiez le "Signing secret" (`whsec_...`).

### 3. Netlify (hébergement + backend léger) — gratuit pour démarrer
1. Créez un compte sur netlify.com et déployez ce dépôt (import depuis GitHub).
2. Dans **Site settings > Environment variables**, ajoutez les valeurs de `.env.example` :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redéployez le site.

## Parcours utilisateur une fois configuré
1. `index.html` → lien vers l'outil
2. `login.html` → création de compte / connexion (Supabase Auth)
3. Si pas encore abonné → redirection automatique vers `pricing.html`
4. Paiement Stripe (Checkout hébergé par Stripe, sécurisé)
5. Le webhook Stripe marque l'utilisateur comme `subscribed = true` dans Supabase
6. Accès débloqué à `traduction-audio.html`

## ⚠️ À vérifier avant de vendre
- **Licence du modèle de voix IA** (MMS-TTS de Meta, utilisé pour l'audio téléchargeable) :
  vérifiez les conditions d'usage commercial avant la mise en vente. Si nécessaire,
  ce modèle peut être remplacé par un autre modèle de synthèse vocale avec une licence
  commerciale claire.
- **Prix Stripe** : pensez à activer le mode "Live" (pas seulement "Test") avant le
  lancement réel, et à utiliser les vraies clés `sk_live_...` / webhook live.
