const admin = require("firebase-admin");
require("dotenv").config();

function initializeFirebase() {
  if (admin.apps.length) {
    return admin;
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is missing in .env");
  }

  const serviceAccountJson = Buffer.from(
    serviceAccountBase64,
    "base64"
  ).toString("utf8");

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized");

  return admin;
}

module.exports = initializeFirebase();