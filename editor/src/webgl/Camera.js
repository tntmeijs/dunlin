import { quat, vec3 } from "gl-matrix";

const MIN_FOV = 5.0;
const MIN_PITCH = -89.0;

const MAX_FOV = 179.0;
const MAX_PITCH = 89.0;

const BASE_FOV = 75.0;
const BASE_FOV_ZOOM_SENSITIVITY = 5.0;
const BASE_PITCH_SENSITIVITY = 0.5;
const BASE_YAW_SENSITIVITY = 0.5;
const BASE_ROLL_SENSITIVITY = 5.0;

/**
 * Represents a camera in the world
 */
class Camera {
  /**
   * Create a new camera
   */
  constructor(fov) {
    /**
     * Camera's field of view in degrees
     * @private
     * @type {number}
     */
    this.fov = BASE_FOV;

    /**
     * Camera's field of view zoom sensitivity
     * @private
     * @type {number}
     */
    this.fovZoomSensitivity = BASE_FOV_ZOOM_SENSITIVITY;

    /**
     * Camera's pitch, yaw, and roll relative to the world
     * @private
     * @type {vec3}
     */
    this.pitchYawRoll = vec3.fromValues(0.0, 0.0, 0.0);

    /**
     * Camera's pitch, yaw, and roll sensitivity
     * @private
     * @type {vec3}
     */
    this.pitchYawRollSensitivity = vec3.fromValues(BASE_PITCH_SENSITIVITY, BASE_YAW_SENSITIVITY, BASE_ROLL_SENSITIVITY);
  }

  /**
   * The smaller the user's field of view, the slower the camera should rotate
   * @returns Slowdown multiplier
   */
  getSlowdownBasedOnFov() {
    return this.fov / MAX_FOV;
  }

  /**
   * Increase or decrease the camera's field of view
   * @param {number} fov Field of view to add to the current field of view in degrees
   */
  addFieldOfView(fov) {
    const deltaFov = Math.sign(fov) * this.fovZoomSensitivity;
    this.fov = Math.min(Math.max(MIN_FOV, this.fov + deltaFov), MAX_FOV);
  }

  /**
   * Increase or decrease the pitch angle
   * @param {number} pitch Pitch to add to the current pitch value in degrees
   */
  addPitch(pitch) {
    // Ensure the camera cannot roll over
    const deltaPitch = pitch * this.getSlowdownBasedOnFov() * this.pitchYawRollSensitivity[0];
    this.pitchYawRoll[0] = Math.min(Math.max(MIN_PITCH, this.pitchYawRoll[0] + deltaPitch), MAX_PITCH);
  }

  /**
   * Increase or decrease the yaw angle
   * @param {number} yaw Yaw to add to the current yaw value in degrees
   */
  addYaw(yaw) {
    this.pitchYawRoll[1] += yaw * this.getSlowdownBasedOnFov() * this.pitchYawRollSensitivity[1];

    // No need to go outside of the 0 to 360 degrees range
    if (this.pitchYawRoll[1] < 0.0) {
      this.pitchYawRoll[1] += 360.0;
    } else if (yaw > 360.0) {
      this.pitchYawRoll[1] -= 360.0;
    }
  }

  /**
   * Increase or decrease the roll angle
   * @param {number} roll Roll to add to the current roll value in degrees
   */
  addRoll(roll) {
    this.pitchYawRoll[2] += roll;

    // No need to go outside of the 0 to 360 degrees range
    if (this.pitchYawRoll[2] < 0.0) {
      this.pitchYawRoll[2] += 360.0;
    } else if (roll > 360.0) {
      this.pitchYawRoll[2] -= 360.0;
    }
  }

  /**
   * Returns the camera's field of view in degrees
   * @returns {number} Field of view in degrees
   */
  getFieldOfView() {
    return this.fov;
  }

  /**
   * Returns the camera's rotation in world space
   * @returns {quat} Rotation of the camera
   */
  getRotation() {
    let rotation = quat.create();
    return quat.fromEuler(rotation, this.pitchYawRoll[0], this.pitchYawRoll[1], this.pitchYawRoll[2]);
  }

  /**
   * Returns the minimum field of view this camera supports
   * @returns {number} Minimum field of view
   */
  getMinimumFov() {
    return MIN_FOV;
  }

  /**
   * Returns the maximum field of view this camera supports
   * @returns {number} Maximum field of view
   */
  getMaximumFov() {
    return MAX_FOV;
  }
}

export { Camera };
