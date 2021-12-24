import { fullscreenTriangleVS } from "./shaders/FullscreenTriangleVS";
import { equirectangularFS } from "./shaders/EquirectangularFS";

import { BaseRenderer } from "./BaseRenderer";
import { ShaderCreateInfo } from "./Shader";
import { ShaderProgramCreateInfo } from "./ShaderProgram";
import { TextureCreateInfo } from "./Texture";
import { BufferCreateInfo } from "./Buffer";
import { Camera } from "./Camera";

/**
 * This renderer is capable of rendering equirectangular media
 */
class EquirectangularRenderer {
  /**
   * Create a new equirectangular renderer instance
   * @param {WebGLRenderingContext} gl WebGL context
   */
  constructor(gl) {
    /**
     * @private
     * @type {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * @private
     * @type {BaseRenderer}
     */
    this.renderer = new BaseRenderer(gl);
    /**
     * @private
     * @type {ShaderProgram}
     */
    this.equirectangularShader = null;

    /**
     * @private
     * @type {buffer}
     */
    this.triangle = null;

    /**
     * @private
     * @type {Camera}
     */
    this.camera = new Camera(75.0);
  }

  /**
   * Initialize the renderer
   */
  initialize() {
    // Since WebGL cannot use compile-time arrays in shaders, it is necessary to send the vertices of the full-screen triangle
    // manually to the GPU instead
    this.renderer.addBuffer(
      new BufferCreateInfo(
        "fullscreenTriangleData",
        this.gl.ARRAY_BUFFER,
        new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
        this.gl.STATIC_DRAW
      )
    );

    this.triangle = this.renderer.getBufferByName("fullscreenTriangleData");

    // Load required shaders
    this.renderer.addShader(new ShaderCreateInfo("fullscreenTriangleVS", this.gl.VERTEX_SHADER, fullscreenTriangleVS));
    this.renderer.addShader(new ShaderCreateInfo("equirectangularFS", this.gl.FRAGMENT_SHADER, equirectangularFS));

    // Link shaders into a shader program
    this.renderer.addProgram(new ShaderProgramCreateInfo("equirectangularShader", ["fullscreenTriangleVS", "equirectangularFS"]));

    // An output texture is necessary to render the scene to the canvas
    this.renderer.addTexture(new TextureCreateInfo("equirectangularOutput"));

    // Register the correct attributes with the shader program
    this.equirectangularShader = this.renderer.getShaderProgramByName("equirectangularShader");
    this.equirectangularShader.withAttribute("aPosition");

    // Register the correct uniforms with the shader program
    this.equirectangularShader.withUniform("uFieldOfView");
    this.equirectangularShader.withUniform("uCameraRotation");
    this.equirectangularShader.withUniform("uSampler");

    // Always clear the back buffer with a white color
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Flip images automatically - HTML images are loaded top to bottom but WebGL expect images to be loaded from bottom to top
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  /**
   * Update the renderer's internal state prior to rendering
   */
  update() { }

  /**
   * Render the scene
   */
  render() {
    // @TODO: refactor rendering logic so it no longer shows raw WebGL calls
    //        Everything should be abstracted nicely
    //        The renderer used in this renderer should take in a scene graph-like object that automagically binds everything
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Prepare to render a full-screen textured triangle
    this.equirectangularShader.use();

    this.triangle.bind();

    this.gl.vertexAttribPointer(this.equirectangularShader.getAttributeLocation("aPosition"), 2, this.gl.FLOAT, false, 8, 0);
    this.gl.enableVertexAttribArray(this.equirectangularShader.getAttributeLocation("aPosition"));
    this.gl.uniform1f(this.equirectangularShader.getUniformLocation("uFieldOfView"), this.camera.getFieldOfView());
    this.gl.uniform4fv(this.equirectangularShader.getUniformLocation("uCameraRotation"), this.camera.getRotation());

    // Activate the output texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.getTextureByName("equirectangularOutput").handle);
    this.gl.uniform1i(this.equirectangularShader.getUniformLocation("uSampler"), 0);

    // Render the full-screen textured triangle
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  /**
   * Deallocate all constructed resources
   */
  cleanup() {
    this.renderer.cleanup();
  }

  /**
   * Update the equirectangular texture's pixels
   * @param {TexImageSource} source Image or video source
   */
  updateEquirectangularTextureSource(source) {
    this.renderer.updateTextureData("equirectangularOutput", source);
  }

  /**
   * Rotate the scene's camera
   * @param {number} pitch Pitch value to add to the current pitch
   * @param {number} yaw Yaw value to add to the current yaw
   * @param {number} roll Roll value to add to the current roll
   */
  rotateCamera(pitch, yaw, roll) {
    this.camera.addPitch(pitch);
    this.camera.addYaw(yaw);
    this.camera.addRoll(roll);
  }

  /**
   * Change the scene's camera field of view
   * @param {number} fieldOfView Field of view angle in degrees to add to the current field of view angle
   */
  changeCameraFieldOfView(fieldOfView) {
    this.camera.addFieldOfView(fieldOfView);
  }
}

export { EquirectangularRenderer };
