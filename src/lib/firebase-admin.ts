// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

export function initFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized.");
        return;
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch(e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK.", e);
    }
}
