export class DomUtils {
  static create<K extends keyof HTMLElementTagNameMap>(
    doc: Document,
    tagName: K,
    options?: Partial<HTMLElementTagNameMap[K]>,
  ): HTMLElementTagNameMap[K] {
    const el = doc.createElement(tagName);

    for (const key in options) {
      el[key] = options[key];
    }

    return el;
  }

  static remove(node: HTMLElement | SVGElement): void {
    if (!node.parentNode) {
      return;
    }
    node.parentNode.removeChild(node);
  }
}
