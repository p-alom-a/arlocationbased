import * as THREE from 'three';
import * as LocAR from 'locar';

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const locar = new LocAR.LocationBased(scene, camera);

window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
});

let firstLocation = true;

const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

locar.on("gpsupdate", (pos, distMoved) => {
    if(firstLocation) {
        // Coordonnées spécifiques pour le cube
        const targetLongitude = 1.4795619094617978;
        const targetLatitude = 44.11273960461151;

        const geom = new THREE.BoxGeometry(10, 10, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geom, material);

        locar.add(
            mesh,
            targetLongitude,
            targetLatitude
        );

        firstLocation = false;
    }
});

locar.startGps();

renderer.setAnimationLoop(animate);

function animate() {
    deviceOrientationControls.update();
    renderer.render(scene, camera);
}
