import { useState, useEffect } from "react"

// setup for all words to be easily accessible and rendered on the screen
interface Phonetic {
    text: string;
    audio: string;
  }
  
  interface Definition {
    definition: string;
    example: string;
    synonyms: string[];
    antonyms: string[];
  }
  
  interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
  }
  
  interface Word {
    word: string;
    phonetics: Phonetic[];
    origin: string;
    meanings: Meaning[];
  }

export default function GetWords() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [error, setError] = useState('')
    const [favorites, setFavorites] = useState<Word[]>([]);

      // load favorites from localStorage on site startup
    useEffect(() => {
    const savedFavorites = Object.keys(localStorage).map((key) => {
      const savedWord = localStorage.getItem(key);
      return savedWord ? JSON.parse(savedWord) : null;
    }).filter((item) => item !== null);
    
    setFavorites(savedFavorites as Word[]);
  }, []);

    const handleSearch = async (event: React.FormEvent) => { // search for a word within the API
        setSearchResults([]);
        event?.preventDefault()
        if (searchTerm === '') {
            setError('Please enter a word')
            return;
        }
        setError('')
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`);
        const data = await response.json();
        setSearchResults(data);
        console.log(data)
    };

    const handleFavorite = (word: Word) => { // add words to the favorites list
        const existingFavorite = favorites.some((fav) => fav.word === word.word);
    
        if (!existingFavorite) {
          localStorage.setItem(word.word, JSON.stringify(word));
          setFavorites([...favorites, word]);
        }
      };
    
      const removeFavorite = (word: Word) => { // remove words from the favorites list
        localStorage.removeItem(word.word);
        setFavorites(favorites.filter((fav) => fav.word !== word.word));
      };

    return (
        <form className="w-lg" onSubmit={handleSearch}>
            <input
                className="rounded-xl mr-2 mt-4 p-1"
                type="search"
                placeholder="Search for a word"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className='bg-gray-900 text-white p-2 rounded-xl' type="submit">Search</button>
            <section aria-label="results" className="flex flex-col justify-center align-center mt-4">
                {searchResults.map((word, index) => ( // to self: index helps filter out and make each word unique so that i get no duplicates
                    <div className="border rounded border-gray-500 dark:border-white bg-white dark:bg-gray-600 flex flex-col justify-center align-center w-lg mb-5 p-2" key={`${index}-${word.word}`}>
                        <h2 className="text-2xl text-black dark:text-white">
                            <b>Word: </b>
                            {word.word}
                            <button className='ml-2 bg-gray-500 dark:bg-gray-900 text-white p-2 rounded-xl' type="submit" onClick={() => handleFavorite(word)}>
                                {favorites.some((fav) => fav.word === word.word)
                                ? "Added to Favorites"
                                : "Add to Favorites"}
                            </button>
                        </h2>
                        {word.phonetics.map((phonetic, i) => (
                            <div className="border rounded border-black p-2 m-1" key={`${i}-${phonetic.text}`}>
                                <p className="text-left text-xl text-black dark:text-white"><b>Phonetic Text:</b> {phonetic.text}</p>
                                {phonetic.audio && (
                                    <audio controls>
                                    <source src={phonetic.audio} type="audio/mp3" />
                                </audio>
                                )}
                            </div>
                        ))}
                        {word.meanings.map((meaning, i) => (
                            <div className="border rounded border-black p-2 m-1" key={`${i}-${meaning.partOfSpeech}`}>
                                <h3 className="text-left text-xl text-black dark:text-white italic"><b>Part of Speech: </b>{meaning.partOfSpeech}</h3>
                                {meaning.definitions.map((definition) => (
                                    <div key={definition.definition}>
                                        <p className="text-left text-xl italic leading-loose text-black dark:text-white"><b>Definition: </b>{definition.definition}</p>
                                        {definition.example && <p className="text-left text-xl text-black dark:text-white italic"><b>Example: </b>{definition.example}</p>}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
                {error && <h2>{error}</h2>}
                <section aria-label="favorites" className="bg-white dark:bg-gray-600 text-black dark:text-white mt-1 p-3 flex align-start flex-col border rounded border-gray-500 dark:border-white">
                    <h2>Favorite words:</h2>
                    <ul className="flex flex-col w-1/5 max-h-30 justify-around align-center">
                    {favorites.map((fav, i) => (
                        <li key={i} className="underline text-left">
                        {fav.word}
                        <button className="ml-2 text-red-500 bg-red-900 text-white p-2 rounded-xl" onClick={() => removeFavorite(fav)}>
                            Remove
                        </button>
                        </li>
                    ))}
                    </ul>
                </section>
            </section>
        </form>
    );
}