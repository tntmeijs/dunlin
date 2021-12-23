import "../style/Viewport.css";

import { useEffect, useRef } from "react";
import { BufferCreateInfo } from "../webgl/Buffer";
import { Renderer } from "../webgl/Renderer";
import { ShaderCreateInfo } from "../webgl/Shader";
import { ShaderProgramCreateInfo } from "../webgl/ShaderProgram";
import { TextureCreateInfo } from "../webgl/Texture";
import { Camera } from "../webgl/Camera";

const VERTEX_SHADER_NAME = "FullscreenTriangleVS";
const FRAGMENT_SHADER_NAME = "FullscreenTriangleFS";
const SHADER_PROGRAM_NAME = "FullscreenTriangle";
const TEXTURE_NAME = "DebugImage";
const TRIANGLE_BUFFER_NAME = "Triangle";
const GRABBING_CLASSNAME = "grabbing";
const DRAG_BUTTON = 1;

const vsSource = `
attribute vec2 aPosition;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTexCoord = 0.5 * gl_Position.xy + vec2(0.5);
}
`;

const fsSource = `
#define PI 3.1415926538
precision mediump float;

const float width = 1920.0;
const float height = 1080.0;

varying highp vec2 vTexCoord;

uniform float fieldOfView;
uniform vec4 cameraRotation;
uniform sampler2D uSampler;

// Spherical map sampling math from:
// https://learnopengl.com/PBR/IBL/Diffuse-irradiance
const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 sampleSphericalMap(vec3 direction) {
  vec2 uv = vec2(atan(direction.z, direction.x), asin(direction.y));
  uv *= invAtan;
  uv += 0.5;
  return uv;
}

// Rotate a vector with a quaternion from:
// https://blog.molecular-matters.com/2013/05/24/a-faster-quaternion-vector-multiplication/
vec3 rotateVector(vec3 v, vec4 q) {
  vec3 t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

void main() {
  vec2 centeredUv = (vTexCoord * 2.0) - 1.0;

  // Aspect ratio correction
  float imageAspectRatio = width / height;
  float pixelX = centeredUv.x * tan(fieldOfView / 2.0 * PI / 180.0) * imageAspectRatio; 
  float pixelY = centeredUv.y * tan(fieldOfView / 2.0 * PI / 180.0);

  // Generate a ray to sample the spherical texture
  vec3 rayDirection = normalize(rotateVector(vec3(pixelX, pixelY, -1.0), cameraRotation));

  // Sample the equirectangular texture
  gl_FragColor = texture2D(uSampler, sampleSphericalMap(rayDirection));
}
`;

const Viewport = () => {
  let canvas = useRef();

  useEffect(() => {
    const activeVideo = document.createElement("video");
    activeVideo.crossOrigin = "anonymous";
    activeVideo.autoplay = true;
    activeVideo.muted = true;
    activeVideo.loop = true;

    let frameIndex = null;

    const camera = new Camera();

    canvas.current.onmouseup = event => event.currentTarget.classList.toggle(GRABBING_CLASSNAME);
    canvas.current.onmousedown = event => event.currentTarget.classList.toggle(GRABBING_CLASSNAME);
    canvas.current.onmouseleave = event => event.currentTarget.classList.remove(GRABBING_CLASSNAME);

    canvas.current.onmousemove = event => {
      if (event.buttons === DRAG_BUTTON) {
        camera.addPitch(event.movementY);
        camera.addYaw(event.movementX);
      } else {
        event.currentTarget.classList.remove(GRABBING_CLASSNAME);
      }
    };

    canvas.current.onwheel = event => {
      // Use the scroll wheel to adjust the field of view of the camera
      camera.addFieldOfView(event.deltaY);
    };

    /** @type {WebGLRenderingContext} */
    const gl = canvas.current.getContext("webgl");

    if (gl === null) {
      alert("Your browser does not support WebGL :(");
      return;
    }

    const renderer = new Renderer(gl);

    // Request shaders
    renderer.addShader(
      new ShaderCreateInfo(VERTEX_SHADER_NAME, gl.VERTEX_SHADER, vsSource)
    );
    renderer.addShader(
      new ShaderCreateInfo(FRAGMENT_SHADER_NAME, gl.FRAGMENT_SHADER, fsSource)
    );
    renderer.addProgram(
      new ShaderProgramCreateInfo(SHADER_PROGRAM_NAME, [
        VERTEX_SHADER_NAME,
        FRAGMENT_SHADER_NAME,
      ])
    );
    renderer.addTexture(new TextureCreateInfo(TEXTURE_NAME));

    const basicShaderProgram = renderer.programs.get(SHADER_PROGRAM_NAME);

    const basicShaderProgramInfo = {
      program: basicShaderProgram.handle,
      attributes: {
        triangleVertexIndex: gl.getAttribLocation(
          basicShaderProgram.handle,
          "aPosition"
        ),
      },
      uniforms: {
        sampler: gl.getUniformLocation(basicShaderProgram.handle, "uSampler"),
        cameraRotation: gl.getUniformLocation(basicShaderProgram.handle, "cameraRotation"),
        fieldOfView: gl.getUniformLocation(basicShaderProgram.handle, "fieldOfView")
      },
    };

    // === START DEBUG CODE ===
    // This code has only been added for debugging purposes
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

    // Create a buffer with indices for a full-screen triangle
    // https://stackoverflow.com/a/59739538/11220609
    renderer.addBuffer(
      new BufferCreateInfo(
        TRIANGLE_BUFFER_NAME,
        gl.ARRAY_BUFFER,
        new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
        gl.STATIC_DRAW
      )
    );

    renderer.initialize();

    const render = () => {
      const videoDataAvailable = videoStarted && videoUpdate;

      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(basicShaderProgramInfo.program);

      // Bind the buffer that contains the data to render a full-screen triangle
      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        renderer.buffers.get(TRIANGLE_BUFFER_NAME).handle
      );
      gl.vertexAttribPointer(
        basicShaderProgramInfo.attributes.triangleVertexIndex,
        2,
        gl.FLOAT,
        false,
        8,
        0
      );
      gl.enableVertexAttribArray(
        basicShaderProgramInfo.attributes.triangleVertexIndex
      );
      gl.uniform1f(basicShaderProgramInfo.uniforms.fieldOfView, camera.getFieldOfView());
      gl.uniform4fv(basicShaderProgramInfo.uniforms.cameraRotation, camera.getRotation());

      // Enable texture if there is any video data to display
      if (renderer.textures.get(TEXTURE_NAME) && videoDataAvailable) {
        renderer.updateTextureData(TEXTURE_NAME, activeVideo);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(
          gl.TEXTURE_2D,
          renderer.textures.get(TEXTURE_NAME).handle
        );
        gl.uniform1i(basicShaderProgramInfo.uniforms.sampler, 0);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Render the next frame
      frameIndex = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameIndex);
      renderer.cleanup();
    };
  });

  return (
    <canvas
      id="viewport-canvas"
      ref={canvas}
      width={"1920px"}
      height={"1080px"}
    ></canvas>
  );
};

export { Viewport };
