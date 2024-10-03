import { useState, useEffect } from "react";

// Define interfaces for the data structure
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Word | null>(null); // Only one word will be displayed at a time (searched or favorite)
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Word[]>([]);

  // Helper function to safely access localStorage
  const getLocalStorage = (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error("Error accessing localStorage:", err);
      return null;
    }
  };

  const setLocalStorage = (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  const removeLocalStorage = (key: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Error removing from localStorage:", err);
    }
  };

  // Load favorites from localStorage on site startup
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedFavorites = Object.keys(localStorage)
        .map((key) => {
          const savedWord = getLocalStorage(key);
          return savedWord ? JSON.parse(savedWord) : null;
        })
        .filter((item) => item !== null);

      setFavorites(savedFavorites as Word[]);
    } catch (err) {
      console.error("Error loading favorites from localStorage:", err);
    }
  }, []);

  const handleSearch = async (event: React.FormEvent) => {
    event?.preventDefault();
    if (searchTerm === "") {
      setError("Please enter a word");
      return;
    }
    setError("");
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`
      );
      const data = await response.json();
      setSearchResults(data[0]); // Display the first result from the search
    } catch (err) {
      setError("Error fetching data.");
    }
  };

  const handleFavorite = (word: Word) => {
    const existingFavorite = favorites.some((fav) => fav.word === word.word);

    if (!existingFavorite) {
      setLocalStorage(word.word, JSON.stringify(word));
      setFavorites([...favorites, word]);
    }
  };

  const removeFavorite = (word: Word) => {
    removeLocalStorage(word.word);
    setFavorites(favorites.filter((fav) => fav.word !== word.word));
  };

  const handleFavoriteClick = (word: Word) => {
    setSearchResults(word); // Replace the currently displayed word with the selected favorite
  };

  return (
    <div className="container mx-auto">
      {/* Search Form */}
      <form className="w-lg" onSubmit={handleSearch}>
        <input
          className="rounded-xl mr-2 mt-4 p-1"
          type="search"
          placeholder="Search for a word"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="bg-gray-900 text-white p-2 rounded-xl" type="submit">
          Search
        </button>
      </form>

      {/* Section to display favorite words list */}
      <section
        aria-label="favorites"
        className="mt-4 bg-white dark:bg-gray-600 text-black dark:text-white p-3 flex align-start flex-col border rounded border-gray-500 dark:border-white"
      >
        <h2>Favorite words:</h2>
        <ul className="flex flex-col w-1/5 max-h-30 justify-around align-center">
          {favorites.map((fav, i) => (
            <li
              key={i}
              className="underline text-left cursor-pointer"
              onClick={() => handleFavoriteClick(fav)}
            >
              {fav.word}
              <button
                className="ml-2 bg-red-900 text-white p-2 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Section to display search result or clicked favorite */}
      <section aria-label="results" className="mt-4">
        {searchResults ? (
          <div className="border rounded border-gray-500 dark:border-white bg-white dark:bg-gray-600 flex flex-col justify-center align-center w-lg mb-5 p-2">
            <h2 className="text-2xl text-black dark:text-white">
              <b>Word: </b>
              {searchResults.word}
              <button
                className="ml-2 bg-gray-500 dark:bg-gray-900 text-white p-2 rounded-xl"
                type="button"
                onClick={() => handleFavorite(searchResults)}
              >
                {favorites.some((fav) => fav.word === searchResults.word)
                  ? "Added to Favorites"
                  : "Add to Favorites"}
              </button>
            </h2>
            {/* Word details (phonetics, meanings, etc.) */}
            {searchResults.phonetics.map((phonetic, i) => (
              <div
                className="border rounded border-black p-2 m-1"
                key={`${i}-${phonetic.text}`}
              >
                <p className="text-left text-xl text-black dark:text-white">
                  <b>Phonetic Text:</b> {phonetic.text}
                </p>
                {phonetic.audio && (
                  <audio aria-label="Audio file" controls>
                    <source src={phonetic.audio} type="audio/mp3" />
                  </audio>
                )}
              </div>
            ))}
            {searchResults.meanings.map((meaning, i) => (
              <div
                className="border rounded border-black p-2 m-1"
                key={`${i}-${meaning.partOfSpeech}`}
              >
                <h3 className="text-left text-xl text-black dark:text-white italic">
                  <b>Part of Speech: </b>
                  {meaning.partOfSpeech}
                </h3>
                {meaning.definitions.map((definition) => (
                  <div key={definition.definition}>
                    <p className="text-left text-xl italic leading-loose text-black dark:text-white">
                      <b>Definition: </b>
                      {definition.definition}
                    </p>
                    {definition.example && (
                      <p className="text-left text-xl text-black dark:text-white italic">
                        <b>Example: </b>
                        {definition.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <h2>No word selected</h2>
        )}
        {error && <h2>{error}</h2>}
      </section>
    </div>
  );
}
