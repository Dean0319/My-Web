export function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    if (key === "class") {
      node.className = value;
      continue;
    }
    if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
      continue;
    }
    node.setAttribute(key, String(value));
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === undefined || child === null) continue;
    if (typeof child === "string") {
      node.appendChild(document.createTextNode(child));
      continue;
    }
    node.appendChild(child);
  }

  return node;
}
