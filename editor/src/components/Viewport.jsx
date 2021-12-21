import "../style/Viewport.css";

import { useEffect, useRef } from "react";
import { quat, vec2 } from "gl-matrix";
import { BufferCreateInfo } from "../webgl/Buffer";
import { Renderer } from "../webgl/Renderer";
import { ShaderCreateInfo } from "../webgl/Shader";
import { ShaderProgramCreateInfo } from "../webgl/ShaderProgram";
import { TextureCreateInfo } from "../webgl/Texture";

const VERTEX_SHADER_NAME = "FullscreenTriangleVS";
const FRAGMENT_SHADER_NAME = "FullscreenTriangleFS";
const SHADER_PROGRAM_NAME = "FullscreenTriangle";
const TEXTURE_NAME = "DebugImage";
const TRIANGLE_BUFFER_NAME = "Triangle";
const GRABBING_CLASSNAME = "grabbing";
const DRAG_BUTTON = 1;
const MIN_FOV = 5.0;
const MAX_FOV = 179.0;
const MIN_PITCH = -89.0;
const MAX_PITCH = 89.0;

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
  // @TODO: The ray generation code below is flawed
  //        Use the camera logic shown here: https://raytracing.github.io/books/RayTracingInOneWeekend.html#positionablecamera

  // Ray generation logic adapted from:
  // https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-generating-camera-rays/generating-camera-rays
  float imageAspectRatio = width / height;
  
  vec2 centeredUv = (vTexCoord * 2.0) - 1.0;

  float pixelX = centeredUv.x * tan(fieldOfView / 2.0 * PI / 180.0) * imageAspectRatio; 
  float pixelY = centeredUv.y * tan(fieldOfView / 2.0 * PI / 180.0);

  vec3 lookDirection = vec3(0.0, 0.0, -1.0);
  
  // Generate a ray to sample the spherical texture
  vec3 rayDirection = lookDirection + vec3(pixelX, pixelY, 0.0);
  rayDirection = normalize(rayDirection);

  // Apply camera rotation quaternion
  rayDirection = rotateVector(rayDirection, cameraRotation);

  // Sample the texture
  gl_FragColor = texture2D(uSampler, sampleSphericalMap(rayDirection));
}
`;

const Viewport = () => {
  let canvas = useRef();

  useEffect(() => {
    let frameIndex = null;

    let fov = 60.0;

    let mouseSensitivity = 0.5;
    let scrollSensitivity = 4.0;
    let rollSensitivity = 2.5;

    let pitch = 0;
    let yaw = 0;
    let roll = 0;

    canvas.current.onmouseup = event => event.currentTarget.classList.toggle(GRABBING_CLASSNAME);
    canvas.current.onmousedown = event => event.currentTarget.classList.toggle(GRABBING_CLASSNAME);
    canvas.current.onmouseleave = event => event.currentTarget.classList.remove(GRABBING_CLASSNAME);

    canvas.current.onmousemove = event => {
      if (event.buttons === DRAG_BUTTON) {
        // The smaller the user's field of view, the slower the camera should rotate
        const slowdown = fov / MAX_FOV;
        const deltaYaw = event.movementX * mouseSensitivity * slowdown;
        const deltaPitch = event.movementY * mouseSensitivity * slowdown;

        yaw += deltaYaw;
        pitch += deltaPitch;

        // Ensure the camera cannot roll over
        pitch = Math.min(Math.max(pitch, MIN_PITCH), MAX_PITCH);

        // No need to go outside of the 0 to 360 degrees range
        if (yaw < 0.0) {
          yaw += 360.0;
        } else if (yaw > 360.0) {
          yaw -= 360.0;
        }
      } else {
        event.currentTarget.classList.remove(GRABBING_CLASSNAME);
      }
    };

    canvas.current.onwheel = event => {
      const scrollDirection = Math.sign(event.deltaY);

      if (event.shiftKey) {
        // Shift has been pressed - use the scroll wheel to adjust the roll of the camera
        const delta = scrollDirection * rollSensitivity;
        roll += delta;
      } else {
        // Shift has not been pressed - use the scroll wheel to adjust the field of view of the camera
        const delta = scrollDirection * scrollSensitivity;
        fov = Math.min(Math.max(MIN_FOV, fov + delta), MAX_FOV);
      }
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
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Remove the old texture (if it exists)
      if (renderer.textures.get(TEXTURE_NAME)) {
        renderer.deleteTexture(TEXTURE_NAME);
      }

      // Request a new texture
      renderer.addTexture(
        new TextureCreateInfo(
          TEXTURE_NAME,
          img,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE
        )
      );
    };

    const src = "https://upload.wikimedia.org/wikipedia/commons/0/0a/Veste_Oberhaus_%28Passau%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg";
    img.src = src;
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
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(basicShaderProgramInfo.program);

      /** @type {quat} */
      let orientation = quat.create();
      quat.fromEuler(orientation, pitch, yaw, roll);

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
      gl.uniform1f(basicShaderProgramInfo.uniforms.fieldOfView, fov);
      gl.uniform4f(basicShaderProgramInfo.uniforms.cameraRotation, orientation[0], orientation[1], orientation[2], orientation[3]);

      // Enable texture
      if (renderer.textures.get(TEXTURE_NAME)) {
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
