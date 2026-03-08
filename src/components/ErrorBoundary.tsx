import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TrailBlazer] Uncaught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-danger"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Something went wrong</h2>
            <p className="text-text-secondary text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.hash = '#/'
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/** Wraps individual route pages so a crash in one page doesn't take down the whole app */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TrailBlazer] Route error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[40vh] px-4">
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-bold text-text mb-2">This page had a problem</h3>
            <p className="text-text-secondary text-sm mb-4">
              {this.state.error?.message || 'Something went wrong loading this section.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.hash = '#/'
                }}
                className="px-4 py-2 border border-border text-text rounded-lg text-sm font-medium hover:bg-bg transition-colors cursor-pointer"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
