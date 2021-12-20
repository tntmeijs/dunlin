const Properties = () => {
  return (
    <div id="properties">
      <label htmlFor="field-of-view-slider">Field of view</label>
      <br />
      <input id="field-of-view-slider" type="range" min="1" max="175" defaultValue="60" />

      <hr />

      <label htmlFor="pitch-slider">Pitch</label>
      <br />
      <input id="pitch-slider" type="range" min="-180" max="180" defaultValue="0" />
      <br />

      <label htmlFor="yaw-slider">Yaw</label>
      <br />
      <input id="yaw-slider" type="range" min="-180" max="180" defaultValue="0" />
      <br />

      <label htmlFor="roll-slider">Roll</label>
      <br />
      <input id="roll-slider" type="range" min="-180" max="180" defaultValue="0" />
    </div>
  );
};

export { Properties };
