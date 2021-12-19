import { useEffect, useRef } from "react";
import { Shader } from "../webgl/Shader";
import { ShaderProgram } from "../webgl/ShaderProgram";
import { Texture } from "../webgl/Texture";

const vsSource = `
attribute vec2 aPosition;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTexCoord = 0.5 * gl_Position.xy + vec2(0.5);
}
`;

const fsSource = `
varying highp vec2 vTexCoord;

uniform sampler2D uSampler;

void main() {
  gl_FragColor = texture2D(uSampler, vTexCoord);
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
        triangleVertexIndex: gl.getAttribLocation(
          basicShaderProgram.handle,
          "aPosition"
        ),
      },
      uniforms: {
        sampler: gl.getUniformLocation(basicShaderProgram.handle, "uSampler"),
      },
    };

    // Create a new texture whenever the debug URL changes
    const texture = new Texture(gl);
    const debugUrl = document.getElementById("debug-texture-url");
    debugUrl.onkeyup = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        texture.setImageData(gl, img, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE);
      };

      const src = debugUrl.value;
      img.src = src;
    };

    // Create a buffer with indices for a full-screen triangle
    // https://stackoverflow.com/a/59739538/11220609
    const buffer = gl.createBuffer();
    const positions = [-1.0, -1.0, 3.0, -1.0, -1.0, 3.0];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW
    );

    gl.clearColor(0.333, 0.556, 0.05, 1.0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(basicShaderProgramInfo.program);

      // Bind the buffer that contains the data to render a full-screen triangle
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
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

      // Enable texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture.handle);
      gl.uniform1i(basicShaderProgramInfo.uniforms.sampler, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

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

export { Viewport };
