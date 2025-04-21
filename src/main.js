import * as THREE from 'three';
import * as LocAR from 'locar';

// Add global error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.message, e);
});

// Set up camera and renderer
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up scene and location-based AR
const scene = new THREE.Scene();
let locar;

try {
  console.log("Initializing LocationBased");
  locar = new LocAR.LocationBased(scene, camera);
  console.log("LocationBased initialized successfully");
} catch (error) {
  console.error("Error initializing LocationBased:", error);
}

// Handle window resizing
window.addEventListener("resize", e => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Set up webcam for AR background
let cam;
try {
  console.log("Initializing Webcam");
  cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
      console.log("Video started successfully");
      scene.background = texture;
    }
  });
  
  // Explicitly start the webcam
  console.log("Starting webcam");
  
} catch (error) {
  console.error("Error initializing Webcam:", error);
}

// Set up device orientation controls for camera movement
let deviceOrientationControls;
try {
  console.log("Initializing DeviceOrientationControls");
  deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);
  console.log("DeviceOrientationControls initialized successfully");
} catch (error) {
  console.error("Error initializing DeviceOrientationControls:", error);
}

// Define the specific location for the cube
const specificLongitude = 1.4801421133388066;
const specificLatitude = 44.112751060465904;
let cubeAdded = false;

// Handle GPS updates
locar.on("gpsupdate", (pos, distMoved) => {
  console.log("GPS updated:", pos.coords.latitude, pos.coords.longitude);
  
  // Add the cube only once
  if (!cubeAdded) {
    try {
      // Create a single red cube
      const geom = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshBasicMaterial({color: 0xff0000});
      const cube = new THREE.Mesh(geom, material);
      
      // Add the cube at the specific location
      locar.add(cube, specificLongitude, specificLatitude);
      console.log("Cube added at:", specificLatitude, specificLongitude);
      cubeAdded = true;
    } catch (error) {
      console.error("Error adding cube:", error);
    }
  }
});

// Handle GPS errors
locar.on("gpserror", (error) => {
  console.error("GPS Error:", error);
});

// Start GPS tracking
try {
  console.log("Starting GPS");
  locar.startGps();
  console.log("GPS started successfully");
} catch (error) {
  console.error("Error starting GPS:", error);
}

// Set up animation loop
function animate() {
  try {
    if (deviceOrientationControls) {
      deviceOrientationControls.update();
    }
    renderer.render(scene, camera);
  } catch (error) {
    console.error("Error in animation loop:", error);
  }
}

renderer.setAnimationLoop(animate);

// Add permission request for mobile devices
document.addEventListener('DOMContentLoaded', function() {
  // Create a button to request permissions
  const button = document.createElement('button');
  button.textContent = 'Start AR Experience';
  button.style.position = 'absolute';
  button.style.top = '20px';
  button.style.left = '50%';
  button.style.transform = 'translateX(-50%)';
  button.style.zIndex = '1000';
  button.style.padding = '10px 20px';
  
  button.addEventListener('click', function() {
    // Request device orientation permission on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            console.log("Device orientation permission granted");
          } else {
            console.error("Device orientation permission denied");
          }
        })
        .catch(error => {
          console.error("Error requesting device orientation permission:", error);
        });
    }
    
    // Hide the button after click
    button.style.display = 'none';
  });
  
  document.body.appendChild(button);
});