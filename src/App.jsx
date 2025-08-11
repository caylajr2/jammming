import { use, useState } from 'react'
import './App.css'
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';

import testData from './testData';




function App() {
  const [searchResults, setResults] = useState(testData);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    console.log('Searched for results:' + test);
    // make call to api here
    setResults(testData)
  }

  const updateSearch = (text) => {
    setSearchTerm(text)
  }


  const [playlistName, setPlaylistName] = useState('');
  const [tracklist, setTracklist] = useState([]);

  const addSong = (song) => {
    if (tracklist.includes(song)) alert('Song already in playlist')
    else setTracklist((prev) => [...prev, song]);
  }

  const removeSong = (songId) => {
    console.log(songId)
    setTracklist(prev => prev.filter(t => (t === songId)));
  }

  const savePlaylist = (playlistName, list) => {
    console.log(list)
    console.log(`saving playlist ${playlistName} with ${list}`);
  }

  const clearPlaylist = () => {
    console.log('clear list')
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
