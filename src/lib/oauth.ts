import { env } from '@/config/env';

function b64url(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateState(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

function generateCodeVerifier(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

async function codeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return b64url(new Uint8Array(hash));
}

export type OAuthProvider = 'google' | 'github' | 'facebook' | 'microsoft';

export async function loginWithOAuth(provider: OAuthProvider): Promise<void> {
  const state = generateState();
  const redirectUri = `${window.location.origin}/oauth-callback/${provider}`;

  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_provider', provider);
  sessionStorage.removeItem('oauth_code_verifier');

  let authUrl: URL;

  if (provider === 'google') {
    const verifier = generateCodeVerifier();
    const challenge = await codeChallenge(verifier);
    sessionStorage.setItem('oauth_code_verifier', verifier);

    authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', env.googleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);

  } else if (provider === 'github') {
    authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', env.githubClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'user:email');
    authUrl.searchParams.set('state', state);

  } else if (provider === 'facebook') {
    authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', env.facebookAppId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'email');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

  } else {
    // microsoft — PKCE required
    const verifier = generateCodeVerifier();
    const challenge = await codeChallenge(verifier);
    sessionStorage.setItem('oauth_code_verifier', verifier);

    authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.set('client_id', env.microsoftClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile User.Read');
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
  }

  window.location.href = authUrl.toString();
}
