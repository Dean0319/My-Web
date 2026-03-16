export function fitCameraToObject({ THREE, camera, controls, object, padding = 1.2 }) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fov = (camera.fov * Math.PI) / 180;
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance *= padding;

  const direction = new THREE.Vector3(1, 0.6, 1).normalize();
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = Math.max(distance * 100, 2000);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

