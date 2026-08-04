// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("boom: simulated render crash mid-session");
}

// Regression test: the app previously rendered <App /> directly under
// <StrictMode> with no error boundary anywhere in the tree. Any unhandled
// exception during render (e.g. from the webcam/rPPG pipeline, a bad
// settings value, or any third-party dependency) unmounted the whole React
// tree, leaving a blank white page with no explanation and no visible way
// to recover — worst case, mid-breathing-session. This guards that a crash
// is now caught and always leaves the user with a clear, actionable message
// instead of a blank screen.
describe("ErrorBoundary", () => {
  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>Breathing session content</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Breathing session content")).toBeInTheDocument();
  });

  it("catches a render-time crash and shows a recoverable message instead of going blank", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reload and continue/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/local session history .* was not affected/i),
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
