/**
 * Represents a buffer
 */
class Buffer {
  /**
   * Create a new buffer
   * @param {WebGLRenderingContext} gl WebGL context
   * @param {GLenum} bindingTarget Target binding point (e.g. gl.ARRAY_BUFFER)
   * @param {BufferSource} data Mesh data
   * @param {GLenum} usage Draw usage (static / dynamic / stream)
   */
  constructor(gl, bindingTarget, data, usage) {
    const positions = [-1.0, -1.0, 3.0, -1.0, -1.0, 3.0];

    this.handle = gl.createBuffer();
    gl.bindBuffer(bindingTarget, this.handle);
    gl.bufferData(bindingTarget, data, usage);
  }

  /**
   * Deallocate the buffer
   * @param {WebGLRenderingContext} gl WebGL context
   */
  destroy(gl) {
    gl.deleteBuffer(this.handle);
    this.handle = null;
  }
}

/**
 * Contains all information necessary to create a new buffer
 */
class BufferCreateInfo {
  /**
   * Create a new buffer create info object
   * @param {string} name Name of the buffer
   * @param {GLenum} bindingTarget Target binding point (e.g. gl.ARRAY_BUFFER)
   * @param {BufferSource} data Buffer data
   * @param {GLenum} usage Draw usage (static / dynamic / stream)
   */
  constructor(name, bindingTarget, data, usage) {
    this.name = name;
    this.bindingTarget = bindingTarget;
    this.data = data;
    this.usage = usage;
  }
}

export { Buffer, BufferCreateInfo };
