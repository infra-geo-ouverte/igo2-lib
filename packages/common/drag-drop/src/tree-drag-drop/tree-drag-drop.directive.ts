import { CdkTree } from '@angular/cdk/tree';
import {
  Directive,
  EffectRef,
  ElementRef,
  OnDestroy,
  Renderer2,
  booleanAttribute,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { MatTreeNode } from '@angular/material/tree';

import {
  DropPermission,
  DropPosition,
  DropPositionType,
  TreeDropEvent
} from './tree-drag-drop.interface';

interface DragNodeListeners {
  element: HTMLElement;
  listeners: [string, EventListenerOrEventListenerObject][];
}

export interface ITreeConfig<T> {
  isGroup: (node: T) => boolean;
  descendantLevels: (node: T) => number | undefined;
}

/**
 * This directive should be use with a MatTree flatened
 * It should add all logic to drag the MatTreeNode and connect the (onDrop) output
 * Class added:
 *    Tree: --dragging
 *    Node: --drag-hover | --dragged
 */
@Directive({
  selector: '[igoTreeDragDrop]',
  host: {
    '[class.--dragging]': 'dragging()',
    '(dragover)': 'hostDragOver($event)',
    '(dragleave)': 'hostDragLeave($event)',
    '(drop)': 'hostDrop($event)'
  }
})
export class TreeDragDropDirective<
  T extends { id: string | number } = { id: string | number },
  K = T
> implements OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  draggedNode?: T;
  dropNodeTarget = signal<T | null>(null);
  expandTimeout?: number;
  nodesListeners?: DragNodeListeners[];
  private nodesEffect?: EffectRef = effect(() => {
    this.nodes();
    this.addAllListener();
  });
  dropLineTarget = signal<HTMLElement | null>(null);
  previousDropLine = signal<HTMLElement | null>(null);
  dropPosition = signal<DropPosition | null>(null);
  dragging = signal(false);
  // Use a Set or just manage classes manually since SelectionModel was providing simple toggle
  // But we can stick to simple class logic
  highlightedNode?: T;

  readonly tree = input.required<CdkTree<T, K>>();
  readonly childrenAccessor = input.required<(node: T) => T[]>();
  readonly config = input.required<ITreeConfig<T>>();

  /** The default is 5 */
  readonly maxLevel = input(5);

  readonly treeDragDropIsDisabled = input(false, {
    transform: booleanAttribute
  });

  readonly dragStart = output<T>();

  readonly dropped = output<TreeDropEvent<T>>();

  readonly droppedError = output<DropPermission>();

  readonly nodes = contentChildren(MatTreeNode, { descendants: true });

  constructor() {
    this.dropped.subscribe(() => this.dragEnd());

    effect(() => {
      const disabled = this.treeDragDropIsDisabled();
      disabled ? this.removeAllListener() : this.addAllListener();
    });

    effect(() => {
      const current = this.dropLineTarget();
      const parent = this.elementRef.nativeElement.parentElement;

      if (!current) {
        untracked(() => {
          const previous = this.previousDropLine();
          if (previous !== null) {
            this.renderer.removeChild(parent, previous);
            this.previousDropLine.set(null);
          }
        });
      } else {
        this.renderer.appendChild(parent, current);
      }
    });

    effect(() => {
      if (!this.dragging()) {
        return;
      }
      const targetNode = this.dropNodeTarget();
      const position = this.dropPosition();
      const dropLineTarget = this.dropLineTarget();

      if (targetNode) {
        this.setHighlightedNode(targetNode);

        if (position) {
          if (dropLineTarget) {
            this.updateDropTargetLinePosition(position, dropLineTarget);
          }
          this.handleGroupExpansion(targetNode, position.type === 'inside');
        }
      }
    });
  }

  get isGroup() {
    return this.config().isGroup;
  }

  get getDescendantLevels() {
    return this.config().descendantLevels;
  }

  ngOnDestroy(): void {
    this.removeAllListener();
    this.removeDropTargetLine();
    if (this.nodesEffect) {
      this.nodesEffect.destroy();
      this.nodesEffect = undefined;
    }
  }

  hostDragOver(event: Event): void {
    event.preventDefault();
  }

  hostDragLeave(event: DragEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    if (
      event.clientY < rect.top ||
      event.clientY >= rect.bottom ||
      event.clientX < rect.left ||
      event.clientX >= rect.right
    ) {
      this.dragLeave();
    }
  }

  hostDrop(event: DragEvent): void {
    this.drop(event);
  }

  onDragStart(node: T): void {
    this.addDropTargetLine();

    this.dragging.set(true);
    this.draggedNode = node;
    this.addNodeClass(node.id, '--dragged');

    this.dragStart.emit(node);
  }

  dragEnd(): void {
    this.dragging.set(false);
    this.dropNodeTarget.set(null);
    this.dropPosition.set(null);

    if (this.draggedNode) {
      this.removeNodeClass(this.draggedNode.id, '--dragged');
      this.draggedNode = undefined;
    }

    this.dragLeave();
    this.removeDropTargetLine();
  }

  dragOver(node: T, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dropNodeTarget.set(node);

    const position = this.getPosition(event, node);
    this.dropPosition.set(position);
  }

  dragLeave(): void {
    if (this.expandTimeout) clearTimeout(this.expandTimeout);
    this.expandTimeout = undefined;
    if (this.highlightedNode) {
      this.removeNodeClass(this.highlightedNode.id, '--drag-hover');
      this.highlightedNode = undefined;
    }
  }

  drop(event: DragEvent): void {
    let nodeTarget = this.dropNodeTarget();
    if (!nodeTarget || this.treeDragDropIsDisabled()) {
      return;
    }

    const dropPosition: DropPosition = this.getPosition(event, nodeTarget);

    const validation = this.canDropNode(nodeTarget, dropPosition);
    if (!validation.canDrop) {
      this.droppedError.emit(validation);
      return;
    }

    let targetNodeLevel = this.getNodeLevel(nodeTarget);

    // Allow to drop a last child outside is group. We refer to it's ancestor for the target
    if (
      dropPosition.type === 'below' &&
      dropPosition.level !== targetNodeLevel
    ) {
      const ancestor = this.getNodeAncestors(nodeTarget.id, dropPosition.level);
      if (ancestor) {
        this.dropNodeTarget.set(ancestor);
        nodeTarget = ancestor;
        targetNodeLevel = this.getNodeLevel(nodeTarget);
      }
    }

    if (this.isGroup(nodeTarget)) {
      if (dropPosition.type === 'inside') {
        const isExpanded = this.tree().isExpanded(nodeTarget);
        if (isExpanded) {
          const children = this.getDirectDescendants(nodeTarget);
          if (this.draggedNode && children[0]?.id === this.draggedNode.id) {
            return;
          }
        }

        this.tree().expand(nodeTarget);
        if (this.draggedNode) {
          return this.dropped.emit({
            node: this.draggedNode,
            ref: nodeTarget,
            position: dropPosition.type
          });
        }
        return;
      }
    }

    if (
      dropPosition.type === 'below' &&
      dropPosition.level !== targetNodeLevel
    ) {
      const ancestor = this.getNodeAncestors(nodeTarget.id);
      if (this.draggedNode && ancestor) {
        return this.dropped.emit({
          node: this.draggedNode,
          ref: ancestor,
          position: dropPosition.type
        });
      }
      return;
    }

    if (this.draggedNode && nodeTarget) {
      this.dropped.emit({
        node: this.draggedNode,
        ref: nodeTarget,
        position: dropPosition.type
      });
    }
  }

  private addNodeClass(id: string | number, className: string): void {
    const node = this.findTreeNode(id);
    if (node) {
      this.renderer.addClass(node['_elementRef'].nativeElement, className);
    }
  }

  private removeNodeClass(id: string | number, className: string): void {
    const node = this.findTreeNode(id);
    if (node) {
      this.renderer.removeClass(node['_elementRef'].nativeElement, className);
    }
  }

  private addAllListener(): void {
    if (this.treeDragDropIsDisabled()) {
      return;
    }
    const nodes = this.nodes();
    if (this.nodesListeners) {
      this.removeAllListener();
    }

    this.nodesListeners = nodes?.map((node) => this.addListener(node));
  }

  private addListener(node: MatTreeNode<T>): DragNodeListeners {
    const element = node['_elementRef'].nativeElement as HTMLElement;
    const listeners: [string, EventListenerOrEventListenerObject][] = [
      ['dragstart', () => this.onDragStart(node.data)],
      ['dragend', () => this.dragEnd()],
      [
        'dragover',
        (event: Event) => this.dragOver(node.data, event as DragEvent)
      ],
      ['dragleave', () => this.dragLeave()]
    ];
    element.setAttribute('draggable', 'true');
    listeners.forEach(([type, listener]) =>
      element.addEventListener(type, listener)
    );

    return { element, listeners };
  }

  private removeAllListener(): void {
    this.nodesListeners?.forEach(({ element, listeners }) => {
      listeners.forEach(([type, listener]) => {
        element.setAttribute('draggable', 'false');
        element.removeEventListener(type, listener);
      });
    });
    this.nodesListeners = undefined;
  }

  private setHighlightedNode(node: T): void {
    const toHighlight = this.isGroup(node)
      ? node
      : this.getNodeAncestors(node.id);

    if (this.highlightedNode && this.highlightedNode.id !== toHighlight?.id) {
      this.removeNodeClass(this.highlightedNode.id, '--drag-hover');
      this.highlightedNode = undefined;
    }

    if (toHighlight) {
      this.highlightedNode = toHighlight;
      this.addNodeClass(toHighlight.id, '--drag-hover');
    } else if (this.highlightedNode) {
      this.removeNodeClass(this.highlightedNode.id, '--drag-hover');
      this.highlightedNode = undefined;
    }
  }

  private addDropTargetLine(): void {
    const target: HTMLElement = this.renderer.createElement('div');
    target.classList.add('drop-target-line');
    target.setAttribute(
      'style',
      `position: absolute; top: 0; width: 100%; pointer-events: none; z-index: 4; height: 2px; background-color: black; transition: margin-left 150ms;`
    );
    this.dropLineTarget.set(target);
  }

  private removeDropTargetLine(): void {
    const target = this.dropLineTarget();
    if (target) {
      this.previousDropLine.set(target);
      this.dropLineTarget.set(null);
    }
  }

  private hideDropTargetLine(): void {
    const target = this.dropLineTarget();
    this.renderer.setStyle(target, 'display', 'none');
  }

  private showDropTargetLine(): void {
    const target = this.dropLineTarget();
    this.renderer.setStyle(target, 'display', 'block');
  }

  private updateDropTargetLinePosition(
    position: DropPosition,
    dropLineTarget: HTMLElement
  ): void {
    if (position.type === 'inside') {
      return this.hideDropTargetLine();
    } else {
      this.showDropTargetLine();
    }

    this.renderer.setStyle(
      dropLineTarget,
      'margin-left',
      position.level * 24 + 20 + 'px'
    );
    this.renderer.setStyle(
      dropLineTarget,
      'transform',
      'translate3d(0,' + position.y + 'px, 0)'
    );
  }

  private handleGroupExpansion(node: T, isInside: boolean): void {
    if (!isInside) {
      return this.dragLeave();
    }
    const isOpen = this.tree().isExpanded(node);
    if (!isOpen && !this.expandTimeout) {
      this.expandTimeout = window.setTimeout(() => {
        this.tree().expand(node);
      }, 1200);
    }
  }

  private getNodeElement(node: T): HTMLElement | undefined {
    const treeNode = this.findTreeNode(node.id);
    return treeNode?.['_elementRef'].nativeElement;
  }

  private canDropNode(hoveredNode: T, position: DropPosition): DropPermission {
    if (!this.draggedNode) {
      return { canDrop: false };
    }
    if (this.isGroup(this.draggedNode)) {
      return this.canDropGroup(hoveredNode, position);
    }

    const hasMaxLevelRestrictions = this.validateMaxHierarchyLevel(position);
    if (hasMaxLevelRestrictions) {
      return hasMaxLevelRestrictions;
    }

    return { canDrop: true };
  }

  private canDropGroup(
    hoveredNode: T,
    position: DropPosition
  ): {
    canDrop: boolean;
    message?: string;
    params?: { [key: string]: unknown };
  } {
    if (!this.draggedNode) {
      return { canDrop: false };
    }
    if (hoveredNode.id === this.draggedNode.id) {
      return {
        canDrop: false,
        message: 'igo.common.dragDrop.cannot.dropInsideItself'
      };
    }
    const isHoverDescendant = this.isHoverDescendant(
      hoveredNode.id,
      hoveredNode
    );
    if (isHoverDescendant) {
      return {
        canDrop: !isHoverDescendant,
        message: 'igo.common.dragDrop.cannot.dropInsideItself'
      };
    }

    const hasMaxLevelRestrictions = this.validateMaxHierarchyLevel(position);
    if (hasMaxLevelRestrictions) {
      return hasMaxLevelRestrictions;
    }

    return {
      canDrop: true,
      message: undefined
    };
  }

  private validateMaxHierarchyLevel(
    position: DropPosition
  ): DropPermission | undefined {
    if (!this.draggedNode) {
      return { canDrop: false };
    }

    const maxLevel = this.maxLevel();
    if (!maxLevel) {
      return undefined;
    }

    let level =
      position.type === 'inside' ? position.level + 1 : position.level;

    if (this.isGroup(this.draggedNode)) {
      // We add an extra level +1 to avoid empty group in group
      level = level + +(this.getDescendantLevels(this.draggedNode) ?? 0) + 1;
    }

    if (level > maxLevel) {
      return {
        canDrop: false,
        message: 'igo.common.dragDrop.cannot.maxLevel',
        params: { value: maxLevel }
      };
    }

    return undefined;
  }

  private getDescendants(node: T): T[] {
    const children = this.childrenAccessor()(node) ?? [];
    const descendants: T[] = [...children];
    children.forEach((child) => {
      descendants.push(...this.getDescendants(child));
    });
    return descendants;
  }

  private isHoverDescendant(id: string | number, _hoveredNode: T): boolean {
    if (!this.draggedNode) return false;
    return this.getDescendants(this.draggedNode).some(
      (child) => child.id === id
    );
  }

  private getPosition(event: DragEvent, hoveredNode: T): DropPosition {
    if (this.draggedNode && this.isGroup(this.draggedNode)) {
      if (this.isHoverDescendant(hoveredNode.id, hoveredNode)) {
        hoveredNode = this.draggedNode;
      }
    }

    let positionType = this.getPositionType(event, hoveredNode);

    const bellowOpenedGroup =
      this.isGroup(hoveredNode) &&
      positionType === 'below' &&
      this.tree().isExpanded(hoveredNode);
    if (bellowOpenedGroup) {
      positionType = 'inside';
    }

    return {
      x: event.x,
      y: this.getPositionY(hoveredNode, positionType),
      level: this.getPositionLevel(hoveredNode, positionType, event.x),
      type: positionType
    };
  }

  private getPositionY(node: T, type: DropPositionType): number {
    const element = this.getNodeElement(node);
    if (!element) return 0;
    const rect = element.getBoundingClientRect();

    return type === 'below'
      ? element.offsetTop + rect.height - 1
      : element.offsetTop + 1;
  }

  private getPositionType(event: DragEvent, hoveredNode: T): DropPositionType {
    const target = this.getNodeElement(hoveredNode);
    if (!target) return 'above';
    const rect = target.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const y = event.y;

    const selfReferencing =
      this.draggedNode && this.draggedNode.id === hoveredNode.id;
    if (this.isGroup(hoveredNode) && !selfReferencing) {
      const tolerence = 5;
      if (y <= middle + tolerence && y >= middle - tolerence) {
        return 'inside';
      }
    }

    const isBelow = y > middle;
    return isBelow ? 'below' : 'above';
  }

  private getPositionLevel(
    hoveredNode: T,
    type: DropPositionType,
    x: number
  ): number {
    const hoveredNodeLevel = this.getNodeLevel(hoveredNode);
    if (hoveredNodeLevel === 0) {
      return 0;
    }

    const ancestor = this.getNodeAncestors(hoveredNode.id);
    if (!ancestor) return hoveredNodeLevel;

    const children = this.getDirectDescendants(ancestor);
    const lastChild = [...children].pop();

    if (type === 'below' && lastChild?.id === hoveredNode.id) {
      const target = this.getNodeElement(hoveredNode);
      if (!target) return hoveredNodeLevel;
      const rect = target.getBoundingClientRect();

      const indentation = 24;
      const xMin = rect.x + indentation;
      const xMax = xMin + indentation * hoveredNodeLevel;

      const isInsideSameGroup = x > xMax;
      if (!isInsideSameGroup) {
        const levelSubstracted = Math.round((xMax - x) / indentation);
        return Math.max(0, hoveredNodeLevel - levelSubstracted);
      }
    }
    return hoveredNodeLevel;
  }

  /**
   * @param level if level is defined with go to the defined levle to find ancestor. Sinon on prend le current ancestor
   */
  private getNodeAncestors(id: string | number, level?: number): T | undefined {
    const path = this.getAncestorsPath(id);
    if (path.length === 0) {
      return undefined;
    }

    if (level !== undefined) {
      return path[level];
    }
    return path[path.length - 1];
  }

  private getAncestorsPath(id: string | number): T[] {
    const nodes = this.nodes();
    const roots = nodes.filter((n) => n.level === 0).map((n) => n.data);

    for (const root of roots) {
      const path: T[] = [];
      if (this.findPath(root, id, path)) {
        return path;
      }
    }

    return [];
  }

  private findPath(
    currentNode: T,
    targetId: string | number,
    path: T[]
  ): boolean {
    if (String(currentNode.id) === String(targetId)) {
      return true;
    }

    const children = this.childrenAccessor()(currentNode) ?? [];
    for (const child of children) {
      path.push(currentNode);
      if (this.findPath(child, targetId, path)) {
        return true;
      }
      path.pop();
    }
    return false;
  }

  private getNodeLevel(node: T): number {
    const treeNode = this.findTreeNode(node.id);
    return treeNode ? treeNode.level : 0;
  }

  private getDirectDescendants(node: T): T[] {
    return this.childrenAccessor()(node) ?? [];
  }

  private findTreeNode(id: string | number): MatTreeNode<T> | undefined {
    return this.nodes().find((n) => String(n.data.id) === String(id));
  }
}
