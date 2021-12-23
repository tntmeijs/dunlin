import { Buffer } from "./Buffer";
import { Shader } from "./Shader";
import { ShaderProgram } from "./ShaderProgram";
import { Texture } from "./Texture";

class Renderer {
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

    /** @todo make this private */
    /**
     * @type {Map.<string, ShaderProgram}
     */
    this.programs = new Map();

    /**
     * @type {Map.<string, Shader>}
     * @private
     */
    this.shaders = new Map();

    /** @todo make this private */
    /**
     * @type {Map.<string, Texture}
     */
    this.textures = new Map();

    /** @todo make this private */
    /**
     * @type {Map.<string, Buffer}
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
   * Run all logic that needs to run once before the renderer can be used
   */
  initialize() {
    // Always clear the back buffer with a white color
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Flip images automatically - HTML images are loaded top to bottom but WebGL expect images to be loaded from bottom to top
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  /**
   * Render the scene
   */
  render() { }

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

export { Renderer };
