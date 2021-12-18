class Shader {
  /**
   * Create a new shader from source code
   * @param {WebGLRenderingContext} gl WebGL context
   * @param {String} source Shader source code
   * @param {GLenum} type Shader type
   */
  constructor(gl, source, type) {
    this.handle = gl.createShader(type);

    gl.shaderSource(this.handle, source);
    gl.compileShader(this.handle);

    if (!gl.getShaderParameter(this.handle, gl.COMPILE_STATUS)) {
      console.error(
        `Shader compile error: ${gl.getShaderInfoLog(this.handle)}`
      );
      gl.deleteShader(this.handle);
    }
  }

  /**
   * Deallocate the shader
   * @param {WebGLRenderingContext} gl WebGL context
   */
  destroy(gl) {
    gl.deleteShader(this.handle);
  }
}

export { Shader };
