import '@testing-library/jest-dom';
import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { render, screen, within, cleanup} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import GetWords from '../components/GetWords'

const server = setupServer(
    http.get("https://api.dictionaryapi.dev/api/v2/entries/en/dog", () => {
      return HttpResponse.json([
        {
          word: 'dog',
          phonetics: [{ text: '/dɔːɡ/', audio: '' }],
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [{ definition: 'A domesticated carnivorous mammal.' }]
            }
          ]
        }
      ])
    }),
    http.get("https://api.dictionaryapi.dev/api/v2/entries/en/pumpkin", () => {
        return HttpResponse.json([
          {
            word: 'pumpkin',
            phonetics: [{ text: '/ˈpʌmpkɪn/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/pumpkin-us.mp3' }],
            meanings: [
              {
                partOfSpeech: 'noun',
                definitions: [{ definition: 'A domesticated plant, in species Cucurbita pepo, similar in growth pattern, foliage, flower, and fruit to the squash or melon.' }]
              }
            ]
          }
        ])
      }),
  );
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  // Ensure localStorage is clean between tests
  beforeEach(() => {
    localStorage.clear();
  });

  // Clean up after each test
  afterEach(() => {
    cleanup();
  });

  test("should render a searched word", async () => {
    render(<GetWords />);
    const user = userEvent.setup();
    
    // Simulate typing the word "pumpkin"
    const input = screen.getByRole('searchbox');
    await user.type(input, 'pumpkin');
    
    // Simulate clicking the search button
    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    // Target only the results section where the word "pumpkin" should appear
    const resultsSection = screen.getByRole('region', { name: /results/i }); // Use a specific region role for results, adjust this to your component structure

    // Wait for "Word: pumpkin" to appear in the results section
 
    expect(await within(resultsSection).findByText('pumpkin')).toBeInTheDocument();
});

test("should show what the user is typing in the searchbar", async () =>  {
    render(<GetWords/>)
    const user = userEvent.setup();
    const input = screen.getByRole("searchbox")

    await user.type(input, 'hello')

    expect(input).toHaveValue('hello')
});

test("should show an error when user submits without entering a word", async () => {
    render(<GetWords />);
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    // Simulate clicking the "Search" button
    await user.click(submitButton);

    // Check that the input is empty
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("");

    // Check that the error message is displayed
    expect(screen.getByText('Please enter a word')).toBeInTheDocument();
});

test('it should clear out the previous search results before rendering new ones', async () => {
    render(<GetWords />);
    const user = userEvent.setup();

    // User types in pumpkin into the searchbar
    const input = screen.getByRole('searchbox');
    await user.type(input, 'dog');
    const resultsSection = screen.getByRole('region', { name: /results/i });

    // Button clicked
    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);
    expect(await within(resultsSection).findByText('dog')).toBeInTheDocument();

    // Clear out form and type in new word 'dog'
    await user.clear(input);
    await user.type(input, 'pumpkin');
    await user.click(submitButton);

    expect(within(resultsSection).queryByText('dog')).not.toBeInTheDocument();

    expect(await within(resultsSection).findByText('pumpkin')).toBeInTheDocument();
});

test('it should let me save words as favorites', async () => {
  render(<GetWords />)
  // Simulate searching for the word "dog"
  const user = userEvent.setup();

  const searchInput = screen.getByPlaceholderText(/search for a word/i);
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'dog');
  await user.click(searchButton);

  // Wait for the word "dog" to appear in the search results
  const wordHeader = await screen.findByRole('heading', { name: /word: dog/i });
  expect(wordHeader).toBeInTheDocument();

  // Click the "Add to Favorites" button
  const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
  await user.click(favoriteButton);

  // Check that "dog" is now in the favorites section
  const favoriteContainer = screen.getByRole('region', { name: /favorites/i });
  expect(within(favoriteContainer).getByText('dog')).toBeInTheDocument();

  // Verify that the "dog" word is present in localStorage
  expect(localStorage.getItem('dog')).toBeTruthy();
})

test('it should let me remove words from favorites', async () => {
  render(<GetWords />)
  // Simulate searching for the word "dog"
  const user = userEvent.setup();

  const searchInput = screen.getByPlaceholderText(/search for a word/i);
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'dog');
  await user.click(searchButton);

  // Wait for the word "dog" to appear in the search results
  const wordHeader = await screen.findByRole('heading', { name: /word: dog/i });
  expect(wordHeader).toBeInTheDocument();

  // Click the "Add to Favorites" button
  const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
  await user.click(favoriteButton);

  // Check that "dog" is now in the favorites section
  const favoriteContainer = screen.getByRole('region', { name: /favorites/i });
  expect(within(favoriteContainer).getByText('dog')).toBeInTheDocument();

  const removeButton = within(favoriteContainer). getByRole('button', {name: /remove/i})
  await user.click(removeButton)

  expect(within(favoriteContainer).queryByTestId('dog')).toBeNull()

  expect(localStorage.getItem('dog')).toBeNull()
})

test('it should let me play the audio file of the word', async () => {
  render(<GetWords />);

  const user = userEvent.setup();

  // Search for the word "pumpkin"
  const searchInput = screen.getByPlaceholderText(/search for a word/i);
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'pumpkin');
  await user.click(searchButton);

  // Wait for the word "pumpkin" to appear in the search results
  const wordHeader = await screen.findByRole('heading', { name: /word: pumpkin/i });
  expect(wordHeader).toBeInTheDocument();

  // Wait for the audio player to appear after the search
  const audioPlayback = await screen.findByLabelText('Audio file');

  // Get the source element from the audio tag
  const audioSource = audioPlayback.querySelector('source');
  expect(audioSource).toHaveAttribute('src', 'https://api.dictionaryapi.dev/media/pronunciations/en/pumpkin-us.mp3');

  // Simulate playing the audio file
  await user.click(audioPlayback);
});
