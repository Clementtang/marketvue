import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import type { Language } from '../i18n/translations';

interface Props {
  children: ReactNode;
  language: Language;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI.
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * Log the error to an error reporting service
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      errorInfo,
    });

    // In production, you could send this to an error reporting service like Sentry
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  /**
   * Reset the error boundary state
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reload the page
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { language } = this.props;
      const { error } = this.state;

      const title = language === 'zh-TW' ? '發生錯誤' : 'Something went wrong';
      const description = language === 'zh-TW'
        ? '應用程式發生了意外錯誤，請重新載入頁面或聯繫支援團隊。'
        : 'An unexpected error occurred. Please reload the page or contact support if the problem persists.';
      const retryButton = language === 'zh-TW' ? '重試' : 'Try Again';
      const reloadButton = language === 'zh-TW' ? '重新載入頁面' : 'Reload Page';
      const errorDetailsTitle = language === 'zh-TW' ? '錯誤詳情：' : 'Error Details:';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
              {title}
            </h2>

            {/* Error Description */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              {description}
            </p>

            {/* Error Details (Development/Debug) */}
            {import.meta.env.DEV && error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {errorDetailsTitle}
                </p>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
                  {error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.resetError}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {retryButton}
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {reloadButton}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
