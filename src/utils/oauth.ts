// A simple, custom OAuth2 implementation for Authorization Code with PKCE.
import { getConfig } from '../config';

const OAUTH_STATE_KEY = 'oauth_state';
const OAUTH_VERIFIER_KEY = 'oauth_code_verifier';
const OAUTH_TOKEN_KEY = 'oauth_access_token';

// Utils for PKCE
function generateRandomString(length: number) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const values = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return base64Digest;
}

export async function initiateLogin() {
  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  sessionStorage.setItem(OAUTH_VERIFIER_KEY, codeVerifier);

  const configObj = getConfig();
  const clientId = configObj.OAUTH_CLIENT_ID;
  const authority = configObj.OAUTH_AUTHORITY; // Expected to be the base URL or well-known
  if (!clientId || !authority) {
    console.error("Missing OAUTH_CLIENT_ID or OAUTH_AUTHORITY in config");
    return;
  }
  // For Kanidm, the authorize endpoint is usually /oauth2/authorize or similar.
  // Wait, if it's standard OIDC we should perhaps fetch the discovery endpoint.
  // For simplicity, let's assume AUTHORITY includes the base, and we append /authorize.
  // If AUTHORITY already contains /oauth2/openid/..., we might need to parse it. Let's just use it as the base.
  // Actually, Kanidm OpenID Connect endpoints:
  // Authorize: <authority>/authorize
  // Token: <authority>/token

  // To be safe with Kanidm, we can assume AUTHORITY is the issuer URL, e.g., https://idm.example.com/oauth2/openid/gearshift
  // Standard OIDC authorize endpoint is often issuer + /authorize or we can guess based on authority.

  // Let's assume the user provides a complete VITE_OAUTH_AUTHORITY URL. We will fetch the well-known config to be robust.

  try {
    const discoveryUrl = `${authority.replace(/\/$/, '')}/.well-known/openid-configuration`;
    const response = await fetch(discoveryUrl);
    const config = await response.json();

    const authEndpoint = config.authorization_endpoint;

    const redirectUri = configObj.OAUTH_REDIRECT_URI || window.location.origin;
    const scope = configObj.OAUTH_SCOPE || 'openid profile email';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${authEndpoint}?${params.toString()}`;
  } catch (error) {
    console.error("Failed to fetch OIDC discovery document:", error);
    // Fallback if discovery fails
    const fallbackAuthEndpoint = `${authority.replace(/\/$/, '')}/authorize`;
    const redirectUri = configObj.OAUTH_REDIRECT_URI || window.location.origin;
    const scope = configObj.OAUTH_SCOPE || 'openid profile email';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${fallbackAuthEndpoint}?${params.toString()}`;
  }
}

export async function handleCallback(code: string, state: string) {
  const savedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  const codeVerifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY);

  if (!savedState || state !== savedState) {
    throw new Error('Invalid state');
  }

  if (!codeVerifier) {
    throw new Error('No code verifier found');
  }

  const configObj = getConfig();
  const clientId = configObj.OAUTH_CLIENT_ID;
  const authority = configObj.OAUTH_AUTHORITY;
  if (!clientId || !authority) {
    throw new Error('Missing OAUTH_CLIENT_ID or OAUTH_AUTHORITY in config');
  }
  const redirectUri = configObj.OAUTH_REDIRECT_URI || window.location.origin;

  let tokenEndpoint = `${authority.replace(/\/$/, '')}/token`;
  try {
    const discoveryUrl = `${authority.replace(/\/$/, '')}/.well-known/openid-configuration`;
    const response = await fetch(discoveryUrl);
    if (response.ok) {
       const config = await response.json();
       tokenEndpoint = config.token_endpoint;
    }
  } catch {
    console.warn("Could not fetch discovery for token endpoint, using fallback:", tokenEndpoint);
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch token: ${errorText}`);
  }

  const data = await response.json();

  if (data.access_token) {
    localStorage.setItem(OAUTH_TOKEN_KEY, data.access_token);
    // Cleanup session storage
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_VERIFIER_KEY);
    return data.access_token;
  } else {
    throw new Error('No access token in response');
  }
}

export function getAccessToken() {
  return localStorage.getItem(OAUTH_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(OAUTH_TOKEN_KEY);
}
