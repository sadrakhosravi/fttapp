import { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: string | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render fallback UI
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    toast.error(`Error: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or nothing, since the toast already displays the error
      return null;
    }

    return this.props.children;
  }
}
