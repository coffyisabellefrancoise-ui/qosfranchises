# Agent de relance — MariaDigi Store

Relance automatiquement par email les clients Chariow qui n'ont pas finalisé
d'achat, à J+7, J+15 et J+30. Tourne seul, gratuitement, sur Vercel.

## Installation (une seule fois)

1. Sur [vercel.com](https://vercel.com), **Add New → Project**, importez le
   dépôt GitHub `qosfranchises`.
2. Dans les réglages d'import, mettez **Root Directory** sur `mariadigi-agent`.
3. Dans **Environment Variables**, ajoutez :
   - `CHARIOW_API_KEY` — votre clé API Chariow (créée dans Chariow → Paramètres → Clés API)
   - `RESEND_API_KEY` — votre clé API Resend (créée sur resend.com)
   - `RESEND_FROM_EMAIL` — ex: `MariaDigi Store <contact@mariadigi.store>` (optionnel, sinon une adresse de test Resend est utilisée)
   - `CRON_SECRET` — n'importe quelle suite de caractères aléatoire, pour sécuriser l'automatisation
4. Cliquez **Deploy**.

C'est tout. Vercel exécute automatiquement `api/relance.js` tous les jours à
8h (UTC) grâce au fichier `vercel.json`, sans aucune autre action de votre
part.

## Adapter aux vrais champs Chariow

`lib/chariow.js` suppose des endpoints `/customers` et `/orders` avec des
statuts de paiement comme `paid`/`completed`. Si les vraies réponses de
l'API Chariow utilisent d'autres noms de champs, il suffit d'ajuster ce
fichier — le reste (envoi d'email, séquence de relance) ne change pas.

## Tester manuellement

Une fois déployé, ouvrez `https://votre-projet.vercel.app/api/relance` dans
un navigateur pour déclencher une relance immédiatement (utile pour vérifier
que tout fonctionne avant d'attendre le prochain passage automatique).
