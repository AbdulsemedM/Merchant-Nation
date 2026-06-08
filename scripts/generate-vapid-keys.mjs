/**
 * Generate a VAPID key pair for web push.
 * Run: node scripts/generate-vapid-keys.mjs
 *
 * Add the output to .env and Vercel environment variables.
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Add these to .env and Vercel (Production + Preview):\n");
console.log(`VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_SUBJECT="mailto:notify@yourdomain.com"`);
