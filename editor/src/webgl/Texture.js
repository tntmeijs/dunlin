/**
 * Represents a texture
 */
class Texture {
  /**
   * Create a new texture
   * @param {WebGLRenderingContext} gl WebGL context
   */
  constructor(gl) {
    this.handle = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));

    // Turn off mipmaps
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  /**
   * Update the texture's data
   * @param {WebGLRenderingContext} gl WebGL context
   * @param {TexImageSource} source Texture data source (image or video object)
   */
  updateTexture(gl, source) {
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  /**
   * Deallocate the texture
   * @param {WebGLRenderingContext} gl WebGL context
   */
  destroy(gl) {
    gl.deleteTexture(this.handle);
    this.handle = null;
  }
}

/**
 * Contains all information necessary to create a texture
 */
class TextureCreateInfo {
  /**
   * Create a new texture texture create info object
   * @param {string} name Name of this texture
   */
  constructor(name) {
    this.name = name;
  }
}

export { Texture, TextureCreateInfo };
