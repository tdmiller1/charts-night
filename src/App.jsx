import { useState } from 'react';
import './App.css';
import ChartWithTokens from './Chart/ChartWithTokens';
import { TokensProvider } from './Contexts/TokensContext';
import { CurrentUserProvider } from './Contexts/CurrentUserContext';
import { GameControllerProvider } from './Contexts/GameControllerProvider';
import Sidebar from './Sidebar';
import Header from './Header';

function App() {
  return (
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
  );
}

export default App;
