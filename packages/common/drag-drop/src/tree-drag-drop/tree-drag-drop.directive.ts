import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  booleanAttribute
} from '@angular/core';
import { MatTreeNode } from '@angular/material/tree';

import {
  DropPosition,
  DropPositionType,
  TreeFlatNode
} from './tree-drag-drop.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TreeDropEvent<T = any> {
  node: TreeFlatNode<T>;
  ref: TreeFlatNode<T>;
  position: DropPositionType;
}

interface DragNodeListeners {
  element: HTMLElement;
  listeners: [string, EventListenerOrEventListenerObject][];
}

export interface DropPermission {
  canDrop: boolean;
  message?: string;
  params?: Record<string, unknown>;
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
  standalone: true
})
export class TreeDragDropDirective implements AfterContentInit, OnDestroy {
  draggedNode: TreeFlatNode;
  dropNodeTarget: TreeFlatNode;
  expandTimeout: number;
  nodesListeners: DragNodeListeners[] | undefined;
  dropLineTarget: HTMLElement;
  highlightedNode = new SelectionModel<TreeFlatNode>();

  @Input({ required: true }) treeControl: FlatTreeControl<TreeFlatNode>;

  /** The default is 5 */
  @Input() maxLevel = 5;

  @Input({ transform: booleanAttribute })
  set treeDragDropIsDisabled(disabled: boolean) {
    this.isDisabled = disabled;
    disabled ? this.removeAllListener() : this.addAllListener();
  }
  private isDisabled = false;

  @Output() dragStart = new EventEmitter<TreeFlatNode>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onDrop = new EventEmitter<TreeDropEvent>(null);

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onDropError = new EventEmitter<DropPermission>();

  @HostListener('dragover', ['$event']) hostDragOver(event: Event): void {
    event.preventDefault();
  }

  @HostListener('drop', ['$event']) hostDrop(event: DragEvent): void {
    this.drop(event);
  }

  @HostBinding('class.--dragging') dragging: boolean;

  @ContentChildren(MatTreeNode, { descendants: true })
  nodes: QueryList<MatTreeNode<TreeFlatNode>>;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.onDrop.subscribe(() => this.dragEnd());

