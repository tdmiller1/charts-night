import './App.css';
import ChartWithTokens from './Chart/ChartWithTokens';
import { TokensProvider } from './Contexts/TokensContext';
import { CurrentUserProvider } from './Contexts/CurrentUserContext';
import { GameControllerProvider } from './Contexts/GameControllerProvider';
import Sidebar from './Sidebar';
import Header from './Header';
import SocketConnection from './SocketConnection';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <SocketConnection>
        <CurrentUserProvider>
          <TokensProvider>
            <GameControllerProvider>
              <div className="app-layout">
                <div className="app-header">
                  <Header />
                </div>
                <div className="app-main">
                  <div className="app-sidebar">
                    <Sidebar />
                  </div>
                  <div className="app-content">
                    <div className="chart-container">
                      <ChartWithTokens />
                    </div>
                  </div>
                </div>
              </div>
            </GameControllerProvider>
          </TokensProvider>
        </CurrentUserProvider>
      </SocketConnection>
    </ErrorBoundary>
  );
}

export default App;
