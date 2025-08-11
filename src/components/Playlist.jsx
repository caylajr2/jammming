import React, {useState} from 'react'
import Tracklist from './Tracklist';

function Playlist(props) {
    const handleChange = (e) => {
        props.setPlaylistName(e.target.value)
    }
    const handleSubmit = (e) => {
        props.savePlaylist(props.playlistName, props.tracklist);
        props.clearPlaylist();
    }

    return (
        <>
            <input value={props.playlistName} onChange={handleChange} ></input>
            <Tracklist tracks={props.tracklist} removeSong={props.removeSong} />
            <button type='submit' onClick={handleSubmit} >Save Playlist</button>
        </>
    )
}

export default Playlist;