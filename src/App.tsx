import React from 'react';
import { TransmissionProvider } from './providers/TransmissionProvider';
import Main from './components/Main';

function App() {
  return (
    <TransmissionProvider>
      <Main />
    </TransmissionProvider>
  );
}

export default App;