import { use, useState, useEffect } from 'react'
import { client_id, redirect_uri, scopes } from './security';
import './App.css'
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';

import Spotify from './Spotify';



function App() {
  const [searchResults, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [playlistName, setPlaylistName] = useState('');
  const [tracklist, setTracklist] = useState([]);

  const [accessToken, setAccessToken] = useState(null);

  async function handleAuth() {
    try {
      // Check URL for code and exchange it for tokens
      const token = await Spotify.fetchAccessTokenFromCode();
      if (token) {
        setAccessToken(token);
      } else {
        // No code param, try to get stored token or redirect to login
        const storedToken = await Spotify.getAccessToken();
        if (storedToken) {
          setAccessToken(storedToken);
        } else {
          Spotify.redirectToSpotifyAuth();
        }
      }
    } catch (error) {
      console.error('Auth failed:', error);
      Spotify.redirectToSpotifyAuth();
    }
  }
  
  
  if (!accessToken) {
    return <button onClick={handleAuth}>Log In to Spotify</button>;
  }

  const handleSearch = (term) => {
    Spotify.search(term).then(setResults);
  }

  const updateSearch = (text) => {
    setSearchTerm(text)
  }

  const addSong = (song) => {
    if (tracklist.includes(song)) alert('Song already in playlist')
    else setTracklist((prev) => [...prev, song]);
  }

  const removeSong = (songId) => {
    setTracklist(prev => prev.filter(t => (t !== songId)));
  }

  const savePlaylist = (playlistName, list) => {
    const uris = list.map(track => track.uri);
    Spotify.savePlaylist(playlistName, uris)
    setPlaylistName("");
  }

  const clearPlaylist = () => {
    setTracklist([]);
  }

  
  return (
    <>
      <SearchBar handleSearch={handleSearch} searchTerm={searchTerm} updateSearch={updateSearch} />
      <SearchResults tracks={searchResults} addSong={addSong} />
      <Playlist playlistName={playlistName} setPlaylistName={setPlaylistName} savePlaylist={savePlaylist} clearPlaylist={clearPlaylist} tracklist={tracklist} removeSong={removeSong} />
    </>
  )
}

export default App
