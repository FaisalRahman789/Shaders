import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RepeatWrapping } from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const noise = textureLoader.load(["/textures/noise.png"]);

noise.wrapS = noise.wrapT = RepeatWrapping;

const textures = { noise };

// Plane
const planeGeometry = new THREE.PlaneGeometry(2, 2, 32, 32, 32);
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader: /*glsl*/ `
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    
    #include <normal_pars_vertex>
    
    void main() {
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>
      #include <normal_vertex>
      
      #include <begin_vertex>
      #include <project_vertex>
      
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      
      vViewPosition = -mvPosition.xyz;
    }  
  `,
  fragmentShader: /*glsl*/ `
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
  `,
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    u_EffectOrigin: { value: new THREE.Vector3() },
    u_Time: { value: 0 },
    t_Noise: { value: null },
    u_Scale: { value: null },
  },
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.material.uniforms.t_Noise.value = textures.noise;

plane.position.set(0, 0, 0);

scene.add(plane);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(-0.7, 0.8, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update Sphere
  plane.material.uniforms.u_Scale.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
