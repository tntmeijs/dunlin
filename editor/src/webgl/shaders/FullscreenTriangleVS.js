/**
 * Vertex shaders used to render a full-screen triangle with texture coordinates
 * Inspired by: https://stackoverflow.com/a/59739538/11220609
 */
const fullscreenTriangleVS = `
attribute vec2 aPosition;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTexCoord = 0.5 * gl_Position.xy + vec2(0.5);
}
`;

export { fullscreenTriangleVS };
