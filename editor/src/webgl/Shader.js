/**
 * Represents a compiled shader
 */
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
    this.handle = null;
  }
}

/**
 * Contains all information necessary to create a shader
 */
class ShaderCreateInfo {
  /**
   * Create a new shader create info object
   * @param {string} name Name of this shader
   * @param {GLenum} type WebGL enum that represents this shader's type
   * @param {string} sourceCode Shader's source code
   */
  constructor(name, type, sourceCode) {
    this.name = name;
    this.type = type;
    this.sourceCode = sourceCode;
  }
}

export { Shader, ShaderCreateInfo };
