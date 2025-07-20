import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Home from './components/Home';
import Conversation from './components/Conversation';
import ApiKeySetup from './components/ApiKeySetup';
import NetworkStatus from './components/NetworkStatus';

// React Router v7 future flags 설정
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const AppContainer = styled.div`
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const App = () => {
  return (
    <Router {...router}>
      <AppContainer>
        <NetworkStatus />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/setup" element={<ApiKeySetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/conversation" element={<Conversation />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;
