import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './shared/Tooltip';
import { SocketConnectionContext } from './Contexts/contexts';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static contextType = SocketConnectionContext;
  declare context: React.ContextType<typeof SocketConnectionContext>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    // Disconnect user client if available
    if (this.context && typeof this.context.logoutUser === 'function') {
      this.context.logoutUser();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div
            style={{
              padding: '20px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              textAlign: 'left',
              position: 'absolute',
              top: '0',
            }}
          >
            <h2>Something went wrong.</h2>
            {this.state.error && (
              <p>
                <strong>{this.state.error.toString()}</strong>
              </p>
            )}
            {this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
          <Tooltip content="Report a bug">
            <button
              style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
              }}
              onClick={() => {
                window.open('https://forms.gle/cgYmRzVSgaxJruXW7');
              }}
            >
              <FontAwesomeIcon icon={faBug} />
            </button>
          </Tooltip>
          {this.props.children}
        </>
      );
    }
    return (
      <>
        <Tooltip content="Report a bug" bottom={70} right={5}>
          <button
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
            }}
            onClick={() => {
              window.open('https://forms.gle/cgYmRzVSgaxJruXW7');
            }}
          >
            <FontAwesomeIcon icon={faBug} />
          </button>
        </Tooltip>
        {this.props.children}
      </>
    );
  }
}

export default ErrorBoundary;
