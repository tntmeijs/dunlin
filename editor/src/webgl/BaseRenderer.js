import { Buffer } from "./Buffer";
import { Shader } from "./Shader";
import { ShaderProgram } from "./ShaderProgram";
import { Texture } from "./Texture";

class BaseRenderer {
  /**
   * Create a new WebGL renderer
   * @param {WebGLRenderingContext} gl WebGL context
   */
  constructor(gl) {
    /**
     * @type {WebGLRenderingContext}
     * @private
     */
    this.gl = gl;

    /**
     * @type {Map.<string, ShaderProgram}
     * @private
     */
    this.programs = new Map();

    /**
     * @type {Map.<string, Shader>}
     * @private
     */
    this.shaders = new Map();

    /**
     * @type {Map.<string, Texture}
     * @private
     */
    this.textures = new Map();

    /**
     * @type {Map.<string, Buffer}
     * @private
     */
    this.buffers = new Map();
  }

  /**
   * Add a new shader to the renderer
   * @param {ShaderCreateInfo} info Information of the shader that needs to be registered with the renderer
   */
  addShader(info) {
    if (this.shaders.has(info.name)) {
      console.warn(
        `Cannot add shader "${info.name}" because a shader with this name has already been added to the renderer`
      );
    } else {
      const shader = new Shader(this.gl, info.sourceCode, info.type);
      this.shaders.set(info.name, shader);
    }
  }

  /**
   * Add a new shader pogram to the renderer
   * @param {ShaderProgramCreateInfo} info Information of the shader program that needs to be registered with the renderer
   */
  addProgram(info) {
    if (this.programs.has(info.name)) {
      console.warn(
        `Cannot add shader program "${info.name}" because a shader program with this name has already been added to the renderer`
      );
    } else {
      const shaders = info.requiredShaderNames
        .map((shaderName) => this.shaders.get(shaderName))
        .filter((shader) => shader !== undefined)
        .map((shader) => shader.handle);

      const program = new ShaderProgram(this.gl, shaders);
      this.programs.set(info.name, program);
    }
  }

  /**
   * Add a new texture to the renderer
   * @param {TextureCreateInfo} info Information of the texture that needs to be reqistered with the renderer
   */
  addTexture(info) {
    if (this.textures.has(info.name)) {
      console.warn(
        `Cannot add texture "${info.name}" because a texture with this name has already been added to the renderer`
      );
    } else {
      const texture = new Texture(this.gl);
      this.textures.set(info.name, texture);
    }
  }

  /**
   * Add a new buffer to the renderer
   * @param {BufferCreateInfo} info Information of the buffer that needs to be reqistered with the renderer
   */
  addBuffer(info) {
    if (this.buffers.has(info.name)) {
      console.warn(
        `Cannot add buffer "${info.name}" because a buffer with this name has already been added to the renderer`
      );
    } else {
      const buffer = new Buffer(
        this.gl,
        info.bindingTarget,
        info.data,
        info.usage
      );

      this.buffers.set(info.name, buffer);
    }
  }

  /**
   * Update an existing texture's data
   * @param {string} name Name of the target texture
   * @param {TexImageSource} source Image or video source 
   */
  updateTextureData(name, source) {
    if (this.textures.has(name)) {
      this.textures.get(name).updateTexture(this.gl, source);
    } else {
      console.warn(`Cannot update texture "${name}" because a texture with this name has not been added to the renderer`);
    }
  }

  /**
   * Delete a texture
   * @param {string} name Name of the texture that should be deleted
   */
  deleteTexture(name) {
    const texture = this.textures.get(name);

    if (texture !== undefined) {
      texture.destroy(this.gl);
      this.textures.delete(name);
    } else {
      console.warn(
        `Cannot delete texture with name ${name} because no texture with this name exists`
      );
    }
  }

  /**
   * Fetch a shader program by name
   * @param {string} program Shader program name
   * @returns {ShaderProgram} Shader program
   */
  getShaderProgramByName(program) {
    const shaderProgram = this.programs.get(program);

    if (shaderProgram === undefined) {
      console.warn(`Cannot fetch a shader program with name "${program}" because it does not exist`);
    }

    return shaderProgram;
  }

  /**
   * Fetch a buffer by name
   * @param {string} buffer Buffer name
   * @returns {Buffer} Buffer
   */
  getBufferByName(buffer) {
    const bufferObject = this.buffers.get(buffer);

    if (bufferObject === undefined) {
      console.warn(`Cannot fetch a buffer with name "${buffer}" because it does not exist`);
    }

    return bufferObject;
  }

  /**
   * Fetch a texture by name
   * @param {string} texture Texture name
   * @returns {Texture} Texture
   */
  getTextureByName(texture) {
    const textureObject = this.textures.get(texture);

    if (textureObject === undefined) {
      console.warn(`Cannot fetch a texture with name "${texture}" because it does not exist`);
    }

    return textureObject;
  }

  /**
   * Deallocate all registered WebGL resources
   */
  cleanup() {
    this.shaders.forEach((shader) => shader.destroy(this.gl));
    this.programs.forEach((program) => program.destroy(this.gl));
    this.textures.forEach((texture) => texture.destroy(this.gl));
    this.buffers.forEach((buffer) => buffer.destroy(this.gl));
  }
}

export { BaseRenderer };
