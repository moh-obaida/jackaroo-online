import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="card-container max-w-lg w-full border border-red-800/50">
            <h2 className="text-lg font-semibold text-red-300 mb-2">
              {this.props.title || 'Something went wrong'}
            </h2>
            <p className="text-sm text-cream-200/70 mb-4">
              A runtime error occurred. You can reload or return home.
            </p>
            <pre className="text-xs text-red-200/80 bg-black/40 rounded-lg p-3 overflow-auto max-h-40 mb-4 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
              <Link to="/" className="btn-secondary flex-1 text-center">
                Back Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
