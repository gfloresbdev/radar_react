import React from "react";
import "./DebugPanel.css";

const DebugPanel = ({ devLoggedIn, setDevLoggedIn }) => (
  <div className="debug-panel">
    <div className="debug-panel-title">debug variables</div>
    <div className="debug-panel-item">
      <input
        type="checkbox"
        id="devLoggedIn"
        checked={devLoggedIn}
        onChange={e => setDevLoggedIn(e.target.checked)}
      />
      <label htmlFor="devLoggedIn">Set Log In</label>
    </div>
  </div>
);

export default DebugPanel;