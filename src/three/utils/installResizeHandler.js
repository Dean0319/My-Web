export function installResizeHandler({ canvas, renderer, camera }) {
  function resize() {
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : canvas.clientWidth;
    const height = parent ? parent.clientHeight : canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement || canvas);
  resize();

  return () => ro.disconnect();
}

