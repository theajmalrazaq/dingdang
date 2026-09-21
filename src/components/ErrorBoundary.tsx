import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            padding: "24px",
            background:
              "radial-gradient(circle at 50% 0%, var(--bg-gradient-top) 0%, var(--bg-dark) 35%, var(--bg-bottom) 100%)",
            color: "#F4F1EC",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              color: "#EF4444",
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>
            Something went wrong
          </h2>
          <p
            style={{
              color: "#9AA0AC",
              fontSize: "0.9rem",
              maxWidth: "320px",
              marginBottom: "24px",
            }}
          >
            An unexpected glitch occurred in the application view. Please reload to resume playing.
          </p>

          <button
            onClick={this.handleReload}
            className="oura-btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              maxWidth: "200px",
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} />
            <span>Reload App</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
