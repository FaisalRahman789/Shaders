varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform sampler2D t_Noise;
uniform sampler2D t_Matcap;
uniform float u_Time;
uniform float u_Scale;

#include <normal_pars_fragment>

void main() {
  
  vec4 diffuseColor = vec4(1.0);
  vec4 glowColor = vec4(0.2667, 0.8745, 0.6, 1.0);
  
  #include <normal_fragment_begin>

  vec3 viewDir = normalize(vViewPosition);
	vec3 x = normalize( vec3(viewDir.z, 0.0, -viewDir.x));
	vec3 y = cross(viewDir, x);
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ));

  vec3 outgoingLight = diffuseColor.rgb ;

  
  vec4 tNoise = texture2D(t_Noise, uv + vec2(u_Time * - 0.2, u_Time * - 0.1));
  float noise = (tNoise.r + tNoise.g + tNoise.b);

   float glowFalloff = step(u_Scale, noise);

   outgoingLight = mix(glowColor.rgb + glowColor.rgb, outgoingLight, glowFalloff);

  #include <output_fragment>

  gl_FragColor.a = glowFalloff;
}

// varying vec3 vViewPosition;
// varying vec3 vWorldPosition;

// uniform sampler2D t_Noise;
// uniform sampler2D t_Matcap;
// uniform float u_Time;
// uniform float u_Scale;

// // Simplex 2D noise
// //
// vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

// float snoise(vec2 v){
//   const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//            -0.577350269189626, 0.024390243902439);
//   vec2 i  = floor(v + dot(v, C.yy) );
//   vec2 x0 = v -   i + dot(i, C.xx);
//   vec2 i1;
//   i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//   vec4 x12 = x0.xyxy + C.xxzz;
//   x12.xy -= i1;
//   i = mod(i, 289.0);
//   vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//   + i.x + vec3(0.0, i1.x, 1.0 ));
//   vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
//     dot(x12.zw,x12.zw)), 0.0);
//   m = m*m ;
//   m = m*m ;
//   vec3 x = 2.0 * fract(p * C.www) - 1.0;
//   vec3 h = abs(x) - 0.5;
//   vec3 ox = floor(x + 0.5);
//   vec3 a0 = x - ox;
//   m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//   vec3 g;
//   g.x  = a0.x  * x0.x  + h.x  * x0.y;
//   g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//   return 130.0 * dot(m, g);
// }

// void main() {
  
//   vec4 diffuseColor = vec4(1.0);
//   vec4 glowColor = vec4(0.2667, 0.8745, 0.6, 1.0);
  
//   // Include the normal calculation code
//   vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
//   vec3 viewDir = normalize(vViewPosition);
//   vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
//   vec3 y = cross(viewDir, x);
//   vec2 uv = vec2(dot(x, normal), dot(y, normal)) + vec2(0.0, 0.49); // Adjusted UV to remove artifacts
  
//   // Sample Simplex noise
//   float noiseValue = snoise(uv + vec2(u_Time * -0.2, u_Time * -0.1));

//   // Modify glowFalloff using the noise value
//   float glowFalloff = step(u_Scale, noiseValue);

//   // Mix the glowColor with the original color based on glowFalloff
//   vec3 outgoingLight = mix(glowColor.rgb, diffuseColor.rgb, glowFalloff);

//   // Include the output code
//   gl_FragColor = vec4(outgoingLight, 1.0);
//   gl_FragColor.a = glowFalloff;
// }







