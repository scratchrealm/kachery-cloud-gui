"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("@google-cloud/firestore");
const GoogleServiceAccountCredentials_1 = require("./GoogleServiceAccountCredentials");
let db = null;
const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;
if (!GOOGLE_CREDENTIALS) {
    throw Error('Environment variable not set: GOOGLE_CREDENTIALS');
}
const firestoreDatabase = () => {
    if (!db) {
        const googleCredentials = JSON.parse(GOOGLE_CREDENTIALS);
        if (!(0, GoogleServiceAccountCredentials_1.isGoogleServiceAccountCredentials)(googleCredentials)) {
            throw Error('Invalid google credentials.');
        }
        db = new firestore_1.Firestore({
            projectId: googleCredentials.project_id,
            credentials: {
                client_email: googleCredentials.client_email,
                private_key: googleCredentials.private_key
            }
        });
        db.settings({ ignoreUndefinedProperties: true });
    }
    return db;
};
exports.default = firestoreDatabase;
//# sourceMappingURL=firestoreDatabase.js.map