import React from 'react';
import { TransmissionProvider } from './providers/TransmissionProvider';
import TorrentList from './components/TorrentList';

function App() {
  return (
    <TransmissionProvider>
      <div className="App">
        <h1>Transmission Client</h1>
        <TorrentList />
      </div>
    </TransmissionProvider>
  );
}

export default App;