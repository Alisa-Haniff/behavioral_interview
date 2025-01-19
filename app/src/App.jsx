import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BehavioralPrep from './BehavioralPrep';
import Sidebar from "./Sidebar";
import TipsAndTricks from "./TipsAndTricks";

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {/* Sidebar on the left */}
        <Sidebar />
        {/* Main content area */}
        <div style={{ marginLeft: '200px', padding: '20px', flex: 1 }}>
          <Routes>
            {/* Define routes */}
            <Route path="/" element={<BehavioralPrep />} />
            <Route path="/tips-tricks" element={<TipsAndTricks />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
