import React, {useState} from 'react'

function SearchBar(props) {


    const handleChange = (e) => {
        props.updateSearch(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        props.handleSearch(props.searchTerm);
        props.updateSearch('');
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input name="search" value={props.searchTerm} type="text" onChange={handleChange} />
                <button type='submit'>Search</button>
            </form>
        </>
    )
}

export default SearchBar;