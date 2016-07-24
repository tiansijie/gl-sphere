var mat4 = require("gl-mat4");
var vec3 = require("gl-vec3")
var glBuffer = require("gl-buffer");

function createSphere(gl, sphere) {
  var position = sphere.position;
  var rotation = sphere.rotation;
  var color = sphere.color;
  var radius = sphere.radius;
  var lat = sphere.latDivision;
  var long = sphere.longDivision;

  var sphereMatrix = mat4.create();
  mat4.identity(sphereMatrix, sphereMatrix);
  mat4.translate(sphereMatrix, sphereMatrix, [position.x, position.y, position.z]);
  mat4.rotateX(sphereMatrix, sphereMatrix, rotation.x);
  mat4.rotateY(sphereMatrix, sphereMatrix, rotation.y);
  mat4.rotateZ(sphereMatrix, sphereMatrix, rotation.z);

  var phiLength = Math.PI * 2;
  var thetaLength = Math.PI;

  var vertices = [];
  var normals = [];
  var colors = [];
  var uvs = [];
  var index = 0;
  var verticesIndex = [];

  var alpha = color.a && color.a >= 0 ? color.a : 1.0;
  for (var y = 0; y <= lat; ++y) {
    var verticesRow = [];
    var v = y / lat;
    for (var x = 0; x <= long; ++x) {
      var u = x / long;
      var px = - radius * Math.cos(u * phiLength) * Math.sin(v * thetaLength);
      var py = radius * Math.cos(v * thetaLength);
      var pz = radius * Math.sin(u * phiLength) * Math.sin(v * thetaLength);

      var normal = [];
      vec3.normalize(normal, [px, py, pz]);
      normals.push(normal[0], normal[1], normal[2]);
      vertices.push(px, py, pz);
      colors.push(color.r, color.g, color.b, alpha);
      uvs.push(u, 1-v);
      verticesRow.push(index);
      index ++;
    }
    verticesIndex.push(verticesRow);
  }

  var indices = [];
  for ( var y = 0; y < lat; ++y ) {
    for ( var x = 0; x < long; ++x ) {
      var v1 = verticesIndex[ y ][ x + 1 ];
      var v2 = verticesIndex[ y ][ x ];
      var v3 = verticesIndex[ y + 1 ][ x ];
      var v4 = verticesIndex[ y + 1 ][ x + 1 ];

      if ( y !== 0 ) {
      	  indices.push( v1, v2, v4 );
      }
      if ( y !== lat - 1 ) {
      	  indices.push( v2, v3, v4 );
      }
    }
  }


  var sphere = {
    vertices: glBuffer(gl, new Float32Array(vertices)),
    colors: glBuffer(gl, new Float32Array(colors)),
    normals: glBuffer(gl, new Float32Array(normals)),
    uvs: glBuffer(gl, new Float32Array(uvs)),
    indices: glBuffer(gl, new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER),
    length: indices.length,
    matrix: sphereMatrix
  };

  return sphere;
}
module.exports = createSphere;
