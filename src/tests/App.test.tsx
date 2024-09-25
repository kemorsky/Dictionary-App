import '@testing-library/jest-dom';
import { test, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock the window.matchMedia before the tests run
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: query === '(prefers-color-scheme: dark)', // Default to dark mode
            media: query,
            onchange: null,
            addListener: vi.fn(), // Required by some older browsers
            removeListener: vi.fn(),
        })),
    });
});

test('it should let me switch between dark and light mode', async () => {
    render(<App />);

    const user = userEvent.setup();
    const lightButton = screen.getByRole('img', { name: /swap/i });

    // Initial state: Should start in dark mode
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Simulate clicking to switch to light mode
    await user.click(lightButton);

    // Check that dark mode is turned off (light mode activated)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click again to switch back to dark mode
    await user.click(lightButton);

    // Confirm that dark mode is reactivated
    expect(document.documentElement.classList.contains('dark')).toBe(true);
});
