import { useState } from 'react';
import './App.css';
import ChartWithTokens from './Chart/ChartWithTokens';
import { TokensContext, TokensProvider } from './Contexts/TokensContext';
import { CurrentUserProvider } from './Contexts/CurrentUserContext';
import Sidebar from './Sidebar';
import Header from './Header';

function App() {
  return (
    <CurrentUserProvider>
      <TokensProvider>
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
      </TokensProvider>
    </CurrentUserProvider>
  );
}

export default App;
