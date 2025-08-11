import React, { useState } from 'react'
import Track from './Track';




function SearchResults(props) {
    return (
        <>
            <ul>
            {props.tracks.map(track => (
                <li>
                    <Track name={track.name} artist={track.artist} album={track.album} />
                    <button onClick={() => props.addSong(track)}>+</button>
                </li>
            ))}
            </ul>
        </>
    )
}

export default SearchResults;