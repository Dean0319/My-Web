import * as THREE from "three";

// 示例模型：简易建筑 + 周边环境（用于模板初始展示）
//
// 目标：
// - 一打开就能看到“像历史街区”的场景（建筑 + 街道 + 绿化）
// - 建筑可被拆分点击（屋顶/立面/门/窗/招牌等）
// - 环境也可点击（道路/树/路灯等），用于扩展展示内容
//
// 交互绑定方式：mesh.userData.partId（见 src/data/partDetails.js）

function mat(color, { roughness = 0.85, metalness = 0.02 } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addShadowHints(mesh) {
  // 我们没有开启真实 shadow（对性能/教学不必要），这里不做 cast/receive。
  // 保留函数是为了未来扩展时方便打开 shadows。
  mesh.userData.shadowReady = true;
}

function createTree({ x, z, id }) {
  const g = new THREE.Group();
  g.name = `Tree_${id}`;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.55, 10),
    mat(0x5b4636, { roughness: 0.95 })
  );
  trunk.position.y = 0.275;
  trunk.userData.partId = `env_tree_${id}`;
  g.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 12),
    mat(0x2f6f50, { roughness: 0.92 })
  );
  crown.position.y = 0.55;
  crown.userData.partId = `env_tree_${id}`;
  g.add(crown);

  g.position.set(x, 0, z);
  g.rotation.y = (Math.random() * Math.PI) / 2;

  addShadowHints(trunk);
  addShadowHints(crown);

  return g;
}

function createLamp({ x, z, id }) {
  const g = new THREE.Group();
  g.name = `Lamp_${id}`;

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 1.05, 12),
    mat(0x2f2a22, { roughness: 0.6, metalness: 0.15 })
  );
  pole.position.y = 0.525;
  pole.userData.partId = `env_lamp_${id}`;
  g.add(pole);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 14, 12),
    mat(0xf3efe6, { roughness: 0.35, metalness: 0.08 })
  );
  head.position.set(0, 1.02, 0);
  head.userData.partId = `env_lamp_${id}`;
  g.add(head);

  // 伪“灯光”效果：用 emissive 提一点亮度
  head.material.emissive = new THREE.Color(0xfff2c6);
  head.material.emissiveIntensity = 0.35;

  g.position.set(x, 0, z);
  addShadowHints(pole);
  addShadowHints(head);

  return g;
}

