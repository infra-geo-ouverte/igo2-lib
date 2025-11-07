export interface ITreeConfig<T> {
  getChildren: (dataNode: T) => T[] | undefined | null;
  getId: (dataNode: T) => string;
  getLevel: (dataNode: T) => number;
  reverse?: boolean;
}

export const TREE_SEPERATOR = '.';

export class Tree<T> {
  private _data: T[];

  getChildren: (dataNode: T) => T[] | undefined | null;
  getId: (dataNode: T) => string;
  getLevel: (dataNode: T) => number;

  constructor(
    initialData: T[],
    private config: ITreeConfig<T>
  ) {
    this.getChildren = config.getChildren;
    this.getId = config.getId;
    this.getLevel = config.getLevel;

    this._data = this.sortDeep(initialData);
  }

  get data(): readonly T[] {
    return this._data;
  }

  get flattened(): readonly T[] {
    return this.flatten([...this.data]);
  }

  add(...nodes: T[]): T[] {
    this.sortDeep(nodes);
    this._data.unshift(...nodes);
    return nodes;
  }

  addBefore(beforeId: string | undefined, ...nodes: T[]): void {
    this.sortDeep(nodes);
    this._addBefore(beforeId, this._data, ...nodes);
  }

  remove(...nodes: T[]): T[] {
    return this._remove(...nodes);
  }

  clear(): void {
    this._data = [];
  }

  exist(node: T): boolean {
    const id = this.getId(node);
    return this.flattened.some((layer) => this.getId(layer) === id);
  }

  /**
   * Move a node to a different position
   * @param node
   * @param beforeTo The position of index into the tree. If -1 move at the end
   */
  moveTo(beforeTo: number[], ...nodes: T[]): T[] {
    const clonedBeforeTo = [...beforeTo];
    const lastIndex = clonedBeforeTo.pop();
    const recipient = this.getAncestorAtPosition(clonedBeforeTo);
    const beforeId =
      lastIndex === -1 || lastIndex >= recipient.length
        ? null
        : this.getId(recipient[lastIndex]);

    const nodesToMove = nodes.filter((node) => beforeId !== this.getId(node));
    return this.move(beforeId, recipient, ...nodesToMove);
  }

  getPosition(node: T): number[] {
    const id = this.getId(node);
    return this._getPosition(id);
  }

  private _addBefore(
    beforeId: string | undefined,
    recipient = this._data,
    ...nodes: T[]
  ): T[] {
    if (!beforeId) {
      recipient.push(...nodes);
      return nodes;
    }

    const beforeIndex = this.getIndex(beforeId, recipient);
    recipient.splice(beforeIndex, 0, ...nodes);

    return nodes;
  }

  private _remove(...nodes: T[]): T[] {
    return nodes.reduce((acc: T[], node) => {
      const ancestor = this.getNodeAncestor(node);
      if (!ancestor) {
        return;
      }

      const index = this.getIndex(this.getId(node), ancestor);
      if (index === -1) {
        return;
      }
      ancestor.splice(index, 1);

      return acc.concat(node);
    }, []);
  }

  /**
   * Move an node before an id
   * @param node Node to be move
   * @param recipient
   * @param beforeId
   */
  private move(
    beforeId: string | undefined,
    recipient: T[],
    ...nodes: T[]
  ): T[] {
    this._remove(...nodes);
    return this._addBefore(beforeId, recipient, ...nodes);
  }

  private _getPosition(
    id: string,
    ancestorsIndex: number[] = [],
    values = this._data
  ) {
    let indexList: number[];
    values.some((value, index) => {
      if (this.getId(value) === id) {
        indexList = ancestorsIndex.concat(index);
        return true;
      }

      const children = this.getChildren(value);
      if (children) {
        const groupIndexList = this._getPosition(
          id,
          ancestorsIndex.concat(index),
          children
        );
        if (groupIndexList) {
          indexList = groupIndexList;
          return true;
        }
      }

      return false;
    });
    return indexList;
  }

  private getAncestorAtPosition(position: number[]) {
    if (!position.length) {
      return this._data;
    }
    const node = this.getNodeByPosition(position);
    return this.getChildren(node);
  }

  /** Recursive */
  private sortDeep(data = this._data): T[] {
    data.forEach((node) => {
      const children = this.getChildren(node);
      if (children) {
        this.sortDeep(children);
      }
    });
    return this.sort(data);
  }

  private sort(children: T[]): T[] {
    const sorted = children.sort((a, b) => this.getLevel(a) - this.getLevel(b));
    return this.config.reverse ? sorted.reverse() : sorted;
  }

  /** Recursive */
  private _getNodeById(id: string, data = this._data): T {
    let node: T;
    data.some((item) => {
      if (this.getId(item) === id) {
        node = item;
        return true;
      }

      const children = this.getChildren(item);
      if (children) {
        node = this._getNodeById(id, children);
        if (node) {
          return true;
        }
      }

      return false;
    });
    return node;
  }

  getNodeByPosition(indexes: number[]): T {
    if (indexes.length > 1) {
      return indexes.reduce((previousValue: T, index) => {
        const ancestor = previousValue
          ? this.getChildren(previousValue)
          : this._data;
        return this._getByIndex(index, ancestor);
      }, null);
    } else {
      return this._getByIndex(indexes[0]);
    }
  }

  private _getByIndex(index: number, ancestor = this._data) {
    return ancestor[index];
  }

  private getNodeAncestor(node: T): T[] {
    const id = this.getId(node);
    return this.getAncestorById(id);
  }

  /** Recursive */
  private getAncestorById(id: string, data = this._data): T[] | undefined {
    let ancestor: T[];
    data.some((item) => {
      if (this.getId(item) === id) {
        ancestor = data;
        return true;
      }

      const children = this.getChildren(item);
      if (children) {
        ancestor = this.getAncestorById(id, children);
        if (ancestor) {
          return true;
        }
      }

      return false;
    });
    return ancestor;
  }

  /** Recursive */
  private flatten(nodes: T[]): T[] {
    return nodes.reduce((list, node) => {
      const children = this.getChildren(node);
      if (children) {
        const flattened = this.flatten(children);
        list.push(node, ...flattened);
      } else {
        list.push(node);
      }
      return list;
    }, [] as T[]);
  }

  private getIndex(id: string, ancestor: T[]): number {
    return ancestor.findIndex((node) => this.getId(node) === id);
  }
}
