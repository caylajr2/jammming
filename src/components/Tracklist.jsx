import React, { useState } from 'react'
import Track from './Track';

function Tracklist(props) {


    return (
        <>
            <p>Songs</p>
            <ul>
                {props.tracks.map(track => (
                <li>
                    <Track name={track.name} artist={track.artist} album={track.album} />
                    <button onClick={() => (props.removeSong(track.id))}>x</button>
                </li>
            ))}
            </ul>
        </>
    )
}

export default Tracklist;