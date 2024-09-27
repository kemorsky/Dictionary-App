import '@testing-library/jest-dom';
import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { render, screen, within, cleanup} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import GetWords from '../components/GetWords'

const server = setupServer( // prepare the mock server I will be working with
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

  // make sure localStorage is clean between tests
  beforeEach(() => {
    localStorage.clear();
  });

  // clean up after each test
  afterEach(() => {
    cleanup();
  });

  test("should render a searched word", async () => {
    render(<GetWords />);
    const user = userEvent.setup();
    
    // Typing the word "pumpkin"
    const input = screen.getByRole('searchbox');
    await user.type(input, 'pumpkin');
    
    // click the search button
    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    // show only search results for pumpkin
    const resultsSection = screen.getByRole('region', { name: /results/i }); // place all pumpkins into the results container

    // wait for pumpkin to yield results
 
    expect(await within(resultsSection).findByText('pumpkin')).toBeInTheDocument();
});

test("should show what the user is typing in the searchbar", async () =>  {
    render(<GetWords/>)
    const user = userEvent.setup();
    const input = screen.getByRole("searchbox")

    await user.type(input, 'hello') // simulate typing in hello

    expect(input).toHaveValue('hello') // output "hello"
});

test("should show an error when user submits without entering a word", async () => {
    render(<GetWords />);
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    // click the search button
    await user.click(submitButton);

    // check if input is empty
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("");

    // check that the error message is shown
    expect(screen.getByText('Please enter a word')).toBeInTheDocument();
});

test('it should clear out the previous search results before rendering new ones', async () => {
    render(<GetWords />);
    const user = userEvent.setup();

    // User types in pumpkin into the searchbar
    const input = screen.getByRole('searchbox');
    await user.type(input, 'dog');
    const resultsSection = screen.getByRole('region', { name: /results/i });

    // click the search button
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
  // search for the word dog
  const user = userEvent.setup();

  const searchInput = screen.getByPlaceholderText(/search for a word/i);
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'dog');
  await user.click(searchButton);

  // wait for the search results to appear
  const wordHeader = await screen.findByRole('heading', { name: /word: dog/i });
  expect(wordHeader).toBeInTheDocument();

  // click on the button to add to favorites
  const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
  await user.click(favoriteButton);

  // check that the word is in the favorites section
  const favoriteContainer = screen.getByRole('region', { name: /favorites/i });
  expect(within(favoriteContainer).getByText('dog')).toBeInTheDocument();

  // check if dog is in localStorage
  expect(localStorage.getItem('dog')).toBeTruthy();
})

test('it should let me remove words from favorites', async () => {
  render(<GetWords />)

  const user = userEvent.setup();

  const searchInput = screen.getByPlaceholderText(/search for a word/i);
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'dog');
  await user.click(searchButton);

  // wait for the word to appear
  const wordHeader = await screen.findByRole('heading', { name: /word: dog/i });
  expect(wordHeader).toBeInTheDocument();

  // click the add to favorites button
  const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
  await user.click(favoriteButton);

  // check if dog is in the favorites section
  const favoriteContainer = screen.getByRole('region', { name: /favorites/i });
  expect(within(favoriteContainer).getByText('dog')).toBeInTheDocument();

  const removeButton = within(favoriteContainer). getByRole('button', {name: /remove/i})
  await user.click(removeButton) // click the remove button

  expect(within(favoriteContainer).queryByTestId('dog')).toBeNull() // check if dog is still in the section

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

  // wait for the word to appear
  const wordHeader = await screen.findByRole('heading', { name: /word: pumpkin/i });
  expect(wordHeader).toBeInTheDocument();

  // wait for the audio player to appear
  const audioPlayback = await screen.findByLabelText('Audio file');

  // get the audio source file
  const audioSource = audioPlayback.querySelector('source');
  expect(audioSource).toHaveAttribute('src', 'https://api.dictionaryapi.dev/media/pronunciations/en/pumpkin-us.mp3');

  // play the audio file
  await user.click(audioPlayback);
});
