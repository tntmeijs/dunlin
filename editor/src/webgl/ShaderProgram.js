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
    this.gl = gl;
    this.attributes = new Map();
    this.uniforms = new Map();

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
   * Set this shader program as the active shader program
   */
  use() {
    this.gl.useProgram(this.handle);
  }

  /**
   * Reference an attribute
   * @param {string} attribute Attribute name
   */
  withAttribute(attribute) {
    if (!this.attributes.has(attribute)) {
      const location = this.gl.getAttribLocation(this.handle, attribute);
      this.attributes.set(attribute, location);
    }
  }

  /**
   * Reference a uniform
   * @param {string} uniform Uniform name
   */
  withUniform(uniform) {
    if (!this.uniforms.has(uniform)) {
      const location = this.gl.getUniformLocation(this.handle, uniform);
      this.uniforms.set(uniform, location);
    }
  }

  /**
   * Fetch an attribute location
   * @param {string} attribute Attribute name
   * @returns {number} Attribute location
   */
  getAttributeLocation(attribute) {
    const location = this.attributes.get(attribute);

    if (location === undefined) {
      console.warn(`No attribute registered with name "${attribute}"`);
    }

    return location;
  }

  /**
   * Fetch a uniform location
   * @param {string} uniform Uniform name
   * @returns {WebGLUniformLocation} Uniform location
   */
  getUniformLocation(uniform) {
    const location = this.uniforms.get(uniform);

    if (uniform === undefined) {
      console.warn(`No uniform registered with name "${uniform}"`);
    }

    return location;
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
