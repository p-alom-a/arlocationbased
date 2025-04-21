import * as THREE from 'three';
import * as LocAR from 'locar';

// Set up camera and renderer
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up scene and location-based AR
const scene = new THREE.Scene();
const locar = new LocAR.LocationBased(scene, camera);

// Handle window resizing
window.addEventListener("resize", e => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Set up webcam for AR background
const cam = new LocAR.Webcam({
  idealWidth: 1024,
  idealHeight: 768,
  onVideoStarted: texture => {
    scene.background = texture;
  }
});

// Set up device orientation controls for camera movement
const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

// Define the specific location for the cube
const specificLongitude = 1.4801421133388066;
const specificLatitude = 44.112751060465904;

let cubeAdded = false;

// Handle GPS updates
locar.on("gpsupdate", (pos, distMoved) => {
  console.log("GPS updated:", pos.coords.latitude, pos.coords.longitude);
  
  // Add the cube only once
  if (!cubeAdded) {
    // Create a single red cube
    const geom = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const cube = new THREE.Mesh(geom, material);
    
    // Add the cube at the specific location
    locar.add(cube, specificLongitude, specificLatitude);
    
    console.log("Cube added at:", specificLatitude, specificLongitude);
    cubeAdded = true;
  }
});

// Handle GPS errors
locar.on("gpserror", (error) => {
  console.error("GPS Error:", error);
});

// Start GPS tracking
console.log("Starting GPS");
locar.startGps();

// Set up animation loop
renderer.setAnimationLoop(animate);

function animate() {
  deviceOrientationControls.update();
  renderer.render(scene, camera);
}