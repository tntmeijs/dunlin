const isPowerOfTwo = (value) => {
  return (value & (value - 1)) === 0;
};

/**
 * Represents a texture
 */
class Texture {
  /**
   * Create a new texture from pixel data
   *
   * Bind the texture and update its internal texture data with new data from an array
   *
   * Do note that this is a relatively slow operation
   * It is always preferred to update textures on the GPU whenever possible
   * @param {WebGLRenderingContext} gl WebGL context
   * @param {TexImageSource} image Image source
   * @param {GLenum} textureFormat Pixel data format of the WebGL texture (e.g. gl.RGBA)
   * @param {GLenum} sourceFormat Pixel data format of the input source (e.g. gl.RGBA)
   * @param {GLenum} sourceDataType Type of data used per channel in the source pixels (e.g. gl.UNSIGNED_BYTE)
   */
  constructor(gl, image, textureFormat, sourceFormat, sourceDataType) {
    this.handle = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      textureFormat,
      sourceFormat,
      sourceDataType,
      image
    );

    // WebGL 1 treats power of two textures slightly differently
    if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
      // Dimensions are a power of two - generate mipmaps
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // Dimensions are not a power of two - turn off mipmaps and clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
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
   * @param {TexImageSource} image Image source
   * @param {GLenum} texturePixelFormat Texture pixel format
   * @param {GLenum} imagePixelFormat Source image pixel format
   * @param {GLenum} pixelChannelDataType Data used per channel of a pixel
   */
  constructor(
    name,
    image,
    texturePixelFormat,
    imagePixelFormat,
    pixelChannelDataType
  ) {
    this.name = name;
    this.image = image;
    this.texturePixelFormat = texturePixelFormat;
    this.imagePixelFormat = imagePixelFormat;
    this.pixelChannelDataType = pixelChannelDataType;
  }
}

export { Texture, TextureCreateInfo };
