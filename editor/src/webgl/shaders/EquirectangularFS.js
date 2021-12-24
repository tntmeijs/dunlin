/**
 * Fragment shaders used to render equirectangular images with a virtual camera
 */
const equirectangularFS = `
#define PI 3.1415926538
precision mediump float;

const float width = 1920.0;
const float height = 1080.0;

varying highp vec2 vTexCoord;

uniform float uFieldOfView;
uniform vec4 uCameraRotation;
uniform sampler2D uSampler;

// Spherical map sampling math from:
// https://learnopengl.com/PBR/IBL/Diffuse-irradiance
const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 sampleSphericalMap(vec3 direction) {
  vec2 uv = vec2(atan(direction.z, direction.x), asin(direction.y));
  uv *= invAtan;
  uv += 0.5;
  return uv;
}

// Rotate a vector with a quaternion from:
// https://blog.molecular-matters.com/2013/05/24/a-faster-quaternion-vector-multiplication/
vec3 rotateVector(vec3 v, vec4 q) {
  vec3 t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

void main() {
  vec2 centeredUv = (vTexCoord * 2.0) - 1.0;

  // Aspect ratio correction
  float imageAspectRatio = width / height;
  float pixelX = centeredUv.x * tan(uFieldOfView / 2.0 * PI / 180.0) * imageAspectRatio; 
  float pixelY = centeredUv.y * tan(uFieldOfView / 2.0 * PI / 180.0);

  // Generate a ray to sample the spherical texture
  vec3 rayDirection = normalize(rotateVector(vec3(pixelX, pixelY, -1.0), uCameraRotation));

  // Sample the equirectangular texture
  gl_FragColor = texture2D(uSampler, sampleSphericalMap(rayDirection));
}
`;

export { equirectangularFS };
