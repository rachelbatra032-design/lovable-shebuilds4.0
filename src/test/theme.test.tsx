import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, ThemeToggle } from "@/components/ThemeProvider";

describe("Optional theme preference", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });
  it("starts light and persists the user's dark mode choice", () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("kaimaaral-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("kaimaaral-theme")).toBe("light");
  });
  it("restores a saved dark preference", async () => {
    localStorage.setItem("kaimaaral-theme", "dark");
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
  });
});