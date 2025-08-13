import { client_id, redirect_uri, scopes } from './security';

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(x => possible[x % possible.length]).join('');
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const generateCodeChallenge = async (codeVerifier) => {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
};


const Spotify = {
  async redirectToSpotifyAuth() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem('code_verifier', codeVerifier);
  
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', client_id);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirect_uri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
  
    window.location = authUrl.toString();
  },
  async fetchAccessTokenFromCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) return null;
  
    const codeVerifier = localStorage.getItem('code_verifier');
    if (!codeVerifier) throw new Error('No code verifier found in localStorage');
  
    const body = new URLSearchParams({
      client_id,
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      code_verifier: codeVerifier,
    });
  
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
    }
  
    const data = await response.json();
    // store tokens for later use (access + refresh)
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('token_expiry', (Date.now() + data.expires_in * 1000).toString());
  
    // Clean URL to remove code param
    window.history.replaceState({}, document.title, redirect_uri);
  
    return data.access_token;
  },
  async getAccessToken() {
    const token = localStorage.getItem('access_token');
    const expiry = Number(localStorage.getItem('token_expiry')) || 0;
    if (token && Date.now() < expiry) {
      return token; // token still valid
    }
  
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      // No refresh token means we need to re-authenticate
      return null;
    }
  
    // Refresh the access token
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id,
    });
  
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  
    if (!response.ok) {
      return null;
    }
  
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_expiry', (Date.now() + data.expires_in * 1000).toString());
  
    return data.access_token;
  },
  async search(term) {
    const accessToken = await this.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },
  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }
    const accessToken = await this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    let userId;

    // Get user ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
    if (!userResponse.ok) {
      throw new Error(`Failed to get user: ${userResponse.status}`);
    }
    const userData = await userResponse.json();
    userId = userData.id;

    // Create playlist
    const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      headers,
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!playlistResponse.ok) {
      throw new Error(`Failed to create playlist: ${playlistResponse.status}`);
    }
    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    // Add tracks to playlist
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers,
        method: 'POST',
        body: JSON.stringify({ uris: trackUris }),
      }
    );
    if (!addTracksResponse.ok) {
      throw new Error(`Failed to add tracks: ${addTracksResponse.status}`);
    }

    return true; // or return playlistData if you want to return info about the playlist
  }
};

export default Spotify;
