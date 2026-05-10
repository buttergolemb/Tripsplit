// Top-level error boundary. Catches render/runtime errors anywhere in the tree
// and renders a recoverable UI instead of a blank iPhone screen. We keep the
// boundary inside IPhoneMockup so the fallback fits inside the device frame.

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Useful in dev; in prod we'd forward to a logger/reporter.
    console.error("[AppErrorBoundary] render crash:", error, info);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center bg-[#F7F7F5] px-8 text-center">
          <div className="size-16 rounded-full bg-[#FFE8EF] flex items-center justify-center mb-4">
            <AlertTriangle className="size-8 text-[#FF3B30]" strokeWidth={2} />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1C1C1E] mb-1.5">
            Something went sideways
          </h2>
          <p className="text-[13px] text-[#6E6E73] leading-relaxed mb-6 max-w-[280px]">
            The screen crashed while rendering. You can try again, or reload the
            app if it keeps happening.
          </p>
          {import.meta.env.DEV && (
            <pre className="w-full max-w-[320px] text-[11px] text-left bg-white rounded-[10px] p-3 mb-4 overflow-auto text-[#FF3B30] max-h-40">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 h-11 px-4 rounded-[14px] bg-[#007AFF] text-white font-semibold text-[14px] active:scale-[0.98]"
            >
              <RotateCcw className="size-4" strokeWidth={2.4} />
              Try again
            </button>
            <button
              onClick={this.handleReload}
              className="h-11 px-4 rounded-[14px] bg-white text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98] ring-1 ring-black/5"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