    this.highlightedNode.changed.subscribe((change) => {
      if (change.removed.length) {
        this.removeNodeClass(change.removed[0].id, '--drag-hover');
      }

      if (change.added.length) {
        this.addNodeClass(change.added[0].id, '--drag-hover');
      }
    });
  }

  ngAfterContentInit(): void {
    this.nodes.changes.subscribe(() => {
      this.addAllListener();
    });
  }

  ngOnDestroy(): void {
    this.removeAllListener();
  }

  onDragStart(node: TreeFlatNode): void {
    this.dragging = true;
    this.draggedNode = node;
    this.addNodeClass(node.id, '--dragged');

    this.dragStart.emit(node);
  }

  dragEnd(): void {
    this.dragging = false;
    if (this.draggedNode) {
      this.removeNodeClass(this.draggedNode.id, '--dragged');
      this.draggedNode = null;
    }

    this.dragLeave();
    this.removeDropTargetLine();
  }

  dragOver(node: TreeFlatNode, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dropNodeTarget = node;

    const position = this.getPosition(event, node);

    this.updateDropTargetLinePosition(position);

    this.setHighlightedNode(node);

    this.handleGroupExpansion(node, position.type === 'inside');
  }

  dragLeave(): void {
    clearTimeout(this.expandTimeout);
    this.expandTimeout = null;
    this.highlightedNode.clear();
  }

  drop(event: DragEvent): void {
    if (!this.dropNodeTarget || this.isDisabled) {
      return;
    }

    const dropPosition: DropPosition = this.getPosition(
      event,
      this.dropNodeTarget
    );

    const validation = this.canDropNode(this.dropNodeTarget, dropPosition);
    if (!validation.canDrop) {
      this.onDropError.emit(validation);
      return;
    }

    // Allow to drop a last child outside is group. We refer to it's ancestor for the target
    if (
      dropPosition.type === 'below' &&
      dropPosition.level !== this.dropNodeTarget.level
    ) {
      this.dropNodeTarget = this.getNodeAncestors(
        this.dropNodeTarget.id,
        dropPosition.level
      );
    }

    if (this.dropNodeTarget.isGroup) {
      if (dropPosition.type === 'inside') {
        const isExpanded = this.treeControl.isExpanded(this.dropNodeTarget);
        if (isExpanded) {
          const children = this.getDirectDescendants(this.dropNodeTarget);
          if (children[0]?.id === this.draggedNode.id) {
            return;
          }
        }

        this.treeControl.expand(this.dropNodeTarget);
        return this.onDrop.emit({
          node: this.draggedNode,
          ref: this.dropNodeTarget,
          position: dropPosition.type
        });
      }
    }

    if (
      dropPosition.type === 'below' &&
      dropPosition.level !== this.dropNodeTarget.level
    ) {
      const ancestor = this.getNodeAncestors(this.dropNodeTarget.id);
      return this.onDrop.emit({
        node: this.draggedNode,
        ref: ancestor,
        position: dropPosition.type
      });
    }

    this.onDrop.emit({
      node: this.draggedNode,
      ref: this.dropNodeTarget,
      position: dropPosition.type
    });
  }

  private addNodeClass(id: string, className: string): void {
    const node = this.nodes.find((node) => node.data.id === id);
    this.renderer.addClass(node['_elementRef'].nativeElement, className);
  }

  private removeNodeClass(id: string, className: string): void {
    const node = this.nodes.find((node) => node.data.id === id);
    this.renderer.removeClass(node['_elementRef'].nativeElement, className);
  }

  private addAllListener(): void {
    if (this.isDisabled) {
      return;
    }
    const nodes = this.nodes?.toArray();
    if (this.nodesListeners) {
      this.removeAllListener();
    }

    this.nodesListeners = nodes?.map((node) => this.addListener(node));
  }

  private addListener(node: MatTreeNode<TreeFlatNode>): DragNodeListeners {
    const element = node['_elementRef'].nativeElement as HTMLElement;
    const listeners: [string, EventListenerOrEventListenerObject][] = [
      ['dragstart', () => this.onDragStart(node.data)],
      ['dragend', () => this.dragEnd()],
      ['dragover', (event: DragEvent) => this.dragOver(node.data, event)],
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
    this.nodesListeners = null;
  }

  private setHighlightedNode(node: TreeFlatNode): void {
    const toHighlight = node.isGroup ? node : this.getNodeAncestors(node.id);
    toHighlight
      ? this.highlightedNode.select(toHighlight)
      : this.highlightedNode.clear();
  }

  private addDropTargetLine(): void {
    const target: HTMLElement = this.renderer.createElement('div');
    target.classList.add('drop-target-line');
    target.setAttribute(
      'style',
      `position: absolute; top: 0; width: 100%; pointer-events: none; z-index: 4; height: 2px; background-color: black; transition: margin-left 150ms;`
    );
    this.dropLineTarget = target;
    this.renderer.appendChild(
      this.elementRef.nativeElement.parentElement,
      this.dropLineTarget
    );
  }

  private removeDropTargetLine(): void {
    if (!this.dropLineTarget) {
      return;
    }
    this.renderer.removeChild(
      this.elementRef.nativeElement.parentElement,
      this.dropLineTarget
    );
    this.dropLineTarget = null;
  }

  private updateDropTargetLinePosition(position: DropPosition): void {
    if (!this.dropLineTarget) {
      this.addDropTargetLine();
    }

    if (position.type === 'inside') {
      return this.removeDropTargetLine();
    }

    this.renderer.setStyle(
      this.dropLineTarget,
      'margin-left',
      position.level * 24 + 20 + 'px'
    );
    this.renderer.setStyle(
      this.dropLineTarget,
      'transform',
      'translate3d(0,' + position.y + 'px, 0)'
    );
  }

  private handleGroupExpansion(node: TreeFlatNode, isInside: boolean): void {
    if (!isInside) {
      return this.dragLeave();
    }
    const isOpen = this.treeControl.isExpanded(node);
    if (!isOpen && !this.expandTimeout) {
      this.expandTimeout = window.setTimeout(() => {
        this.treeControl.expand(node);
      }, 1200);
    }
  }

  private getNodeElement(node: TreeFlatNode): HTMLElement | undefined {
    const treeNode = this.nodes.find((n) => n.data.id === node.id);
    return treeNode?.['_elementRef'].nativeElement;
  }

  private canDropNode(
    hoveredNode: TreeFlatNode,
    position: DropPosition
  ): DropPermission {
    if (this.draggedNode.isGroup) {
      return this.canDropGroup(hoveredNode, position);
    }

    const hasMaxLevelRestrictions = this.validateMaxHierarchyLevel(position);
    if (hasMaxLevelRestrictions) {
      return hasMaxLevelRestrictions;
    }

    return { canDrop: true };
  }

  private canDropGroup(
    hoveredNode: TreeFlatNode,
    position: DropPosition
  ): DropPermission {
    // On ne veut pas permettre le Drop pour un groupe qui s'auto référence
    if (hoveredNode.id === this.draggedNode.id) {
      return {
        canDrop: false,
        message: 'igo.common.dragDrop.cannot.dropInsideItself'
      };
    }

    const hasMaxLevelRestrictions = this.validateMaxHierarchyLevel(position);
    if (hasMaxLevelRestrictions) {
      return hasMaxLevelRestrictions;
    }

    const isHoverDescendant = this.isHoverDescendant(hoveredNode.id);
    return {
      canDrop: !isHoverDescendant,
      message:
        isHoverDescendant && 'igo.common.dragDrop.cannot.dropInsideItself'
    };
  }

  private validateMaxHierarchyLevel(position: DropPosition): DropPermission {
    if (!this.maxLevel) {
      return;
    }

    let level =
      position.type === 'inside' ? position.level + 1 : position.level;

    if (this.draggedNode.isGroup) {
      // We add an extra level +1 to avoid empty group in group
      level = level + (this.draggedNode.descendantLevels ?? 0) + 1;
    }

    if (level > this.maxLevel) {
      return {
        canDrop: false,
        message: 'igo.common.dragDrop.cannot.maxLevel',
        params: { value: this.maxLevel }
      };
    }
  }

  private isHoverDescendant(id: string): boolean {
    return this.treeControl
      .getDescendants(this.draggedNode)
      .some((child) => child.id === id);
  }

  private getPosition(
    event: DragEvent,
    hoveredNode: TreeFlatNode
  ): DropPosition {
    if (this.draggedNode.isGroup) {
      if (this.isHoverDescendant(hoveredNode.id)) {
        hoveredNode = this.draggedNode;
      }
    }

    let positionType = this.getPositionType(event, hoveredNode);

    const bellowOpenedGroup =
      hoveredNode.isGroup &&
      positionType === 'below' &&
      this.treeControl.isExpanded(hoveredNode);
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

  private getPositionY(node: TreeFlatNode, type: DropPositionType): number {
    const element = this.getNodeElement(node);
    const rect = element.getBoundingClientRect();

    return type === 'below'
      ? element.offsetTop + rect.height - 1
      : element.offsetTop + 1;
  }

  private getPositionType(
    event: DragEvent,
    hoveredNode: TreeFlatNode
  ): DropPositionType {
    const target = this.getNodeElement(hoveredNode);
    const rect = target.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const y = event.y;

    const selfReferencing = this.draggedNode.id === hoveredNode.id;
    if (hoveredNode.isGroup && !selfReferencing) {
      const tolerence = 5;
      if (y <= middle + tolerence && y >= middle - tolerence) {
        return 'inside';
      }
    }

    const isBelow = y > middle;
    return isBelow ? 'below' : 'above';
  }

  private getPositionLevel(
    hoveredNode: TreeFlatNode,
    type: DropPositionType,
    x: number
  ): number {
    if (hoveredNode.level === 0) {
      return 0;
    }

    const ancestor = this.getNodeAncestors(hoveredNode.id);
    const children = this.getDirectDescendants(ancestor);
    const lastChild = [...children].pop();

    if (type === 'below' && lastChild.id === hoveredNode.id) {
      const target = this.getNodeElement(hoveredNode);
      const rect = target.getBoundingClientRect();

      const indentation = 24;
      const xMin = rect.x + indentation;
      const xMax = xMin + indentation * hoveredNode.level;

      const isInsideSameGroup = x > xMax;
      if (!isInsideSameGroup) {
        const levelSubstracted = Math.round((xMax - x) / indentation);
        return Math.max(0, hoveredNode.level - levelSubstracted);
      }
    }

    return hoveredNode.level;
  }

  /**
   * @param level if level is defined with go to the defined levle to find ancestor. Sinon on prend le current ancestor
   */
  private getNodeAncestors(
    id: string,
    level?: number
  ): TreeFlatNode | undefined {
    const nodes = this.treeControl.dataNodes;
    const index = nodes.findIndex((node) => node.id === id);

    const targetLevel = level ?? Math.max(0, nodes[index].level - 1);
    return nodes
      .slice(0, index)
      .reverse()
      .find((node) => node.level === targetLevel);
  }

  private getDirectDescendants(node: TreeFlatNode): TreeFlatNode[] {
    const level = node.level + 1;
    return this.treeControl
      .getDescendants(node)
      .filter((child) => child.level === level);
  }
}
