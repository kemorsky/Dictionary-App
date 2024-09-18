import '@testing-library/jest-dom';
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GetWords from '../components/GetWords'

test("should let the user type", () => {
    render(<GetWords/>)
    expect(screen.getByPlaceholderText("Search for a word")).toBeInTheDocument();
});

test("should show what the user is typing in the searchbar", async () =>  {
    render(<GetWords/>)
    const user = userEvent.setup();
    const input = screen.getByRole("searchbox")

    await user.type(input, 'hello')

    expect(input).toHaveValue('hello')
})

test('it should clear out the previous search results before rendering new ones', async () => {
    render(<GetWords/>)
    const user = userEvent.setup();
    const input = screen.getByRole("searchbox")
    const form = screen.getByRole("searchbox").closest('form');

    await user.type(input, "cat{Enter}")

    expect(form).toHaveValue('')
})