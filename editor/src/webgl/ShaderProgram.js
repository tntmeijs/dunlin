class ShaderProgram {
  /**
   * Create a new shader program by linking the specified shaders
   * @param {WebGLRenderingContext} gl WebGL context
   * @param {Array.<WebGLShader>} shaders Shaders to link into a shader program
   */
  constructor(gl, shaders) {
    this.handle = gl.createProgram();

    shaders.forEach((shader) => gl.attachShader(this.handle, shader));
    gl.linkProgram(this.handle);

    if (!gl.getProgramParameter(this.handle, gl.LINK_STATUS)) {
      console.error(
        `Shader program link error: ${gl.getProgramInfoLog(this.handle)}`
      );
      gl.deleteProgram(this.handle);
    }
  }

  /**
   * Deallocate the shader program
   * @param {WebGLRenderingContext} gl WebGL context
   */
  destroy(gl) {
    gl.deleteProgram(this.handle);
  }
}

export { ShaderProgram };
