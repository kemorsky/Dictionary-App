import { useState } from "react"
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
    const  [error, setError] = useState('')

    const handleSearch = async () => {
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

    return (
        <form onSubmit={handleSearch}>
            <input
                type="search"
                placeholder="Search for a word"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
            {searchResults.map((word) => (
                <div key={word.word}>
                    <h2>{word.word}</h2>
                    {word.phonetics.map((phonetic) => (
                        <div key={phonetic.text}>
                            <p>{phonetic.text}</p>
                            {phonetic.audio && (
                                <audio controls>
                                <source src={phonetic.audio} type="audio/mp3" />
                            </audio>
                            )}
                        </div>
                    ))}
                    {word.meanings.map((meaning) => (
                        <div key={meaning.partOfSpeech}>
                            <h3>{meaning.partOfSpeech}</h3>
                            {meaning.definitions.map((definition) => (
                                <div key={definition.definition}>
                                    <p>{definition.definition}</p>
                                    {definition.example && <p>{definition.example}</p>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
            {error && <h2>{error}</h2>}
        </form>
    );
}