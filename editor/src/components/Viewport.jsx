import "../style/Viewport.css";

import { useEffect, useRef, useState } from "react";
import { EquirectangularRenderer } from "../webgl/EquirectangularRenderer";

const GRABBING_CLASSNAME = "grabbing";
const DRAG_BUTTON = 1;

const Viewport = () => {
  const canvas = useRef();
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    /** @type {WebGLRenderingContext} */
    const gl = canvas.current.getContext("webgl");

    if (gl === null) {
      setWebglSupported(false);
      return;
    }

    const renderer = new EquirectangularRenderer(gl);

    // === START DEBUG CODE ===
    const activeVideo = document.createElement("video");
    activeVideo.crossOrigin = "anonymous";
    activeVideo.autoplay = true;
    activeVideo.muted = true;
    activeVideo.loop = true;

    let frameIndex = null;

    canvas.current.onmouseup = event => event.currentTarget.classList.toggle(GRABBING_CLASSNAME);
    canvas.current.onmousedown = event => event.currentTarget.classList.toggle(GRABBING_CLASSNAME);
    canvas.current.onmouseleave = event => event.currentTarget.classList.remove(GRABBING_CLASSNAME);

    canvas.current.onmousemove = event => {
      if (event.buttons === DRAG_BUTTON) {
        renderer.rotateCamera(event.movementY, event.movementX, 0.0);
      } else {
        event.currentTarget.classList.remove(GRABBING_CLASSNAME);
      }
    };

    canvas.current.onwheel = event => {
      // Use the scroll wheel to adjust the field of view of the camera
      renderer.changeCameraFieldOfView(event.deltaY);
    };

    let videoUpdate = false;
    let videoStarted = false;
    activeVideo.ontimeupdate = () => {
      videoUpdate = true;
    };

    activeVideo.onplaying = () => {
      videoStarted = true;
    };

    // NASA, Public domain, via Wikimedia Commons
    activeVideo.src = "https://upload.wikimedia.org/wikipedia/commons/0/0a/NASA_VR-360_Astronaut_Training-_Space_Walk.webm";
    activeVideo.play();

    // === END DEBUG CODE ===

    renderer.initialize();

    // Render loop
    const draw = () => {
      if (videoUpdate && videoStarted) {
        renderer.updateEquirectangularTextureSource(activeVideo);
      }

      renderer.update();
      renderer.render();

      // Render the next frame
      frameIndex = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameIndex);
      renderer.cleanup();
    };
  }, []);

  return webglSupported
    ? <canvas id="viewport-canvas" ref={canvas} width={"1920px"} height={"1080px"}></canvas>
    : <h1>Your browser does not support WebGL - you cannot use this application, sorry!</h1>;
};

export { Viewport };
