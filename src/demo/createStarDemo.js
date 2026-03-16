import * as THREE from "three";

// 创建一个可点击的“示例五角星”模型。
//
// 设计意图：
// - 初始就能看到一个模型（满足模板预览）
// - 由多个可点击部件组成（满足“点击部件查看介绍”）
// - 部件用 userData.partId 绑定到介绍数据（见 src/data/partDetails.js）

function makeExtrudedShape(points2D, { depth = 0.18, bevel = 0.03 } = {}) {
  const shape = new THREE.Shape(points2D.map((p) => new THREE.Vector2(p[0], p[1])));
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 16,
  });
}

function polar(r, a) {
  return [Math.cos(a) * r, Math.sin(a) * r];
}

export function createStarDemo() {
  const root = new THREE.Group();
  root.name = "DemoStar";

  // 底座（不可点击）
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.7, 0.25, 64),
    new THREE.MeshStandardMaterial({ color: 0x2f2a22, roughness: 0.95, metalness: 0.05 })
  );
  plinth.position.y = 0.125;
  plinth.name = "Plinth";
  plinth.userData.pickable = false;
  root.add(plinth);

  // 五角星拆成：中心五边形 + 5 个尖角（三角形），每个尖角是一个可点击部件。
  // 注意：这不是严格的几何布尔运算，而是“教学用分块”，更利于点击介绍。
  const outerR = 1.15;
  const innerR = 0.55;
  const start = -Math.PI / 2;

  const inner = [];
  for (let i = 0; i < 5; i++) {
    inner.push(polar(innerR, start + ((i * 2 + 1) * Math.PI) / 5));
  }

  const centerGeo = makeExtrudedShape(inner, { depth: 0.2, bevel: 0.02 });
  centerGeo.rotateX(Math.PI / 2);
  centerGeo.translate(0, 0.26, 0);

  const center = new THREE.Mesh(
    centerGeo,
    new THREE.MeshStandardMaterial({ color: 0xfbF7ee, roughness: 0.55, metalness: 0.08 })
  );
  center.name = "Center";
  center.userData.partId = "center";
  center.userData.pickable = true;
  root.add(center);

  const spikeColors = [0x0a5c5a, 0xb1462f, 0x6b6357, 0x2f2a22, 0x8b5e3c];
  for (let i = 0; i < 5; i++) {
    const a0 = start + (i * 2 * Math.PI) / 5;
    const a1 = start + ((i * 2 + 1) * Math.PI) / 5;
    const a2 = start + ((i * 2 + 2) * Math.PI) / 5;

    const pA = polar(innerR, a1 - Math.PI / 10);
    const pB = polar(outerR, a0);
    const pC = polar(innerR, a1 + Math.PI / 10);

    const geo = makeExtrudedShape([pA, pB, pC], { depth: 0.22, bevel: 0.03 });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0.26, 0);

    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: spikeColors[i % spikeColors.length],
        roughness: 0.52,
        metalness: 0.08,
      })
    );

    mesh.name = `Spike_${i + 1}`;
    mesh.userData.partId = `p${i + 1}`;
    mesh.userData.pickable = true;
    root.add(mesh);

    // 让每个尖角略微“抬起”一点，增加层次
    mesh.position.y += 0.01;
  }

  // 模型整体抬起，避免和地面重叠
  root.position.y = 0.02;

  return { root };
}
