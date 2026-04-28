if (typeof DragEvent === 'undefined') {
  class DragEvent extends MouseEvent {
    readonly dataTransfer: DataTransfer | null;

    constructor(type: string, init: DragEventInit = {}) {
      super(type, init);
      this.dataTransfer = init.dataTransfer ?? null;
    }
  }

  (globalThis as any).DragEvent = DragEvent;
}
