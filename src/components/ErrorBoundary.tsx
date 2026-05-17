import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Clear chunk_reload session storage
    sessionStorage.removeItem("chunk_reload");
    
    // Clear service worker caches if it's a chunk error
    if (
      this.state.error?.message.includes("dynamically imported module") || 
      this.state.error?.message.includes("Failed to fetch")
    ) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
    }
    
    // Force reload
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-foreground mb-4">Update Available</h1>
            <p className="text-muted-foreground mb-6">
              We've just released a new version of Alpha Appeal. Please refresh to load the latest features.
            </p>
            <Button onClick={this.handleReset} className="w-full gap-2" size="lg" variant="sage">
              <RefreshCw className="w-5 h-5" />
              Refresh Application
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 text-left bg-muted p-4 rounded text-xs text-muted-foreground overflow-auto max-h-32">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
