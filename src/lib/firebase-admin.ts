// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

export function initFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
