export class DomUtils {
  static create<K extends keyof HTMLElementTagNameMap>(
    doc: Document,
    tagName: K,
    options?: Partial<HTMLElementTagNameMap[K]>
  ): HTMLElementTagNameMap[K] {
    const el = doc.createElement(tagName);

    for (const key in options) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el as any)[key] = options[key as keyof typeof options];
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
