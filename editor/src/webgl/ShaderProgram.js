/**
 * Represents a linked shader program
 */
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
    this.handle = null;
  }
}

/**
 * Contains all information necessary to create a shader program
 */
class ShaderProgramCreateInfo {
  /**
   * Create a new shader program create info object
   * @param {string} name Name of this shader program
   * @param {Array.<string>} requiredShaderNames Names of the shaders that are required by this shader program
   */
  constructor(name, requiredShaderNames) {
    this.name = name;
    this.requiredShaderNames = requiredShaderNames;
  }
}

export { ShaderProgram, ShaderProgramCreateInfo };
