import React from 'react';
import TorrentList from './components/TorrentList';
import './App.css'; // Keep this for any global styles if needed, or remove if unused.

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main>
        <TorrentList />
      </main>
    </div>
  );
}

export default App;
