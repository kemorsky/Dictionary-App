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
    const [error, setError] = useState('')

    const handleSearch = async () => {
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


    return (
        <form className="max-w-lg" onSubmit={handleSearch}>
            <input
                type="search"
                placeholder="Search for a word"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
            <section className="flex flex-col justify-center align-center">
                {searchResults.map((word, index) => ( // to self: index helps filter out and make each word unique so that i get no duplicates
                    <div className="border rounded border-white bg-gray-600 flex flex-col justify-center align-center w-lg mb-5 p-2" key={`${index}-${word.word}`}>
                        <h2 className="text-xl"><b>Word: </b>{word.word}</h2>
                        {word.phonetics.map((phonetic, i) => (
                            <div key={`${i}-${phonetic.text}`}>
                                <p className="text-xl"><b>Phonetic Text:</b> {phonetic.text}</p>
                                {phonetic.audio && (
                                    <audio controls>
                                    <source src={phonetic.audio} type="audio/mp3" />
                                </audio>
                                )}
                            </div>
                        ))}
                        {word.meanings.map((meaning, i) => (
                            <div key={`${i}-${meaning.partOfSpeech}`}>
                                <h3 className="text-xl"><b>Part of Speech: </b>{meaning.partOfSpeech}</h3>
                                {meaning.definitions.map((definition) => (
                                    <div key={definition.definition}>
                                        <p className="text-left leading-loose"><b>Definition: </b>{definition.definition}</p>
                                        {definition.example && <p>{definition.example}</p>}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
                {error && <h2>{error}</h2>}
            </section>
        </form>
    );
}