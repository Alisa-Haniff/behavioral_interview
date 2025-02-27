import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BehavioralPrep from './BehavioralPrep';
import Sidebar from "./Sidebar";
import TipsAndTricks from "./TipsAndTricks";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "row", marginTop: "60px" }}>
  <Sidebar />
  <div className="content">
    <Routes>
      <Route path="/" element={<BehavioralPrep />} />
      <Route path="/tips-tricks" element={<TipsAndTricks />} />
    </Routes>
  </div>
</div>

    </Router>
  );
}

export default App;
