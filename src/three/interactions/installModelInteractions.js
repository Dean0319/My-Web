import * as THREE from "three";

// 安装“模型交互”：
// - 左右滑动（或鼠标拖拽）让模型绕 Y 轴转动（turntable）
// - 轻触/点击：射线拾取（Raycaster）选中模型部件
//
// 设计说明：
// - 这里把“拖拽旋转”和“点击拾取”放在同一处处理，避免两套监听器互相干扰。
// - 旋转的是 pivot（通常是一个 Group），而不是相机：更符合“左右滑动看模型”的直觉。

export function installModelInteractions({ canvas, camera, pickRoot, pivot, onPick, onRotate }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const state = {
    dragging: false,
    pointerId: null,
    downX: 0,
    downY: 0,
    lastX: 0,
    lastTime: 0,
    moved: 0,
    velocity: 0,
  };

  const config = {
    rotateSpeed: 0.008, // px -> rad
    clickThreshold: 6, // px
    inertiaDamping: 0.92,
    inertiaStop: 0.00002,
  };

  function setPointerFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.set(x, y);
  }

  function pick(e) {
    if (!pickRoot) {
      onPick?.(null);
      return;
    }

    setPointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);

    // 只在当前模型树里拾取，避免地面/网格/灯光等被选中
    const hits = raycaster.intersectObject(pickRoot, true);
    const hit = hits.find((h) => h.object?.userData?.pickable !== false);

    onPick?.(hit || null);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    state.dragging = true;
    state.pointerId = e.pointerId;
    state.downX = e.clientX;
    state.downY = e.clientY;
    state.lastX = e.clientX;
    state.lastTime = performance.now();
    state.moved = 0;

    canvas.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!state.dragging || state.pointerId !== e.pointerId) return;

    const dx = e.clientX - state.lastX;
    const now = performance.now();
    const dt = Math.max(now - state.lastTime, 1);

    state.moved += Math.abs(e.clientX - state.downX) + Math.abs(e.clientY - state.downY);

    pivot.rotation.y += dx * config.rotateSpeed;
    onRotate?.(pivot.rotation.y);

    state.velocity = (dx * config.rotateSpeed) / dt;
    state.lastX = e.clientX;
    state.lastTime = now;
  }

  function onPointerUp(e) {
    if (state.pointerId !== e.pointerId) return;

    state.dragging = false;
    state.pointerId = null;
    canvas.releasePointerCapture?.(e.pointerId);

    const dist = Math.hypot(e.clientX - state.downX, e.clientY - state.downY);
    if (dist <= config.clickThreshold) pick(e);
  }

  function onPointerCancel() {
    state.dragging = false;
    state.pointerId = null;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);

  function update() {
    // 拖拽中不应用惯性，避免和手势冲突
    if (state.dragging) return;

    if (Math.abs(state.velocity) < config.inertiaStop) {
      state.velocity = 0;
      return;
    }

    pivot.rotation.y += state.velocity * 16; // 近似按 60fps 换算
    state.velocity *= config.inertiaDamping;
    onRotate?.(pivot.rotation.y);
  }

  function dispose() {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerCancel);
  }

  return { update, dispose };
}
