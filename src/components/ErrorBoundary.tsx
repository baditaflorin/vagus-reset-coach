import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Top-level crash guard for the guided reset session.
 *
 * Without this, an unexpected exception anywhere in the render tree (e.g. a
 * malformed webcam frame, a bad settings value, a third-party dependency
 * quirk) unmounts the entire React tree and leaves a blank white page —
 * mid-breathing-session, with no explanation and no visible way to recover.
 * For a calming/therapeutic-adjacent tool, silently going blank is worse
 * than an ordinary app crash: it can startle someone who is mid-exercise
 * and actively relying on the pacer.
 *
 * This boundary catches render-time errors, stops nothing on its own (local
 * data is never at risk since sessions are only persisted on completion),
 * and always shows a clear, reassuring way back in: reload the page. Local
 * session history in IndexedDB is unaffected by a render crash.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "Vagus Reset Coach crashed and was caught by the boundary",
      error,
      info,
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-paper text-ink" role="alert">
          <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-16 text-center">
            <p className="eyebrow">Something went wrong</p>
            <h1 className="coach-title">
              The reset session hit an unexpected error
            </h1>
            <p className="text-base leading-7 text-stone-700">
              Nothing is lost — your saved local session history is stored
              separately and was not affected. Reload to start a fresh session.
              If you were mid-breath, take a slow breath in and out before
              continuing.
            </p>
            <button
              type="button"
              className="control-button primary mx-auto"
              onClick={this.handleReload}
            >
              Reload and continue
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
