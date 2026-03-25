# Firebase rules for Artzen

Deploy from the **artzen** project root:

```bash
firebase deploy --only firestore:rules,storage
```

Or paste these files into the Firebase Console under **Firestore → Rules** and **Storage → Rules**.

## Admin custom claim

API routes expect `admin: true` on the Firebase Auth ID token. After creating your first user in **Authentication**, set the claim once (locally with a service account):

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
node scripts/set-admin-claim.mjs <USER_UID>
```

See [FIREBASE_SETUP.md](../FIREBASE_SETUP.md) for project creation and env vars.