export function createBuildingDemo() {
  const root = new THREE.Group();
  root.name = "DemoBuildingScene";

  // 道路/广场底面（独立于 three 场景自带的 ground）
  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.08, 8),
    mat(0xf7f1e3, { roughness: 0.95, metalness: 0 })
  );
  plaza.position.set(0, 0.04, 0);
  plaza.userData.partId = "env_plaza";
  root.add(plaza);

  const road = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.06, 2.6),
    mat(0x2f2a22, { roughness: 0.9, metalness: 0.02 })
  );
  road.position.set(0, 0.03, -1.7);
  road.userData.partId = "env_road";
  root.add(road);

  const roadLine = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.01, 0.06),
    mat(0xf3efe6, { roughness: 0.8, metalness: 0 })
  );
  roadLine.position.set(0, 0.065, -1.7);
  roadLine.userData.pickable = false;
  root.add(roadLine);

  // 简易“历史街区”建筑（拆分可点选）
  const b = new THREE.Group();
  b.name = "Building_A";
  b.position.set(0, 0.08, 1.0);
  root.add(b);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.4, 1.6),
    mat(0xe7ddc6, { roughness: 0.95, metalness: 0 })
  );
  base.position.set(0, 0.7, 0);
  base.name = "Facade";
  base.userData.partId = "bldg_facade";
  b.add(base);

  // 屋顶：做一个简易人字顶（两块斜面）
  const roofGroup = new THREE.Group();
  roofGroup.name = "Roof";
  roofGroup.userData.partId = "bldg_roof";
  roofGroup.position.set(0, 1.52, 0);

  const roofMat = mat(0x8b5e3c, { roughness: 0.75, metalness: 0.03 });
  const roofPlaneGeo = new THREE.BoxGeometry(2.55, 0.08, 1.05);

  const roofLeft = new THREE.Mesh(roofPlaneGeo, roofMat);
  roofLeft.rotation.z = THREE.MathUtils.degToRad(28);
  roofLeft.position.set(-0.62, 0, 0);
  roofLeft.userData.partId = "bldg_roof";
  roofGroup.add(roofLeft);

  const roofRight = new THREE.Mesh(roofPlaneGeo, roofMat);
  roofRight.rotation.z = THREE.MathUtils.degToRad(-28);
  roofRight.position.set(0.62, 0, 0);
  roofRight.userData.partId = "bldg_roof";
  roofGroup.add(roofRight);

  const ridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.72, 16),
    mat(0x2f2a22, { roughness: 0.7, metalness: 0.08 })
  );
  ridge.rotation.x = Math.PI / 2;
  ridge.position.set(0, 0.12, 0);
  ridge.userData.partId = "bldg_roof";
  roofGroup.add(ridge);

  b.add(roofGroup);

  // 门
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.82, 0.06),
    mat(0x2f2a22, { roughness: 0.85, metalness: 0.03 })
  );
  door.position.set(0, 0.41, 0.83);
  door.name = "Door";
  door.userData.partId = "bldg_door";
  b.add(door);

  // 招牌
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.22, 0.08),
    mat(0x0a5c5a, { roughness: 0.75, metalness: 0.02 })
  );
  sign.position.set(0, 1.1, 0.84);
  sign.name = "Sign";
  sign.userData.partId = "bldg_sign";
  b.add(sign);

  // 窗（左右各两扇）
  const winMat = mat(0xb1462f, { roughness: 0.7, metalness: 0.02 });
  const glassMat = mat(0xf3efe6, { roughness: 0.15, metalness: 0.05 });
  glassMat.transparent = true;
  glassMat.opacity = 0.55;

  function windowAt(x, y, id) {
    const g = new THREE.Group();
    g.name = `Window_${id}`;
    g.userData.partId = `bldg_window_${id}`;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.05), winMat);
    frame.userData.partId = `bldg_window_${id}`;
    g.add(frame);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.02), glassMat);
    glass.position.z = 0.03;
    glass.userData.partId = `bldg_window_${id}`;
    g.add(glass);

    g.position.set(x, y, 0.83);
    return g;
  }

  b.add(windowAt(-0.75, 0.62, "L1"));
  b.add(windowAt(0.75, 0.62, "R1"));
  b.add(windowAt(-0.75, 1.02, "L2"));
  b.add(windowAt(0.75, 1.02, "R2"));

  // 侧面“小巷”提示：一段矮墙
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.55, 0.12),
    mat(0xded3be, { roughness: 0.95, metalness: 0 })
  );
  wall.position.set(1.55, 0.275, 0.55);
  wall.rotation.y = THREE.MathUtils.degToRad(35);
  wall.userData.partId = "env_wall";
  root.add(wall);

  // 环境：树与路灯
  const trees = [
    createTree({ x: -3.0, z: 1.8, id: 1 }),
    createTree({ x: -3.3, z: 0.9, id: 2 }),
    createTree({ x: 3.1, z: 2.0, id: 3 }),
    createTree({ x: 3.4, z: 1.0, id: 4 }),
  ];
  for (const t of trees) root.add(t);

  root.add(createLamp({ x: -2.2, z: -1.2, id: 1 }));
  root.add(createLamp({ x: 2.2, z: -1.2, id: 2 }));

  // 让整体更靠近世界原点，便于 fitCamera
  root.position.y = 0;

  // 控制整体规模（更像“街区模型”）
  root.scale.setScalar(1.0);

  return { root };
}
