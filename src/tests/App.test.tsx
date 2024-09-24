import '@testing-library/jest-dom';
import { test, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Since window.matchMedia is a browser API thingie it mocks it before the test runs
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',  // Simulate initial dark mode preference
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated method but still required for some browsers
        removeListener: vi.fn(), // Deprecated method but still required for some browsers
      })),
    });
  });

test('it should let me switch between dark and light mode', async () => {
    render(<App/>)

    const user = userEvent.setup();
    const lightButton = screen.getByRole('img', {name: /swap/i})

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(lightButton)

    // After clicking, the "dark" class should now be off since it's the preferred state
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate clicking again to switch back to dark mode
    await user.click(lightButton);

    // The "light" class should be removed, indicating dark mode again
    expect(document.documentElement.classList.contains('dark')).toBe(true);
})