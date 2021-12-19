import "../style/App.css";

import { Media } from "./Media";
import { Properties } from "./Properties";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";
import { Viewport } from "./Viewport";

function App() {
  return (
    <div className="app">
      <div className="toolbar-container">
        <Toolbar />
      </div>

      <div className="center-panels">
        <div className="media-container">
          <Media />
        </div>
        <div className="viewport-container">
          <Viewport />
        </div>
        <div className="properties-container">
          <Properties />
        </div>
      </div>

      <div className="timeline-container">
        <Timeline />
      </div>
    </div>
  );
}

export default App;
