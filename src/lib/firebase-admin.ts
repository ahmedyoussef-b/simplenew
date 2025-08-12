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
        // The service account key can be a JSON string or a path to a file.
        // For security reasons, it's best to use a JSON string from env variables.
        const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");

    } catch(e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK.", e);
    }
}

// Ensure the app is initialized on server start
initFirebaseAdminApp();

export default admin;
