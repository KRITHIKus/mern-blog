import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

// Verifies a Firebase Auth ID token as described in
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
// using Google's published signing certificates, so no service account is needed.

const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// The Firebase project id is public (it is also in client/src/firebase.js).
// FIREBASE_PROJECT_ID overrides it when the client points at another project.
const getProjectId = () => process.env.FIREBASE_PROJECT_ID || 'mern-blog-3c52d';

let certCache = { certs: null, expiresAt: 0 };

const getSigningCerts = async () => {
  if (certCache.certs && Date.now() < certCache.expiresAt) return certCache.certs;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Could not fetch Firebase signing certificates (${res.status})`);
  const certs = await res.json();

  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '');
  const ttlMs = maxAge ? Number(maxAge[1]) * 1000 : 60 * 60 * 1000;
  certCache = { certs, expiresAt: Date.now() + ttlMs };
  return certs;
};

export const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw errorHandler(400, 'Missing Google sign-in token');
  }

  const decodedHeader = jwt.decode(idToken, { complete: true });
  const kid = decodedHeader?.header?.kid;
  if (!kid || decodedHeader.header.alg !== 'RS256') {
    throw errorHandler(401, 'Invalid Google sign-in token');
  }

  let certs = await getSigningCerts();
  if (!certs[kid]) {
    // Google may have rotated keys since we cached them.
    certCache.expiresAt = 0;
    certs = await getSigningCerts();
  }
  const cert = certs[kid];
  if (!cert) throw errorHandler(401, 'Invalid Google sign-in token');

  const projectId = getProjectId();
  let payload;
  try {
    payload = jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
  } catch {
    throw errorHandler(401, 'Google sign-in token is invalid or expired');
  }

  if (!payload.sub || (payload.auth_time && payload.auth_time * 1000 > Date.now())) {
    throw errorHandler(401, 'Invalid Google sign-in token');
  }
  if (!payload.email || payload.email_verified !== true) {
    throw errorHandler(401, 'Google account email is not verified');
  }

  return payload;
};
