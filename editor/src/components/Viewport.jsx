import "../style/Viewport.css";

import { useEffect, useRef } from "react";
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
      },
    };

    // Create a new texture whenever the debug URL changes
    const debugUrl = document.getElementById("debug-texture-url");
    debugUrl.onkeyup = () => {
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

      const src = debugUrl.value;
      img.src = src;
    };

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
