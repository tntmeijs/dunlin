import { mat4 } from "gl-matrix";
import React, { useEffect, useRef } from "react";
import { Shader } from "../webgl/Shader";
import { ShaderProgram } from "../webgl/ShaderProgram";

function initBuffers(gl) {
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

const vsSource = `
attribute vec4 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
}
`;

const fsSource = `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

const Viewport = () => {
  let frameIndex = null;
  let canvas = useRef();

  useEffect(() => {
    /** @type {WebGLRenderingContext} */
    const gl = canvas.current.getContext("webgl");

    if (gl === null) {
      alert("Your browser does not support WebGL :(");
      return;
    }

    const vertexShader = new Shader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = new Shader(gl, fsSource, gl.FRAGMENT_SHADER);

    const basicShaderProgram = new ShaderProgram(gl, [
      vertexShader.handle,
      fragmentShader.handle,
    ]);

    const basicShaderProgramInfo = {
      program: basicShaderProgram.handle,
      attributes: {
        vertexPosition: gl.getAttribLocation(
          basicShaderProgram.handle,
          "aPosition"
        ),
      },
      uniforms: {
        projectionMatrix: gl.getUniformLocation(
          basicShaderProgram.handle,
          "uProjectionMatrix"
        ),
        viewMatrix: gl.getUniformLocation(
          basicShaderProgram.handle,
          "uViewMatrix"
        ),
        modelMatrix: gl.getUniformLocation(
          basicShaderProgram.handle,
          "uModelMatrix"
        ),
      },
    };

    const buffers = initBuffers(gl);

    gl.clearColor(0.333, 0.556, 0.05, 1.0);
    gl.clearDepth(1.0);

    const render = () => {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Projection matrix
      const fieldOfView = (45 * Math.PI) / 180; // in radians
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = mat4.create();
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

      // View matrix
      const viewMatrix = mat4.create();

      // Model matrix
      const modelMatrix = mat4.create();

      // Move to where we can see the object
      mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -6.0]);

      // Bind buffers for rendering
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

      gl.vertexAttribPointer(
        basicShaderProgramInfo.attributes.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.enableVertexAttribArray(
        basicShaderProgramInfo.attributes.vertexPosition
      );

      // Draw using the shader
      gl.useProgram(basicShaderProgramInfo.program);
      gl.uniformMatrix4fv(
        basicShaderProgramInfo.uniforms.projectionMatrix,
        false,
        projectionMatrix
      );
      gl.uniformMatrix4fv(
        basicShaderProgramInfo.uniforms.viewMatrix,
        false,
        viewMatrix
      );
      gl.uniformMatrix4fv(
        basicShaderProgramInfo.uniforms.modelMatrix,
        false,
        modelMatrix
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Render the next frame
      frameIndex = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameIndex);
    };
  });

  return (
    <canvas
      ref={canvas}
      style={{ width: "480px", height: "270px" }}
      width={"1920px"}
      height={"1080px"}
    ></canvas>
  );
};

export default Viewport;
