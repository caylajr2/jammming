import React from 'react'

function Track(props) {


    return (
        <>
            <p>{props.name} by {props.artist} on {props.album}</p>
        </>
    )
}

export default Track;