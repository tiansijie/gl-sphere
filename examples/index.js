var canvas   = document.body.appendChild(document.createElement('canvas'))
var clear    = require('gl-clear')({ color: [0, 0, 0, 1] })
var gl       = require('gl-context')(canvas, render)
var glBuffer = require('gl-buffer')
var mat4     = require('gl-mat4')
var glShader = require('gl-shader')
var glslify  = require('glslify')
var createSphere = require("../index.js");

var shader = glShader(gl,
  glslify("./shader.vert"),
  glslify("./shader.frag")
);

shader.attributes.aPosition.location = 0;
shader.attributes.aColor.location = 1;
shader.attributes.aNormal.location = 2;
gl.enable(gl.DEPTH_TEST);

var sphere1 = createSphere(
  gl,
  {
    radius: 3,
    longDivision: 30,
    latDivision: 30,
    position: {x: 0.5, y: -1.0, z: -14.0},
    rotation: {x: 0, y: Math.PI / 3, z: Math.PI / 5},
    color: {r: 0.8, g: 0.1, b: 0.2, a: 1.0}
  }
);

var spheres = [];
spheres.push(sphere1);

var projectionMatrix = mat4.create();
var normalMatrix = mat4.create();
function render() {
  var width = gl.drawingBufferWidth
  var height = gl.drawingBufferHeight
  // Clear the screen and set the viewport before
  // drawing anything
  clear(gl)
  gl.viewport(0, 0, width, height)

  // Calculate projection matrix
  mat4.perspective(projectionMatrix, Math.PI / 4, width / height, 0.1, 100)

  // Bind the shader
  shader.bind()
  shader.uniforms.uProjection = projectionMatrix

  // Draw the square
  for(var i = 0; i < spheres.length; ++i) {
    var sphere = spheres[i];
    shader.uniforms.uModelView = sphere.matrix;
    mat4.invert(normalMatrix, sphere.matrix);
    mat4.transpose(normalMatrix, normalMatrix);
    shader.uniforms.uNormalMatrix = normalMatrix;

    sphere.vertices.bind();
    shader.attributes.aPosition.pointer();
    sphere.colors.bind();
    shader.attributes.aColor.pointer();
    sphere.normals.bind();
    shader.attributes.aNormal.pointer();
    sphere.indices.bind();
    gl.drawElements(gl.TRIANGLES, sphere.length, gl.UNSIGNED_SHORT, 0);
  }
}

// Resize the canvas to fit the screen
window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)
