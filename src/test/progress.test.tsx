import { render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { Progress } from "@/components/ui/progress";

describe("Progress runtime regression", () => {
  it("renders and updates under StrictMode without a context provider", () => {
    const { rerender } = render(<StrictMode><Progress value={18} aria-label="Knowledge documented" /></StrictMode>);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "18");
    rerender(<StrictMode><Progress value={83} aria-label="Knowledge documented" /></StrictMode>);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "83");
  });
});