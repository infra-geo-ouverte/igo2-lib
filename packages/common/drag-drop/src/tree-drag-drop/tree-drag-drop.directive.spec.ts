import { Component, DebugElement, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTree, MatTreeModule, MatTreeNode } from '@angular/material/tree';
import { By } from '@angular/platform-browser';

import { mergeTestConfig } from 'packages/common/test-config';

import { TreeDragDropDirective } from './tree-drag-drop.directive';
import { DropPositionType } from './tree-drag-drop.interface';
import { ITREE_ITEM_MOCK, TREE_MOCK } from './tree-drag-drop.mock';

@Component({
  template: `
    <mat-tree
      #tree
      igoTreeDragDrop
      [tree]="tree"
      [config]="treeConfig"
      [dataSource]="dataSource"
      [childrenAccessor]="childrenAccessor"
    >
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
        <div>Test</div>
      </mat-tree-node>
      <mat-tree-node
        *matTreeNodeDef="let node; when: isGroup"
        matTreeNodeToggle
      >
        <div>Group</div>
      </mat-tree-node>
    </mat-tree>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false
})
class TestComponent {
  readonly tree = viewChild(MatTree);
  dataSource = TREE_MOCK; // Assuming TREE_MOCK is hierarchical
  childrenAccessor = (node: ITREE_ITEM_MOCK) => node.children ?? [];
  isGroup = (_: number, node: ITREE_ITEM_MOCK) => !!node.children;
  treeConfig = {
    isGroup: (node: ITREE_ITEM_MOCK) => !!node.children,
    descendantLevels: (node: ITREE_ITEM_MOCK) => (node.children?.length ? 1 : 0) // Simplified for mock
  };
}

describe('DragDropTreeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: TreeDragDropDirective;
  let treeNodesDebug: DebugElement[];

  beforeEach(() => {
    fixture = TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [MatTreeModule, TreeDragDropDirective],
        declarations: [TestComponent]
      })
    ).createComponent(TestComponent);

    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(
      By.directive(TreeDragDropDirective)
    );
    directive = debugElement.injector.get(TreeDragDropDirective);

    treeNodesDebug = fixture.debugElement.queryAll(By.directive(MatTreeNode));
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should add draggable attributes on tree nodes', () => {
    expect(treeNodesDebug.length).toBeGreaterThan(0);
    treeNodesDebug.forEach((node) => {
      const element = node.nativeElement;
      expect(element.getAttribute('draggable')).toBe('true');
    });
  });

  it('should handle drag start and end events', () => {
    const treeNode = treeNodesDebug[0].nativeElement;
    const dragStartEvent = new DragEvent('dragstart');
    const dragEndEvent = new DragEvent('dragend');

    spyOn(directive, 'onDragStart').and.callThrough();
    spyOn(directive, 'dragEnd').and.callThrough();

    treeNode.dispatchEvent(dragStartEvent);
    expect(directive.onDragStart).toHaveBeenCalled();

    treeNode.dispatchEvent(dragEndEvent);
    expect(directive.dragEnd).toHaveBeenCalled();
  });

  it('should handle drag over and leave events', () => {
    const treeNodeDragged = treeNodesDebug[1].nativeElement;
    const treeNode = treeNodesDebug[0].nativeElement;
    const dragStartEvent = new DragEvent('dragstart');
    const dragOverEvent = new DragEvent('dragover');
    const dragLeaveEvent = new DragEvent('dragleave');

    treeNodeDragged.dispatchEvent(dragStartEvent);

    spyOn(directive, 'dragOver').and.callThrough();
    spyOn(directive, 'dragLeave').and.callThrough();

    treeNode.dispatchEvent(dragOverEvent);
    expect(directive.dragOver).toHaveBeenCalled();

    treeNode.dispatchEvent(dragLeaveEvent);
    expect(directive.dragLeave).toHaveBeenCalled();
  });

  it('should handle drop event', () => {
    const treeNodeDragged = treeNodesDebug[1].nativeElement;
    const treeNode = treeNodesDebug[0].nativeElement;

    const dropEvent = new DragEvent('drop');
    const dragStartEvent = new DragEvent('dragstart');
    const dragOverEvent = new DragEvent('dragover');

    treeNodeDragged.dispatchEvent(dragStartEvent);
    treeNode.dispatchEvent(dragOverEvent);

    spyOn(directive, 'drop').and.callThrough();
    spyOn(directive.dropped, 'emit').and.callThrough();

    directive.drop(dropEvent);
    expect(directive.drop).toHaveBeenCalledWith(dropEvent);
  });

  it('should emit onDrop event with correct data', () => {
    const draggedNode = fixture.componentInstance.dataSource[0].children[0];
    const ref = fixture.componentInstance.dataSource[1];
    const position: DropPositionType = 'inside';

    spyOn<any>(directive, 'getPosition').and.returnValue({
      x: 0,
      y: 0,
      level: 1,
      type: position
    });
    spyOn(directive.dropped, 'emit').and.callThrough();

    directive.draggedNode = draggedNode;
    directive.dropNodeTarget.set(ref);
    directive.drop(new DragEvent('drop'));

    expect(directive.dropped.emit).toHaveBeenCalledWith({
      node: draggedNode,
      ref,
      position
    });
  });

  it('should allow dropping a group into another group', () => {
    const draggedGroup = fixture.componentInstance.dataSource[1]; // Node 3
    const targetGroup = fixture.componentInstance.dataSource[0]; // Node 1
    const position: DropPositionType = 'inside';

    spyOn<any>(directive, 'getPosition').and.returnValue({
      x: 0,
      y: 0,
      level: 1, // Dropping inside level 0 -> level 1
      type: position
    });
    spyOn(directive.dropped, 'emit').and.callThrough();
    spyOn(directive.droppedError, 'emit').and.callThrough();

    directive.draggedNode = draggedGroup;
    directive.dropNodeTarget.set(targetGroup);
    directive.drop(new DragEvent('drop'));

    expect(directive.droppedError.emit).not.toHaveBeenCalled();
    expect(directive.dropped.emit).toHaveBeenCalled();
  });

  it('should prevent dropping a group into its own descendant', () => {
    const nodes = directive.nodes();

    const parentNode = nodes.find((n) => n.data?.id === '1')?.data;
    if (!parentNode) {
      throw new Error('Parent node not found');
    }

    // Expand parent node to ensure descendants are rendered/found
    directive.tree().expand(parentNode);
    fixture.detectChanges();

    const nodesAfterExpand = directive.nodes();

    const childNode = nodesAfterExpand.find((n) => n.data?.id === '2')?.data;
    const siblingNode = nodesAfterExpand.find((n) => n.data?.id === '3')?.data;

    directive.draggedNode = parentNode;

    directive['nodesEffect']?.destroy();

    if (!childNode) {
      throw new Error('Child node not found');
    }
    if (!siblingNode) {
      throw new Error('Sibling node not found');
    }

    expect(directive['isHoverDescendant'](childNode.id, childNode)).toBe(true);
    expect(directive['isHoverDescendant'](siblingNode.id, siblingNode)).toBe(
      false
    );
  });
});

// describe('DragDropTreeDirective - NodeGroup', () => {
//   it('should not drop into itself', () => {});
//   it('should not hover children', () => {});
//   it('should active inside on hover', () => {});
// });

// describe('DragDropTreeDirective - NodeItem', () => {
//   it('should not hover with "inside" itself', () => {});
//   it('should drop into a group', () => {});
// });
