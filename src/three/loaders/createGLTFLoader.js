import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// 统一创建 GLTFLoader。
// 说明：这里默认启用 Draco（如果模型没有 Draco 压缩也不会有影响）。
// 若你需要完全离线：把 decoder 文件放到 public/ 并将 decoderPath 改为本地路径。
export function createGLTFLoader() {
  const gltfLoader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "js" });
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
  gltfLoader.setDRACOLoader(dracoLoader);

  return gltfLoader;
}
